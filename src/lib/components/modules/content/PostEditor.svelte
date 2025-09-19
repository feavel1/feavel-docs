<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Calendar, Eye, User } from '@lucide/svelte';
	import Editor from '$lib/components/modules/content/Editor.svelte';
	import MultiSelect from '$lib/components/modules/interactive/MultiSelect.svelte';
	import { getPostCoverUrl } from '$lib/utils/storage';
	import type { Post } from '$lib/utils/posts';
	import type { SupabaseClient } from '@supabase/supabase-js';

	interface EditorData {
		title: string;
		content: any;
		cover: string;
		isPublic: boolean;
		selectedTags: string[];
		coverPreview: string;
	}

	interface EventHandlers {
		onEdit: () => void;
		onTitleChange: (title: string) => void;
		onContentChange: (content: any) => void;
		onCoverFileSelect: (event: Event) => void;
		onCoverRemove: () => void;
		onPublicChange: (isPublic: boolean) => void;
	}

	interface Props {
		post: Post;
		session: any;
		supabase: SupabaseClient;
		tags: string[];
		isEditing: boolean;
		editorData: EditorData;
		eventHandlers: EventHandlers;
	}

	let {
		post,
		session,
		supabase,
		tags,
		isEditing,
		editorData,
		eventHandlers
	}: Props = $props();

	let isAuthor = $derived(post?.user_id === session?.user?.id);

</script>

<div class="mb-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div class="flex-1">
			{#if isEditing}
				<Input
					bind:value={editorData.title}
					class="mb-3 text-3xl font-bold sm:text-4xl"
					placeholder="Post title"
					onchange={(e) => eventHandlers.onTitleChange((e.target as HTMLInputElement).value)}
				/>
			{/if}
			<h1 class={isEditing ? 'hidden' : 'mb-3 text-3xl font-bold sm:text-4xl'}>
				{post.title}
			</h1>
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
			<Button variant="outline" onclick={eventHandlers.onEdit} size="sm">
				Edit
			</Button>
		{/if}
	</div>

	{#if isEditing}
		<div class="mb-6 space-y-3">
			<Label for="cover">Cover Image (optional)</Label>
			<div class="mt-2 space-y-2">
				<Input type="file" accept="image/*" onchange={eventHandlers.onCoverFileSelect} />
				{#if editorData.coverPreview || editorData.cover}
					<div class="mt-2">
						<img
							src={editorData.coverPreview || getPostCoverUrl(editorData.cover, supabase)}
							alt={editorData.coverPreview ? 'Cover preview' : 'Cover image'}
							class="h-32 w-full rounded-md object-cover"
						/>
					</div>
				{/if}
				{#if editorData.coverPreview || editorData.cover}
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={eventHandlers.onCoverRemove}
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
						{editorData.isPublic
							? 'This post will be visible to everyone.'
							: 'This post will be saved as a draft.'}
					</p>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-sm text-muted-foreground">Draft</span>
					<Switch bind:checked={editorData.isPublic} onchange={(e) => eventHandlers.onPublicChange((e.target as HTMLInputElement).checked)} />
					<span class="text-sm text-muted-foreground">Public</span>
				</div>
			</div>
			<div class="space-y-2">
				<Label>Tags</Label>
				<MultiSelect
					items={tags.map((tag) => ({ id: tag, tag_name: tag }))}
					bind:selectedItems={editorData.selectedTags}
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
					content={editorData.content}
					readOnly={false}
					onChange={eventHandlers.onContentChange}
					class="min-h-[500px]"
				/>
			</div>
		{:else if post.content_v2}
			<div class="prose prose-lg max-w-none">
				<Editor content={post.content_v2} readOnly={true} onChange={eventHandlers.onContentChange} />
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