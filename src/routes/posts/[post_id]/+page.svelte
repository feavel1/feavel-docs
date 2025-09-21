<script lang="ts" module>
	import { z } from 'zod';

	const editorBlockSchema = z.object({
		id: z.string().optional(),
		type: z.string().min(1),
		data: z.record(z.any()).optional()
	});

	export const postSchema = z.object({
		id: z.number().optional(),
		title: z.string().max(100).nullable(),
		content: z
			.object({
				blocks: z.array(editorBlockSchema).optional(),
				version: z.string().optional()
			})
			.nullable(),
		post_cover: z.string().max(255).nullable(),
		public_visibility: z.boolean(),
		tags: z.array(z.string().min(1).max(30)).max(10)
	});

	export type PostSchema = typeof postSchema;
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Eye, User, Calendar } from '@lucide/svelte';
	import { Switch } from '$lib/components/ui/switch';
	import { toast } from 'svelte-sonner';
	import CommentSection from '$lib/components/modules/content/CommentSection.svelte';
	import PostAuthor from '$lib/components/modules/content/PostAuthor.svelte';
	import Editor from '$lib/components/modules/content/Editor.svelte';
	import MultiSelect from '$lib/components/modules/interactive/MultiSelect.svelte';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import * as Form from '$lib/components/ui/form';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { getPostCoverUrl } from '$lib/utils/storage';
	import { handlePostCoverUpload, updatePost, deletePost } from '$lib/utils/posts';
	import LikeButton from '$lib/components/modules/interactive/LikeButton.svelte';
	import GradientGenerator from '$lib/components/modules/content/GradientGenerator.svelte';

	let { data } = $props();
	const { post, session, supabase, tags = [] } = data;

	// Prepare initial form data from post
	const initialFormData = {
		id: post.id,
		title: post.title,
		content: post.content_v2,
		post_cover: post.post_cover,
		public_visibility: post.public_visibility,
		tags: post.posts_tags_rel
			? post.posts_tags_rel.map(
					(rel: { post_tags: { tag_name: string } }) => rel.post_tags.tag_name
				)
			: []
	};

	const form = superForm(initialFormData, {
		validators: zodClient(postSchema),
		validationMethod: 'oninput',
		dataType: 'json',
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'failure' && form.errors && Object.keys(form.errors).length) {
				requestAnimationFrame(() => {
					document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
				});
			}
		},
		onUpdated({ form }) {
			if (form.message) toast.success(form.message.text);
		}
	});

	const { form: formValues, enhance, submitting } = form;

	const canEdit = post.user_id === session?.user?.id;
	const postUser = post.users.username;
	const postDate = new Date(post.created_at).toLocaleDateString();

	let coverPreview = $state('');
	let saveSuccess = $state(false);

	const coverUrl = $derived(
		coverPreview ||
			($formValues.post_cover ? getPostCoverUrl($formValues.post_cover, supabase) : null) ||
			(post.post_cover ? getPostCoverUrl(post.post_cover, supabase) : null)
	);

	function handleCoverFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			toast.error('File size must be less than 5MB');
			return;
		}

		handlePostCoverUpload(supabase, file).then((filename) => {
			if (filename) {
				$formValues.post_cover = filename;
				coverPreview = getPostCoverUrl(filename, supabase);
				toast.success('Cover image uploaded successfully');
			} else {
				toast.error('Failed to upload cover image');
			}
		});
	}

	async function handleSave() {
		const isValid = await form.validateForm();
		if (!isValid.valid) {
			requestAnimationFrame(() => {
				document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
			});
			return;
		}

		try {
			// Server already validated session, no need to check again
			const postData = {
				title: $formValues.title,
				content: $formValues.content,
				public_visibility: $formValues.public_visibility,
				tags: $formValues.tags,
				cover: $formValues.post_cover
			};

			const { success, error } = await updatePost(supabase, session?.user?.id!, post.id, postData);
			if (success) {
				saveSuccess = true;
				toast.success('Post saved successfully!');
				// Reset success state after 2 seconds
				setTimeout(() => {
					saveSuccess = false;
				}, 2000);
			} else {
				toast.error(error || 'Failed to save post');
			}
		} catch (error) {
			console.error('Error saving post:', error);
			toast.error('Failed to save post');
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this post? This action cannot be undone.'))
			return;

		try {
			// Server already validated session, no need to check again
			const { success, error } = await deletePost(supabase, session?.user?.id!, post.id);
			if (success) {
				toast.success('Post deleted successfully!');
				window.location.href = '/posts';
			} else {
				toast.error(error || 'Failed to delete post');
			}
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Failed to delete post');
		}
	}

	function handleContentChange(content: any) {
		$formValues.content = content;
	}

	function handleCoverRemove() {
		coverPreview = '';
		$formValues.post_cover = null;
	}
</script>

<svelte:head>
	<title>{post.title || 'Post Not Found'}</title>
	<meta name="description" content={post.title || 'Blog post'} />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<Button variant="ghost" class="mb-6" href="/posts">
		<ArrowLeft class="mr-2 h-4 w-4" /> Back to Posts
	</Button>

	<form method="POST" use:enhance>
		<!-- Cover Image -->
		<div class="mb-6 overflow-hidden rounded-lg">
			<div class="group relative">
				{#if canEdit}
					<button
						type="button"
						class="h-48 w-full cursor-pointer border-0 bg-transparent p-0 sm:h-64"
						onclick={() => document.getElementById('cover-input')?.click()}
						aria-label="Change cover image"
					>
						<div class="relative h-full w-full">
							{#if coverUrl}
								<img
									src={coverUrl}
									alt={post.title || 'Cover image'}
									class="h-full w-full object-cover"
								/>
							{:else}
								<GradientGenerator />
							{/if}
							<div
								class="absolute inset-0 flex items-center justify-center opacity-50 transition-opacity hover:bg-gray-400"
							>
								<span class="text-lg font-medium text-white">Click to change cover image</span>
							</div>
						</div>
					</button>
					<Input
						type="file"
						id="cover-input"
						accept="image/*"
						onchange={handleCoverFileSelect}
						class="hidden"
					/>
					{#if $formValues.post_cover || coverPreview}
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={handleCoverRemove}
							class="absolute top-2 right-2"
						>
							Remove Cover
						</Button>
					{/if}
				{:else}
					<div class="relative h-48 w-full sm:h-64">
						{#if coverUrl}
							<img
								src={coverUrl}
								alt={post.title || 'Cover image'}
								class="h-full w-full object-cover"
							/>
						{:else}
							<GradientGenerator />
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Header -->
		<div class="mb-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div class="flex-1">
					<Form.Field {form} name="title">
						<Form.Control>
							{#snippet children({ props })}
								<Input
									{...props}
									bind:value={$formValues.title}
									readonly={!canEdit}
									class="w-full border-0 py-4 text-4xl font-bold shadow-none focus:ring-0 focus:ring-offset-0 {canEdit
										? 'cursor-text'
										: 'cursor-default bg-transparent'}"
									placeholder="Post title..."
								/>
							{/snippet}
						</Form.Control>
					</Form.Field>
					<div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
						<div class="flex items-center gap-1">
							<User class="h-4 w-4" />
							<span>{postUser}</span>
						</div>
						<div class="flex items-center gap-1">
							<Calendar class="h-4 w-4" />
							<span>{postDate}</span>
						</div>
						<div class="flex items-center gap-1">
							<Eye class="h-4 w-4" />
							<span>{post.post_views || 0} views</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Tags -->
		{#if !canEdit}
			<div class="mb-6">
				<!-- Tags Display -->
				<div class="flex flex-wrap gap-2">
					{#if post.posts_tags_rel?.length}
						{#each post.posts_tags_rel as relation}
							<Button
								variant="outline"
								size="sm"
								href={`/posts?tags=${encodeURIComponent(relation.post_tags.tag_name)}`}
								class="h-6 px-2 text-xs"
							>
								{relation.post_tags.tag_name}
							</Button>
						{/each}
					{:else}
						<span class="text-sm text-muted-foreground">No tags</span>
					{/if}
				</div>
			</div>
		{:else}
			<div class="mt-3 flex flex-row items-center justify-between gap-4">
				<!-- Public/draft Settings -->
				<div class="flex items-center gap-2">
					<Switch bind:checked={$formValues.public_visibility} id="public-visibility" />
					<label for="public-visibility" class="text-sm font-medium">Public</label>
				</div>

				<MultiSelect
					items={tags.map((tag) => ({ id: tag, tag_name: tag }))}
					bind:selectedItems={$formValues.tags}
					itemNameProperty="tag_name"
					allowNewItems={true}
				/>
			</div>
		{/if}

		<!-- Content -->

		{#if canEdit || post.content_v2}
			<div class="mt-6">
				<Editor
					content={post.content_v2}
					readOnly={!canEdit}
					onChange={canEdit ? handleContentChange : () => {}}
					class="min-h-[500px]"
				/>
			</div>
		{:else}
			<p class="text-muted-foreground">No content available.</p>
		{/if}
	</form>

	<!-- Action Section -->

	<div class="mt-6 flex flex-row items-center justify-between gap-4">
		<!-- Like Button -->
		<LikeButton postId={post.id} {supabase} currentUserId={session?.user?.id} />

		{#if canEdit}
			<!-- Action Buttons -->
			<div class="flex items-center gap-2">
				<Button variant="outline" onclick={handleDelete} disabled={$submitting}>Delete</Button>
				<Button
					onclick={handleSave}
					disabled={$submitting}
					variant={saveSuccess ? 'secondary' : 'default'}
				>
					{#if $submitting}
						Saving...
					{:else if saveSuccess}
						Saved!
					{:else}
						Save
					{/if}
				</Button>
			</div>
		{/if}
	</div>

	<!-- Author & Comments -->
	<PostAuthor {post} {supabase} />

	<CommentSection
		postId={post.id}
		postAuthorId={post.user_id}
		currentUserId={session?.user?.id}
		currentUser={session?.user}
		{supabase}
	/>
</div>
