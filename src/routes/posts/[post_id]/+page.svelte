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
	const { post, session, supabase, tags = [], form: formData } = data;

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
			}
		},
		onUpdated({ form }) {
			if (form.message) {
				toast.success(form.message.text);
			}
		}
	});

	const { form: formValues, enhance } = form;

	let canEdit = $derived(post?.user_id === session?.user?.id);

	let coverPreview = $state<string>('');

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

		// For now, just show a message that saving is not implemented
		toast.info('Cover upload would be implemented in a full version');
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
		<div class="mb-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div class="flex-1">
					<input
						bind:value={$formValues.title}
						readonly={!canEdit}
						class="mb-3 w-full border-0 p-0 text-3xl font-bold shadow-none focus:ring-0 focus:ring-offset-0 sm:text-4xl"
						class:cursor-text={canEdit}
						class:cursor-default={!canEdit}
						class:bg-transparent={!canEdit}
						class:text-foreground={!canEdit}
						placeholder="Your new post title..."
					/>
					<div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
						<div class="flex items-center gap-1">
							<User class="h-4 w-4" />
							<span
								>{post?.users?.username ||
									session?.user?.user_metadata?.username ||
									'Unknown'}</span
							>
						</div>
						{#if post}
							<div class="flex items-center gap-1">
								<Calendar class="h-4 w-4" />
								<span>{new Date(post.created_at).toLocaleDateString()}</span>
							</div>
							<div class="flex items-center gap-1">
								<Eye class="h-4 w-4" />
								<span>{post.post_views || 0} views</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="mb-6 overflow-hidden rounded-lg">
				<div class="group relative">
					{#if canEdit}
						<button
							type="button"
							class="h-48 w-full cursor-pointer border-0 bg-transparent p-0 sm:h-64"
							onclick={() => document.getElementById('cover-input')?.click()}
							aria-label="Change cover image"
						>
							<img
								src={coverPreview ||
									($formValues.post_cover && post
										? getPostCoverUrl($formValues.post_cover, supabase)
										: '/placeholder-image.jpg')}
								alt={coverPreview ? 'Cover preview' : 'Cover image'}
								class="h-full w-full object-cover"
							/>
							<div
								class="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-opacity group-hover:opacity-100"
							>
								<span class="text-lg font-medium text-white">Click to change cover</span>
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
						<img
							src={post?.post_cover
								? getPostCoverUrl(post.post_cover, supabase)
								: '/placeholder-image.jpg'}
							alt={post?.title || 'Cover image'}
							class="h-48 w-full object-cover sm:h-64"
						/>
					{/if}
				</div>
			</div>

			<div class="mb-6 space-y-4">
				{#if canEdit}
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
							<Switch bind:checked={$formValues.public_visibility} />
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
				{:else}
					<div class="flex flex-wrap gap-2">
						{#if post?.posts_tags_rel?.length}
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
						{:else}
							<span class="text-sm text-muted-foreground">No tags</span>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Post Content -->
		<Card>
			<form method="POST" use:enhance>
				<CardContent class="p-4 sm:p-6">
					{#if (canEdit || post?.content_v2) && (canEdit ? $formValues.content : post?.content_v2)}
						<div class="prose prose-lg max-w-none">
							<Editor
								content={canEdit ? $formValues.content : post?.content_v2}
								readOnly={!canEdit}
								onChange={canEdit ? handleContentChange : () => {}}
								class="min-h-[500px]"
							/>
						</div>
					{:else if post?.content}
						<!-- Fallback for legacy content -->
						<div class="prose prose-lg max-w-none">
							{@html post.content}
						</div>
					{:else}
						<p class="text-muted-foreground">No content available.</p>
					{/if}
				</CardContent>
			</form>
		</Card>

		{#if post}
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
		{/if}
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
