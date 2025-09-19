<script lang="ts" module>
	import { z } from 'zod';

	// Define schemas for post validation
	const editorBlockSchema = z.object({
		id: z.string().optional(),
		type: z.string().min(1, { message: 'Block type is required' }),
		data: z.record(z.any()).optional()
	});

	export const postSchema = z.object({
		id: z.number().optional(),
		title: z.string().max(200, { message: 'Title must be less than 200 characters' }).nullable(),
		content: z
			.object({
				blocks: z.array(editorBlockSchema).optional(),
				version: z.string().optional()
			})
			.nullable(),
		post_cover: z.string().max(255, { message: 'Cover filename is too long' }).nullable(),
		public_visibility: z.boolean(),
		tags: z.array(z.string().min(1).max(30)).max(10, { message: 'You can select up to 10 tags' })
	});

	export type PostSchema = typeof postSchema;
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Eye, User, Calendar } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import CommentSection from '$lib/components/modules/content/CommentSection.svelte';
	import PostActions from '$lib/components/modules/content/PostActions.svelte';
	import PostAuthor from '$lib/components/modules/content/PostAuthor.svelte';
	import Editor from '$lib/components/modules/content/Editor.svelte';
	import MultiSelect from '$lib/components/modules/interactive/MultiSelect.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { getPostCoverUrl } from '$lib/utils/storage';

	let { data } = $props();
	// Extract only necessary properties
	const { post, session, supabase, tags = [], isNewPost = false, form: formData } = data;

	// Initialize form with better error handling
	const form = superForm(formData, {
		validators: zodClient(postSchema),
		dataType: 'json',
		resetForm: false,
		onResult: ({ result }) => {
			// Handle form submission results
			if (result.type === 'failure' && form.errors && Object.keys(form.errors).length) {
				// Focus on first error
				requestAnimationFrame(() => {
					document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
				});

				// Show error toast
				if (result.data?.message) {
					toast.error(result.data.message);
				}
			} else if (result.type === 'success' && result.data?.message) {
				// Show success message
				toast.success(result.data.message);
			}
		}
	});

	const { form: formValues, enhance, submitting } = form;

	let isEditing = $derived(isNewPost || (form.errors && Object.keys(form.errors).length > 0));
	let isAuthor = $derived(post?.user_id === session?.user?.id);

	let isNewPostCreated = $state(false);

	let coverPreview = $state<string>('');

	function handleEdit() {
		// Show the editor
	}

	function handleCancel() {
		// If we're canceling a new post that hasn't been saved, redirect to posts list
		if (isNewPost && !isNewPostCreated) {
			goto('/posts');
			return;
		}
		// Reset file state
		coverPreview = '';
		// Reset form to initial values
		form.reset();
	}

	async function handleCoverFileSelect(event: Event) {
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

		coverPreview = URL.createObjectURL(file);

		// Upload the cover image immediately
		try {
			const formData = new FormData();
			formData.append('cover', file);

			const response = await fetch('?/uploadCover', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (response.ok && result.coverFilename) {
				// Update the form value with the new cover filename
				$formValues.post_cover = result.coverFilename;

				// Show success message if provided
				if (result.message) {
					toast.success(result.message);
				}
			} else {
				// Show error message
				const errorMessage = result.message || 'Failed to upload cover image';
				toast.error(errorMessage);

				// Reset preview on error
				coverPreview = '';
			}
		} catch (error) {
			console.error('Error uploading cover image:', error);
			toast.error('Failed to upload cover image. Please try again.');

			// Reset preview on error
			coverPreview = '';
		}
	}

	function handleTitleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		$formValues.title = target.value;
	}

	function handleContentChange(content: any) {
		if (isEditing) {
			$formValues.content = content;
		}
	}

	function handleCoverRemove() {
		coverPreview = '';
		$formValues.post_cover = null;
	}

	function handlePublicChange(e: Event) {
		const target = e.target as HTMLInputElement;
		$formValues.public_visibility = target.checked;
	}
</script>

