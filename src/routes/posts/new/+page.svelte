<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { Switch } from '$lib/components/ui/switch';
	import { ArrowLeft, Save, Eye } from '@lucide/svelte';
	import { Editor, MultiTagSelect } from '$lib/components/modules';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	let { tags = [] } = $props<{ tags: string[] }>();

	let editorContent = $state<any>(null);
	let postTitle = $state('');
	let postCover = $state('');
	let selectedTags = $state<string[]>([]);
	let isPublic = $state(false);
	let isSubmitting = $state(false);

	// Convert string tags to Tag objects for the MultiTagSelect component
	let tagObjects = $state<{ id: number; tag_name: string }[]>([]);

	$effect(() => {
		tagObjects = tags.map((tag: string, index: number) => ({ id: index, tag_name: tag }));
	});

	function handleContentChange(data: any) {
		editorContent = data;
	}

	function handleAddTag(event: KeyboardEvent) {
		const input = event.target as HTMLInputElement;
		if (event.key === 'Enter' && input.value.trim()) {
			const newTag = input.value.trim();
			if (!selectedTags.includes(newTag) && !tags.includes(newTag)) {
				selectedTags = [...selectedTags, newTag];
			}
			input.value = '';
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
			<Button type="submit" form="post-form" disabled={isSubmitting || !postTitle.trim()}>
				<Save class="mr-2 h-4 w-4" />
				{isSubmitting ? 'Saving...' : 'Publish Post'}
			</Button>
		</div>
	</div>

	<form
		id="post-form"
		method="POST"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result }) => {
				isSubmitting = false;
				if (result.type === 'success') {
					goto('/posts');
				}
			};
		}}
	>
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
								name="title"
								bind:value={postTitle}
								placeholder="Enter your post title..."
								required
							/>
						</div>

						<div>
							<Label for="cover">Cover Image URL (optional)</Label>
							<Input
								id="cover"
								name="cover"
								bind:value={postCover}
								placeholder="https://example.com/image.jpg"
							/>
						</div>

						<div>
							<Label>Content</Label>
							<div class="mt-2 h-96">
								<Editor content={editorContent} onChange={handleContentChange} class="min-h-full" />
							</div>
						</div>

						<input type="hidden" name="content" value={JSON.stringify(editorContent)} />
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
						<input type="hidden" name="public_visibility" value={isPublic} />

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
							tags={tagObjects}
							bind:selectedTags
							placeholder="Select tags..."
							label="Available Tags"
							showSearch={true}
						/>

						<input type="hidden" name="tags" value={JSON.stringify(selectedTags)} />
					</CardContent>
				</Card>
			</div>
		</div>
	</form>
</div>
