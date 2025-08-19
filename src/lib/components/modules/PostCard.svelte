<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Edit, Eye } from '@lucide/svelte';
	import type { Post } from '$lib/types/posts';
	import { getPostTags, formatDate, getPostViews, isPostOwner } from '$lib/utils/posts';

	interface Props {
		post: Post;
		userId?: string;
	}

	let { post, userId }: Props = $props();

	let tags = $derived(getPostTags(post));
	let isOwner = $derived(isPostOwner(post, userId));
</script>

<Card class="group transition-all hover:shadow-lg">
	{#if post.post_cover}
		<div class="aspect-video overflow-hidden rounded-t-lg">
			<img
				src={post.post_cover}
				alt="Post cover"
				class="h-full w-full object-cover transition-transform group-hover:scale-105"
			/>
		</div>
	{/if}

	<CardHeader class="pb-3">
		<div class="flex items-start justify-between">
			<CardTitle class="line-clamp-2 text-lg">{post.title}</CardTitle>
			{#if isOwner}
				<Button variant="ghost" size="sm" href="/posts/edit/{post.id}">
					<Edit class="h-4 w-4" />
				</Button>
			{/if}
		</div>

		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<span>by {post.users?.username || 'Unknown'}</span>
			<span>•</span>
			<span>{formatDate(post.created_at)}</span>
			<span>•</span>
			<span class="flex items-center gap-1">
				<Eye class="h-4 w-4" />
				{getPostViews(post)}
			</span>
		</div>
	</CardHeader>

	<CardContent class="pt-0">
		{#if tags.length > 0}
			<div class="mb-3 flex flex-wrap gap-1">
				{#each tags as tag}
					<Button
						variant="outline"
						size="sm"
						href={`/posts?tags=${encodeURIComponent(tag)}`}
						class="h-6 px-2 text-xs"
					>
						{tag}
					</Button>
				{/each}
			</div>
		{/if}

		<Button variant="outline" size="sm" href="/posts/{post.id}" class="w-full">Read More</Button>
	</CardContent>
</Card>
