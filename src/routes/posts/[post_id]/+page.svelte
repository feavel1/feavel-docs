<script lang="ts" module>
	import { z } from 'zod';

	// Define a schema for Editor.js content blocks
	const editorBlockSchema = z.object({
		id: z.string().optional(),
		type: z.string(),
		data: z.record(z.any()).optional()
	});

	// Define the main post schema with nested data support
	export const postSchema = z.object({
		id: z.number().optional(),
		title: z.string().max(200, { message: 'Title must be less than 200 characters' }).nullable(),
		content: z.object({
			blocks: z.array(editorBlockSchema),
			version: z.string().optional()
		}).nullable(),
		post_cover: z.string().nullable(),
		public_visibility: z.boolean(),
		tags: z.array(z.string().min(1).max(30)).max(10)
	});

	export type PostSchema = typeof postSchema;
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Eye } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import CommentSection from '$lib/components/modules/content/CommentSection.svelte';
	import PostEditor from '$lib/components/modules/content/PostEditor.svelte';
	import PostActions from '$lib/components/modules/content/PostActions.svelte';
	import PostAuthor from '$lib/components/modules/content/PostAuthor.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	let { data } = $props();
	let { post, session, supabase, tags = [], isNewPost = false, form: formData } = data;

	// Initialize form with Superforms
	const form = superForm(formData, {
		validators: zodClient(postSchema),
		dataType: 'json', // Allow nested data
		resetForm: false, // Don't reset form after submission
		onResult: ({ result }) => {
			// Focus on first error
			if (result.type === 'failure' && form.errors && Object.keys(form.errors).length) {
				requestAnimationFrame(() => {
					document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
				});
			}
		},
		onUpdated({ form }) {
			if (form.message) {
				// Display the message using a toast library
				if (typeof form.message === 'string') {
					toast.success(form.message);
				} else if (form.message.text) {
					toast.success(form.message.text);
				}
			}
		}
	});

	// Form state
	const { form: formValues, enhance, submitting } = form;

	// Derived state for edit mode
	let isEditing = $derived(isNewPost || (form.errors && Object.keys(form.errors).length > 0));

	// For new posts, redirect to the actual post URL after saving
	let isNewPostCreated = $state(false);

	// Image upload functionality
	let coverPreview = $state<string>('');

	// Helper function to reset file state
	function resetFileState() {
		coverPreview = '';
	}

	function handleEdit() {
		// Set isEditing to true to show the editor
		// The form values are already initialized with the post data
	}

	function handleCancel() {
		// If we're canceling a new post that hasn't been saved, redirect to posts list
		if (isNewPost && !isNewPostCreated) {
			goto('/posts');
			return;
		}
		// Reset file state
		resetFileState();
		// Reset form to initial values
		form.reset();
	}

	function handleTitleChange(title: string) {
		$formValues.title = title;
	}

	function handleContentChange(content: any) {
		if (isEditing) {
			$formValues.content = content;
		}
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

			if (response.ok) {
				const { coverFilename } = await response.json();
				// Update the form value with the new cover filename
				$formValues.post_cover = coverFilename;
			} else {
				const { message } = await response.json();
				toast.error(message || 'Failed to upload cover image');
			}
		} catch (error) {
			console.error('Error uploading cover image:', error);
			toast.error('Failed to upload cover image');
		}
	}

	function handleCoverRemove() {
		resetFileState();
		// Clear the cover from the form
		$formValues.post_cover = null;
	}

	function handlePublicChange(publicStatus: boolean) {
		$formValues.public_visibility = publicStatus;
	}

	
	// The save functionality is now handled by the form action
	// We can remove this function as it's no longer needed
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
		<form method="POST" use:enhance>
			<PostEditor
				{post}
				{session}
				{supabase}
				{tags}
				{isEditing}
				editedTitle={$formValues.title || ''}
				editedContent={$formValues.content}
				editedCover={$formValues.post_cover || ''}
				{coverPreview}
				isPublic={$formValues.public_visibility}
				selectedTags={$formValues.tags}
				isSubmitting={$submitting}
				onEdit={handleEdit}
				onTitleChange={handleTitleChange}
				onContentChange={handleContentChange}
				onCoverFileSelect={handleCoverFileSelect}
				onCoverRemove={handleCoverRemove}
				onPublicChange={handlePublicChange}
			/>

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