<script lang="ts" module>
	import { z } from 'zod/v4';

	const editorBlockSchema = z.object({
		id: z.string().optional(),
		type: z.string().min(1),
		data: z.json()
	});

	export const postSchema = z.object({
		id: z.number().optional(),
		title: z.string().max(100).optional(),
		content: z
			.object({
				blocks: z.array(editorBlockSchema).optional(),
				version: z.string().optional()
			})
			.nullable(),
		cover_file_id: z.string().max(255).nullable(),
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
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { handlePostCoverUpload, updatePost, updatePostCover, deletePost } from '$lib/utils/posts';
	import { FileStorage } from '$lib/services/storage';
	import LikeButton from '$lib/components/modules/interactive/LikeButton.svelte';
	import GradientGenerator from '$lib/components/modules/content/GradientGenerator.svelte';

	let { data } = $props();
	const { post, session, supabase, tags = [] } = data;

	// Prepare initial form data from post
	const initialFormData = {
		id: post.id,
		title: post.title,
		content: post.content_v2,
		cover_file_id: post.cover_file_id, // Use the new field
		public_visibility: post.public_visibility,
		tags: post.posts_tags_rel
			? post.posts_tags_rel.map((rel: any) => rel?.posts_tags?.tag_name).filter(Boolean)
			: []
	};

	const form = superForm(initialFormData, {
		validators: zod4Client(postSchema),
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
	let saveTimeout: any = $state(null);
	let saveStatus = $state('Saved');
	let lastSaved = $state(new Date(post.created_at));
	let prevTags = $state([
		...(post.posts_tags_rel
			? post.posts_tags_rel.map((rel: any) => rel?.posts_tags?.tag_name).filter(Boolean)
			: [])
	]);

	let coverUrl = $state('');

	// Update coverUrl whenever related values change
	$effect(() => {
		const fetchCoverUrl = async () => {
			if (coverPreview) {
				coverUrl = coverPreview;
				return;
			}

			// Check form values first (prefer new cover_file_id)
			if ($formValues.cover_file_id && supabase) {
				const storage = new FileStorage(supabase);
				const url = await storage.getUrl($formValues.cover_file_id);
				coverUrl = url || '';
				return;
			}

			// Fallback to post cover from initial load
			if (post.cover_file_id && supabase) {
				const storage = new FileStorage(supabase);
				const url = await storage.getUrl(post.cover_file_id);
				coverUrl = url || '';
				return;
			}


			coverUrl = '';
		};
		fetchCoverUrl();
	});

	// Check if tags have changed and trigger save
	$effect(() => {
		if (canEdit) {
			// Read current tags to trigger effect when they change
			const currentTags = $formValues.tags;

			// Check if tags actually changed from previous state
			const tagsChanged = JSON.stringify(currentTags) !== JSON.stringify(prevTags);

			if (tagsChanged) {
				// Update previous tags
				prevTags = [...currentTags];

				// Trigger save only if tags actually changed
				debouncedSave();
			}
		}
	});

	// Unified debounced save function that handles all fields
	const debouncedSave = async () => {
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		saveStatus = 'Saving...';
		saveTimeout = setTimeout(async () => {
			try {
				const postData = {
					title: $formValues.title,
					content: $formValues.content,
					public_visibility: $formValues.public_visibility,
					tags: $formValues.tags,
					cover_file_id: $formValues.cover_file_id
				};

				const { success, error } = await updatePost(
					supabase,
					session?.user?.id!,
					post.id,
					postData
				);

				if (success) {
					saveStatus = 'All changes saved';
					lastSaved = new Date();
				} else {
					saveStatus = 'Error saving';
					toast.error(error || 'Failed to save post');
				}
			} catch (error) {
				console.error('Error saving post:', error);
				saveStatus = 'Error saving';
				toast.error('Failed to save post');
			}
		}, 2000); // 2-second delay to allow user to continue typing
	};

	// Cleanup function for when component unmounts
	$effect(() => {
		return () => {
			if (saveTimeout) {
				clearTimeout(saveTimeout);
			}
		};
	});

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

		// Show loading state
		const storage = new FileStorage(supabase);
		const originalCover = $formValues.cover_file_id;

		// Clear the cover temporarily during upload
		const loadingId = 'loading-' + Date.now();
		coverPreview = loadingId;

		handlePostCoverUpload(supabase, file, post.id).then(async (storageId) => {
			if (storageId) {
				// Check if this is a valid UUID format before assigning
				const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
				if (!uuidRegex.test(storageId)) {
					toast.error('Invalid storage ID format received from server');
					coverPreview = coverUrl; // Revert to previous cover
					return;
				}

				$formValues.cover_file_id = storageId;
				coverPreview = await storage.getUrl(storageId) || '';
				toast.success('Cover image uploaded successfully');

				// Update only the cover field instead of all post data
				updatePostCover(supabase, session?.user?.id!, post.id, storageId).then(({ success, error }) => {
					if (success) {
						saveStatus = 'Cover saved';
					} else {
						saveStatus = 'Error saving cover';
						toast.error(error || 'Failed to save cover');
					}
				});
			} else {
				// Revert to original cover on failure
				$formValues.cover_file_id = originalCover;
				// Update coverPreview to original
				if (originalCover) {
					coverPreview = await storage.getUrl(originalCover) || '';
				} else {
					coverPreview = '';
				}
				toast.error('Failed to upload cover image');
			}
		}).catch((error) => {
			console.error('Error during cover upload:', error);
			// Revert to original cover
			$formValues.cover_file_id = originalCover;
			// Update coverPreview to original
			if (originalCover) {
				storage.getUrl(originalCover).then(url => {
					coverPreview = url || '';
				});
			} else {
				coverPreview = '';
			}
			toast.error('Failed to upload cover image');
		});
	}

	async function handleDelete() {
		if (saveTimeout) {
			clearTimeout(saveTimeout); // Cancel any pending save before deletion
		}

		if (!confirm('Are you sure you want to delete this post? This action cannot be undone.'))
			return;

		// First, remove the cover file from storage if it exists
		if (post.cover_file_id) {
			const storage = new FileStorage(supabase);
			const success = await storage.delete(post.cover_file_id);
			if (!success) {
				console.warn(`Failed to delete cover file during post deletion: ${post.cover_file_id}`);
			}
		}

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
		debouncedSave(); // Trigger real-time save when content changes
	}

	function handleCoverRemove() {
		coverPreview = '';
		$formValues.cover_file_id = null as any;

		// Update only the cover field instead of all post data
		updatePostCover(supabase, session?.user?.id!, post.id, null).then(({ success, error }) => {
			if (success) {
				saveStatus = 'Cover saved';
			} else {
				saveStatus = 'Error saving cover';
				toast.error(error || 'Failed to save cover');
			}
		});
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
					{#if $formValues.cover_file_id || coverPreview}
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
									oninput={() => (canEdit ? debouncedSave() : null)}
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
						{#if canEdit}
							<div class="flex items-center gap-2">
								<span class="rounded bg-muted px-2 py-1 text-xs">
									{saveStatus}
								</span>
								<span class="text-xs">• Last saved: {lastSaved.toLocaleTimeString()}</span>
							</div>
						{/if}
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
							{#if relation?.posts_tags && relation.posts_tags.tag_name}
								<Button
									variant="outline"
									size="sm"
									href={`/posts?tags=${encodeURIComponent(relation.posts_tags.tag_name)}`}
									class="h-6 px-2 text-xs"
								>
									{relation.posts_tags.tag_name}
								</Button>
							{/if}
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
					<Switch
						bind:checked={$formValues.public_visibility}
						id="public-visibility"
						onclick={() => (canEdit ? debouncedSave() : null)}
					/>
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
