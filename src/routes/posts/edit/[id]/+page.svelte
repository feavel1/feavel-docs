<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { ArrowLeft, Save, Eye, Trash2 } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import Editor from '$lib/components/modules/content/Editor.svelte';
	import MultiTagSelect from '$lib/components/modules/interactive/MultiTagSelect.svelte';
	import { toast } from 'svelte-sonner';
	import { extractTagNamesFromRelations } from '$lib/utils/tags';
	import { availableTags, initializeTags, addNewTag } from '$lib/stores/tags';

	interface Post {
		id: string;
		title: string;
		content?: string;
		content_v2?: any;
		post_cover?: string;
		post_views?: number;
		created_at: string;
		user_id: string;
		public_visibility: boolean;
		users?: {
			username: string;
			avatar_url?: string;
		};
		posts_tags_rel?: Array<{
			post_tags: {
				tag_name: string;
			};
		}>;
	}

	let { data } = $props();
	let { post, tags }: { post: Post; tags: string[] } = data;

	let editorContent = $state<any>(post?.content_v2 || null);
	let postTitle = $state(post?.title || '');
	let postCover = $state(post?.post_cover || '');
	let selectedTags = $state<string[]>(
		post?.posts_tags_rel ? extractTagNamesFromRelations(post.posts_tags_rel) : []
	);
	let isPublic = $state(post?.public_visibility || false);
	let isSubmitting = $state(false);

	// Initialize the tag store with server data
	$effect(() => {
		if (tags && Array.isArray(tags)) {
			initializeTags(tags);
		}
	});

	function handleContentChange(data: any) {
		editorContent = data;
	}

	function handleAddTag(event: KeyboardEvent) {
		const input = event.target as HTMLInputElement;
		if (event.key === 'Enter' && input.value.trim()) {
			const newTag = input.value.trim();

			// Add the new tag to the store
			addNewTag(newTag);

			// Add to selected tags if not already selected
			if (!selectedTags.includes(newTag)) {
				selectedTags = [...selectedTags, newTag];
			}

			// Clear the input
			input.value = '';

			// Show success feedback
			toast.success(`Tag "${newTag}" added successfully!`);
		}
	}

	async function handleSubmit() {
		if (!postTitle.trim()) {
			toast.error('Title is required');
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/posts', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: post?.id,
					title: postTitle,
					content: editorContent,
					cover: postCover,
					public_visibility: isPublic,
					tags: selectedTags
				})
			});

			const result = await response.json();

			if (response.ok) {
				toast.success('Post updated successfully!');
				goto('/posts');
			} else {
				toast.error(result.error || 'Failed to update post');
			}
		} catch (error) {
			console.error('Error updating post:', error);
			toast.error('Failed to update post');
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/posts', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: post?.id
				})
			});

			const result = await response.json();

			if (response.ok) {
				toast.success('Post deleted successfully!');
				goto('/posts');
			} else {
				toast.error(result.error || 'Failed to delete post');
			}
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Failed to delete post');
		} finally {
			isSubmitting = false;
		}
	}

	function handleBack() {
		goto('/posts');
	}
</script>

<svelte:head>
	<title>Edit Post - {post?.title}</title>
	<meta name="description" content="Edit blog post" />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<Button variant="ghost" onclick={handleBack}>
			<ArrowLeft class="mr-2 h-4 w-4" />
			Back to Posts
		</Button>
		<div class="flex items-center gap-2">
			<Button variant="outline" disabled={isSubmitting}>
				<Eye class="mr-2 h-4 w-4" />
				Preview
			</Button>
			<Button variant="destructive" onclick={handleDelete} disabled={isSubmitting}>
				<Trash2 class="mr-2 h-4 w-4" />
				Delete
			</Button>
			<Button onclick={handleSubmit} disabled={isSubmitting || !postTitle.trim()}>
				<Save class="mr-2 h-4 w-4" />
				{isSubmitting ? 'Saving...' : 'Update Post'}
			</Button>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Main Content -->
		<div class="lg:col-span-2">
			<Card>
				<CardHeader>
					<CardTitle>Edit Post</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div>
						<Label for="title">Title</Label>
						<Input
							id="title"
							bind:value={postTitle}
							placeholder="Enter your post title..."
							required
						/>
					</div>

					<div>
						<Label for="cover">Cover Image URL (optional)</Label>
						<Input id="cover" bind:value={postCover} placeholder="https://example.com/image.jpg" />
					</div>

					<div>
						<Label>Content</Label>
						<div class="mt-2 h-96">
							<Editor content={editorContent} onChange={handleContentChange} class="min-h-full" />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Publishing Settings -->
			<Card>
				<CardHeader>
					<CardTitle>Publishing</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex items-center justify-between">
						<Label for="public">Make post public</Label>
						<Switch id="public" bind:checked={isPublic} />
					</div>

					<p class="text-sm text-muted-foreground">
						{isPublic
							? 'This post will be visible to everyone.'
							: 'This post will be saved as a draft.'}
					</p>
				</CardContent>
			</Card>

			<!-- Tags -->
			<Card>
				<CardHeader>
					<CardTitle>Tags</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div>
						<Label for="new-tag">Add new tag</Label>
						<Input
							id="new-tag"
							placeholder="Type tag name and press Enter"
							onkeydown={handleAddTag}
						/>
					</div>

					<MultiTagSelect
						tags={$availableTags}
						bind:selectedTags
						placeholder="Select tags..."
						label="Available Tags"
						showSearch={true}
					/>
				</CardContent>
			</Card>
		</div>
	</div>
</div>