<svelte:head>
	<title>{post?.title || 'Post Not Found'}</title>
	<meta name="description" content={post?.title || 'Blog post'} />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<!-- Back Button -->
	<Button variant="ghost" class="mb-6" href="/posts">
		<ArrowLeft class="mr-2 h-4 w-4" />
		Back to Posts
	</Button>

	{#if post}
		<form method="POST" action="?/save" use:enhance>
			<div class="mb-6">
				<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div class="flex-1">
						{#if isEditing}
							<Input
								bind:value={$formValues.title}
								class="mb-3 text-3xl font-bold sm:text-4xl"
								placeholder="Post title"
								onchange={handleTitleChange}
							/>
						{:else}
							<h1 class="mb-3 text-3xl font-bold sm:text-4xl">
								{post.title}
							</h1>
						{/if}
						<div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
							<div class="flex items-center gap-1">
								<User class="h-4 w-4" />
								<span>{post.users?.username || 'Unknown'}</span>
							</div>
							<div class="flex items-center gap-1">
								<Calendar class="h-4 w-4" />
								<span>{new Date(post.created_at).toLocaleDateString()}</span>
							</div>
							<div class="flex items-center gap-1">
								<Eye class="h-4 w-4" />
								<span>{post.post_views || 0} views</span>
							</div>
						</div>
					</div>
					{#if isAuthor && !isEditing}
						<Button variant="outline" onclick={handleEdit} size="sm">Edit</Button>
					{/if}
				</div>

				{#if isEditing}
					<div class="mb-6 space-y-3">
						<Label for="cover">Cover Image (optional)</Label>
						<div class="mt-2 space-y-2">
							<Input type="file" accept="image/*" onchange={handleCoverFileSelect} />
							{#if coverPreview || $formValues.post_cover}
								<div class="mt-2">
									<img
										src={coverPreview ||
											($formValues.post_cover
												? getPostCoverUrl($formValues.post_cover, supabase)
												: '')}
										alt={coverPreview ? 'Cover preview' : 'Cover image'}
										class="h-32 w-full rounded-md object-cover"
									/>
								</div>
							{/if}
							{#if coverPreview || $formValues.post_cover}
								<Button type="button" variant="outline" size="sm" onclick={handleCoverRemove}>
									Remove Cover
								</Button>
							{/if}
						</div>
					</div>
				{:else if post.post_cover}
					<div class="mb-6 overflow-hidden rounded-lg">
						<img
							src={getPostCoverUrl(post.post_cover, supabase)}
							alt={post.title}
							class="h-48 w-full object-cover sm:h-64"
						/>
					</div>
				{/if}

				{#if isEditing}
					<div class="mb-6 space-y-4">
						<div class="flex items-center justify-between rounded-lg border p-4">
							<div>
								<h3 class="font-medium">Publishing Settings</h3>
								<p class="mt-1 text-sm text-muted-foreground">
									{$formValues.public_visibility
										? 'This post will be visible to everyone.'
										: 'This post will be saved as a draft.'}
								</p>
							</div>
							<div class="flex items-center gap-2">
								<span class="text-sm text-muted-foreground">Draft</span>
								<Switch
									bind:checked={$formValues.public_visibility}
									onchange={handlePublicChange}
								/>
								<span class="text-sm text-muted-foreground">Public</span>
							</div>
						</div>
						<div class="space-y-2">
							<Label>Tags</Label>
							<MultiSelect
								items={tags.map((tag) => ({ id: tag, tag_name: tag }))}
								bind:selectedItems={$formValues.tags}
								itemNameProperty="tag_name"
								placeholder="Select tags..."
								label=""
								showSearch={true}
								searchPlaceholder="Search tags..."
								emptyMessage="No tags found."
							/>
						</div>
					</div>
				{:else if post.posts_tags_rel?.length}
					<div class="mb-6 flex flex-wrap gap-2">
						{#each post.posts_tags_rel as relation (relation.post_tags.tag_name)}
							<Button
								variant="outline"
								size="sm"
								href={`/posts?tags=${encodeURIComponent(relation.post_tags.tag_name)}`}
								class="h-6 px-2 text-xs"
							>
								{relation.post_tags.tag_name}
							</Button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Post Content -->
			<Card>
				<CardContent class="p-4 sm:p-6">
					{#if isEditing}
						<div class="prose prose-lg max-w-none">
							<Editor
								content={$formValues.content}
								readOnly={false}
								onChange={handleContentChange}
								class="min-h-[500px]"
							/>
						</div>
					{:else if post.content_v2}
						<div class="prose prose-lg max-w-none">
							<Editor content={post.content_v2} readOnly={true} onChange={handleContentChange} />
						</div>
					{:else if post.content}
						<!-- Fallback for legacy content -->
						<div class="prose prose-lg max-w-none">
							{@html post.content}
						</div>
					{:else}
						<p class="text-muted-foreground">No content available.</p>
					{/if}
				</CardContent>
			</Card>

			<!-- Save button for the form -->
			{#if isEditing}
				<div class="mt-4 flex justify-end gap-2">
					<Button type="button" variant="outline" onclick={handleCancel} disabled={$submitting}>
						Cancel
					</Button>
					<Button type="submit" name="submit" disabled={$submitting}>
						{#if $submitting}
							Saving...
						{:else}
							Save Post
						{/if}
					</Button>
				</div>
			{/if}
		</form>

		<PostActions {post} {supabase} currentUserId={session?.user?.id} />

		<PostAuthor {post} {supabase} />

		<!-- Comments Section -->
		<CommentSection
			postId={post.id}
			postAuthorId={post.user_id}
			currentUserId={session?.user?.id}
			currentUser={session?.user}
			{supabase}
		/>
	{:else}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<div class="mb-4 rounded-full bg-muted p-4">
				<Eye class="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 class="mb-2 text-lg font-semibold">Post Not Found</h3>
			<p class="mb-4 text-muted-foreground">
				The post you're looking for doesn't exist or has been removed.
			</p>
			<Button href="/posts">
				<ArrowLeft class="mr-2 h-4 w-4" />
				Back to Posts
			</Button>
		</div>
	{/if}
</div>
