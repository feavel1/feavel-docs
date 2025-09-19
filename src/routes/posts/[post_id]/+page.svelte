<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Eye } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import CommentSection from '$lib/components/modules/content/CommentSection.svelte';
	import PostEditor from '$lib/components/modules/content/PostEditor.svelte';
	import PostActions from '$lib/components/modules/content/PostActions.svelte';
	import PostAuthor from '$lib/components/modules/content/PostAuthor.svelte';
	import { uploadPostCover } from '$lib/utils/storage';
	import { createPost, updatePost } from '$lib/utils/posts';

	let { data } = $props();
	let { post, session, supabase, tags = [], isNewPost = false } = data;
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

	// Helper function to reset file state
	function resetFileState() {
		coverFile = null;
		coverPreview = '';
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
		// Reset file state
		resetFileState();
	}

	function handleCancel() {
		// If we're canceling a new post that hasn't been saved, redirect to posts list
		if (isNewPost && !isNewPostCreated) {
			goto('/posts');
			return;
		}
		isEditing = false;
		// Reset file state
		resetFileState();
	}

	function handleTitleChange(title: string) {
		editedTitle = title;
	}

	function handleContentChange(content: any) {
		if (isEditing) {
			editedContent = content;
		}
	}

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

	function handleCoverRemove() {
		resetFileState();
		if (!isNewPost) {
			editedCover = post?.post_cover || '';
		} else {
			editedCover = '';
		}
	}

	function handlePublicChange(publicStatus: boolean) {
		isPublic = publicStatus;
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

			// Prepare post data

			// Handle post creation or update
			if (isNewPost) {
				if (!session) {
					toast.error('You must be logged in to create a post');
					isSubmitting = false;
					return;
				}

				const { post: createdPost, error } = await createPost(supabase, session.user.id, {
					title: editedTitle || null,
					content: editedContent,
					cover: coverFilename || null,
					public_visibility: isPublic,
					tags: selectedTags || []
				});

				if (error) {
					toast.error(error);
					isSubmitting = false;
					return;
				}

				if (createdPost) {
					toast.success('Post created successfully!');
					isNewPostCreated = true;
					createdPostId = String(createdPost.id);
					// Redirect to the new post page
					goto(`/posts/${createdPostId}`);
				}
			} else {
				if (!session) {
					toast.error('You must be logged in to update a post');
					isSubmitting = false;
					return;
				}

				if (!post?.id) {
					toast.error('Post ID is missing');
					isSubmitting = false;
					return;
				}

				const { success, error } = await updatePost(
					supabase,
					session.user.id,
					post.id,
					{
						title: editedTitle || null,
						content: editedContent,
						cover: coverFilename || null,
						public_visibility: isPublic,
						tags: selectedTags || []
					}
				);

				if (!success) {
					toast.error(error || 'Failed to update post');
					isSubmitting = false;
					return;
				}

				toast.success('Post updated successfully!');
				// Update the post data
				if (post) {
					post.title = editedTitle;
					post.content_v2 = editedContent;
					post.post_cover = coverFilename;
					post.public_visibility = isPublic;
					// Update tags in post data
					post.posts_tags_rel = selectedTags.map((tag) => ({
						post_tags: { tag_name: tag }
					}));
				}
				isEditing = false;
			}

			// Clear file state after successful save
			coverFile = null;
			coverPreview = '';
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
		<PostEditor
			{post}
			{session}
			{supabase}
			{tags}
			{isEditing}
			{editedTitle}
			{editedContent}
			{editedCover}
			{isPublic}
			{selectedTags}
			{coverPreview}
			{isSubmitting}
			onEdit={handleEdit}
			onCancel={handleCancel}
			onSave={handleSave}
			onTitleChange={handleTitleChange}
			onContentChange={handleContentChange}
			onCoverFileSelect={handleCoverFileSelect}
			onCoverRemove={handleCoverRemove}
			onPublicChange={handlePublicChange}
		/>

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