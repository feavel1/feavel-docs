<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { ArrowLeft, Edit, Eye, Calendar, User } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import Editor from '$lib/components/modules/content/Editor.svelte';
	import CommentSection from '$lib/components/modules/content/CommentSection.svelte';
	import LikeButton from '$lib/components/modules/interactive/LikeButton.svelte';
	import MultiSelect from '$lib/components/modules/interactive/MultiSelect.svelte';
	import { getAvatarUrl } from '$lib/utils/user';
	import { getPostCoverUrl } from '$lib/utils/storage';
	import { uploadPostCover } from '$lib/utils/storage';

	let { data } = $props();
	let { post, session, supabase, tags = [], isNewPost = false } = data;

	let isAuthor = $derived(post?.user_id === session?.user?.id);
	let isEditing = $state(isNewPost); // Automatically enter edit mode for new posts
	let editedTitle = $state(post?.title || '');
	let editedContent = $state(post?.content_v2 || null);
	let editedCover = $state(post?.post_cover || '');
	let isPublic = $state(post?.public_visibility || false);
	let selectedTags = $state<string[]>(
		post?.posts_tags_rel ? post.posts_tags_rel.map((rel: any) => rel.post_tags.tag_name) : []
	);
	let isSubmitting = $state(false);

	// For new posts, redirect to the actual post URL after saving
	let isNewPostCreated = $state(false);
	let createdPostId = $state<string | null>(null);

	// Image upload functionality
	let coverFile = $state<File | null>(null);
	let coverPreview = $state<string>('');

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

		coverFile = file;
		coverPreview = URL.createObjectURL(file);
	}

	function handleEdit() {
		isEditing = true;
		editedTitle = post?.title || '';
		editedContent = post?.content_v2 || null;
		editedCover = post?.post_cover || '';
		isPublic = post?.public_visibility || false;
		selectedTags = post?.posts_tags_rel
			? post.posts_tags_rel.map((rel: any) => rel.post_tags.tag_name)
			: [];
		coverFile = null;
		coverPreview = '';
	}

	function handleCancel() {
		// If we're canceling a new post that hasn't been saved, redirect to posts list
		if (isNewPost && !isNewPostCreated) {
			goto('/posts');
			return;
		}
		isEditing = false;
		coverFile = null;
		coverPreview = '';
	}

	function handleContentChange(data: any) {
		if (isEditing) {
			editedContent = data;
		}
	}

	async function handleSave() {
		// For new posts, title is not required initially but is required for saving
		if (!editedTitle.trim() && !isNewPost) {
			toast.error('Title is required');
			return;
		}

		isSubmitting = true;

		try {
			let coverFilename = editedCover;

			// Upload cover image if a file is selected
			if (coverFile) {
				const filename = await uploadPostCover(supabase, coverFile);
				if (filename) {
					coverFilename = filename;
				} else {
					toast.error('Failed to upload cover image');
					isSubmitting = false;
					return;
				}
			}

			let response;
			if (isNewPost) {
				// For file uploads, we need to send as multipart form data
				if (coverFile) {
					const formData = new FormData();
					formData.append(
						'data',
						JSON.stringify({
							title: editedTitle,
							content: editedContent,
							cover: coverFilename,
							public_visibility: isPublic,
							tags: selectedTags
						})
					);
					formData.append('cover', coverFile);

					response = await fetch('/api/posts', {
						method: 'POST',
						body: formData
					});
				} else {
					// Regular JSON request
					response = await fetch('/api/posts', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							title: editedTitle,
							content: editedContent,
							cover: coverFilename,
							public_visibility: isPublic,
							tags: selectedTags
						})
					});
				}
			} else {
				// Update existing post
				if (coverFile) {
					const formData = new FormData();
					formData.append(
						'data',
						JSON.stringify({
							id: post?.id,
							title: editedTitle,
							content: editedContent,
							cover: coverFilename,
							public_visibility: isPublic,
							tags: selectedTags
						})
					);
					formData.append('cover', coverFile);

					response = await fetch('/api/posts', {
						method: 'PUT',
						body: formData
					});
				} else {
					// Regular JSON request
					response = await fetch('/api/posts', {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							id: post?.id,
							title: editedTitle,
							content: editedContent,
							cover: coverFilename,
							public_visibility: isPublic,
							tags: selectedTags
						})
					});
				}
			}

			const result = await response.json();

			if (response.ok) {
				if (isNewPost) {
					toast.success('Post created successfully!');
					isNewPostCreated = true;
					createdPostId = result.postId || result.id;
					// Redirect to the new post page
					if (createdPostId) {
						goto(`/posts/${createdPostId}`);
					}
				} else {
					toast.success('Post updated successfully!');
					// Update the post data
					post.title = editedTitle;
					post.content_v2 = editedContent;
					post.post_cover = coverFilename;
					post.public_visibility = isPublic;
					// Update tags in post data
					post.posts_tags_rel = selectedTags.map((tag) => ({
						post_tags: { tag_name: tag }
					}));
					isEditing = false;
				}
				// Clear file state after successful save
				coverFile = null;
				coverPreview = '';
			} else {
				toast.error(result.error || `Failed to ${isNewPost ? 'create' : 'update'} post`);
			}
		} catch (error) {
			console.error(`Error ${isNewPost ? 'creating' : 'updating'} post:`, error);
			toast.error(`Failed to ${isNewPost ? 'create' : 'update'} post`);
		} finally {
			isSubmitting = false;
		}
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
		<!-- Post Header -->
		<div class="mb-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div class="flex-1">
					{#if isEditing}
						<Input
							bind:value={editedTitle}
							class="mb-3 text-3xl font-bold sm:text-4xl"
							placeholder="Post title"
						/>
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
					{:else}
						<h1 class="mb-3 text-3xl font-bold sm:text-4xl">{post.title}</h1>
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
					{/if}
				</div>
				{#if isAuthor}
					{#if isEditing}
						<div class="flex gap-2">
							<Button variant="outline" onclick={handleCancel} disabled={isSubmitting} size="sm">
								Cancel
							</Button>
							<Button onclick={handleSave} disabled={isSubmitting} size="sm">
								{isSubmitting ? 'Saving...' : 'Save'}
							</Button>
						</div>
					{:else}
						<Button variant="outline" onclick={handleEdit} size="sm">
							<Edit class="mr-1.5 h-4 w-4" />
							Edit
						</Button>
					{/if}
				{/if}
			</div>

			{#if isEditing}
				<div class="mb-6 space-y-3">
					<Label for="cover">Cover Image (optional)</Label>
					<div class="mt-2 space-y-2">
						<Input type="file" accept="image/*" onchange={handleCoverFileSelect} />
						{#if coverPreview}
							<div class="mt-2">
								<img
									src={coverPreview}
									alt="Cover preview"
									class="h-32 w-full rounded-md object-cover"
								/>
							</div>
						{:else if editedCover}
							<div class="mt-2">
								<img
									src={getPostCoverUrl(editedCover, supabase)}
									alt="Cover preview"
									class="h-32 w-full rounded-md object-cover"
								/>
							</div>
						{/if}
						{#if coverFile || editedCover}
							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={() => {
									coverFile = null;
									coverPreview = '';
									if (!isNewPost) {
										editedCover = post?.post_cover || '';
									} else {
										editedCover = '';
									}
								}}
							>
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
								{isPublic
									? 'This post will be visible to everyone.'
									: 'This post will be saved as a draft.'}
							</p>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-sm text-muted-foreground">Draft</span>
							<Switch bind:checked={isPublic} />
							<span class="text-sm text-muted-foreground">Public</span>
						</div>
					</div>
					<div class="space-y-2">
						<Label>Tags</Label>
						<MultiSelect
							items={tags.map((tag) => ({ id: tag, tag_name: tag }))}
							bind:selectedItems={selectedTags}
							itemNameProperty="tag_name"
							placeholder="Select tags..."
							label=""
							showSearch={true}
							searchPlaceholder="Search tags..."
							emptyMessage="No tags found."
						/>
					</div>
				</div>
			{:else if post.posts_tags_rel && post.posts_tags_rel.length > 0}
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
							content={editedContent}
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

		<!-- Post Actions -->
		<div class="mt-6 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<LikeButton postId={post.id} {supabase} currentUserId={session?.user?.id} />
			</div>
		</div>

		<!-- Author Info -->
		<Card class="mt-6">
			<CardHeader>
				<h3 class="text-lg font-semibold">About the Author</h3>
			</CardHeader>
			<CardContent>
				<div class="flex items-center gap-4">
					<div class="flex-shrink-0">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
							<img
								class="h-12 w-12 rounded-full object-cover"
								src={getAvatarUrl(post.users?.avatar_url, post.users?.username, supabase)}
								alt={post.users?.full_name || post.users?.username}
								onerror={(e) => {
									const target = e.target as HTMLImageElement;
									target.style.display = 'none';
									const fallback = target.nextElementSibling as HTMLElement;
									if (fallback) {
										fallback.style.display = 'flex';
									} else {
										// If no fallback element, show the parent container
										target.parentElement!.style.backgroundColor = '#d1d5db'; // gray-300
									}
								}}
							/>

							<span class="text-lg font-medium text-gray-700" style="display: none;">
								{(post.users?.full_name ?? post.users?.username ?? '').charAt(0).toUpperCase()}
							</span>
						</div>
					</div>
					<div>
						<p class="font-medium">{post.users?.full_name || post.users?.username || 'Unknown'}</p>
						<p class="text-sm text-muted-foreground">
							Published on {new Date(post.created_at).toLocaleDateString()}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>

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
