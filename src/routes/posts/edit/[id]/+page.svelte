<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { Switch } from '$lib/components/ui/switch';
	import { ArrowLeft, Save, Eye, EyeOff, X, Trash2 } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { Editor, MultiTagSelect } from '$lib/components/modules';
	import { enhance } from '$app/forms';

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

	let { post = null, tags = [] } = $props<{ post: Post | null; tags: string[] }>();

	let editorContent = $state<any>(post?.content_v2 || null);
	let postTitle = $state(post?.title || '');
	let postCover = $state(post?.post_cover || '');
	let selectedTags = $state<string[]>(
		post?.posts_tags_rel?.map((rel: any) => rel.post_tags.tag_name) || []
	);
	let isPublic = $state(post?.public_visibility || false);
	let isSubmitting = $state(false);

	function handleContentChange(data: any) {
		editorContent = data;
	}

	function handleTagToggle(tagName: string) {
		if (selectedTags.includes(tagName)) {
			selectedTags = selectedTags.filter((tag: string) => tag !== tagName);
		} else {
			selectedTags = [...selectedTags, tagName];
		}
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

	function removeTag(tagName: string) {
		selectedTags = selectedTags.filter((tag: string) => tag !== tagName);
	}

	function handleBack() {
		goto('/posts');
	}

	function handleDelete() {
		if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
			// Delete functionality will be implemented
			console.log('Delete post:', post?.id);
		}
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
			<Button type="submit" form="post-form" disabled={isSubmitting || !postTitle.trim()}>
				<Save class="mr-2 h-4 w-4" />
				{isSubmitting ? 'Saving...' : 'Update Post'}
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
						<CardTitle>Edit Post</CardTitle>
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

						{#if selectedTags.length > 0}
							<div>
								<Label>Selected Tags</Label>
								<div class="mt-2 flex flex-wrap gap-2">
									{#each selectedTags as tag (tag)}
										<Badge variant="secondary" class="flex items-center gap-1">
											{tag}
											<Button
												type="button"
												variant="ghost"
												size="sm"
												class="h-auto p-0 hover:bg-transparent"
												onclick={() => removeTag(tag)}
											>
												<X class="h-3 w-3" />
											</Button>
										</Badge>
									{/each}
								</div>
							</div>
						{/if}

						{#if tags.length > 0}
							<div>
								<Label>Available Tags</Label>
								<div class="mt-2 flex flex-wrap gap-2">
									{#each tags as tag (tag)}
										<Badge
											variant={selectedTags.includes(tag) ? 'default' : 'outline'}
											class="cursor-pointer"
											onclick={() => handleTagToggle(tag)}
										>
											{tag}
										</Badge>
									{/each}
								</div>
							</div>
						{/if}

						<input type="hidden" name="tags" value={JSON.stringify(selectedTags)} />
					</CardContent>
				</Card>
			</div>
		</div>
	</form>
</div>
