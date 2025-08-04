<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { ArrowLeft, Save, Eye } from '@lucide/svelte';
	import { Editor, MultiTagSelect } from '$lib/components/modules';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { availableTags, initializeTags, addNewTag } from '$lib/stores/tags';

	let { data } = $props();
	let { tags } = data;

	let editorContent = $state<any>(null);
	let postTitle = $state('');
	let postCover = $state('');
	let selectedTags = $state<string[]>([]);
	let isPublic = $state(false);
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
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title: postTitle,
					content: editorContent,
					cover: postCover,
					public_visibility: isPublic,
					tags: selectedTags
				})
			});

			const result = await response.json();

			if (response.ok) {
				toast.success('Post created successfully!');
				goto('/posts');
			} else {
				toast.error(result.error || 'Failed to create post');
			}
		} catch (error) {
			console.error('Error creating post:', error);
			toast.error('Failed to create post');
		} finally {
			isSubmitting = false;
		}
	}

	function handleBack() {
		goto('/posts');
	}
</script>

<svelte:head>
	<title>Create New Post</title>
	<meta name="description" content="Create a new blog post" />
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
			<Button onclick={handleSubmit} disabled={isSubmitting || !postTitle.trim()}>
				<Save class="mr-2 h-4 w-4" />
				{isSubmitting ? 'Saving...' : 'Publish Post'}
			</Button>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Main Content -->
		<div class="lg:col-span-2">
			<Card>
				<CardHeader>
					<CardTitle>Post Content</CardTitle>
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
