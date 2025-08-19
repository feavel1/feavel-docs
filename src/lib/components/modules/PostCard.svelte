<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Edit, Eye, Heart, MessageCircle } from '@lucide/svelte';
	import type { Post } from '$lib/types/posts';
	import { getPostTags, formatDate, getPostViews, isPostOwner, getPostLikes, getPostComments } from '$lib/utils/posts';
	import { getPostCoverUrl } from '$lib/utils/storage';

	interface Props {
		post: Post;
		userId?: string;
		supabase: any;
	}

	let { post, userId, supabase }: Props = $props();

	let tags = $derived(getPostTags(post));
	let isOwner = $derived(isPostOwner(post, userId));
	let likes = $derived(getPostLikes(post));
	let comments = $derived(getPostComments(post));
</script>

<Card class="group flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
	{#if post.post_cover}
		<div class="aspect-video overflow-hidden">
			<img
				src={getPostCoverUrl(post.post_cover, supabase)}
				alt={post.title}
				loading="lazy"
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
			/>
		</div>
	{:else}
		<div class="aspect-video bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center">
			<div class="text-muted-foreground text-lg font-medium">No cover image</div>
		</div>
	{/if}

	<CardHeader class="flex-shrink-0 pb-3">
		<CardTitle class="line-clamp-1 text-lg leading-tight">{post.title}</CardTitle>
		
		<div class="mt-3 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Avatar class="size-8">
					{#if post.users?.avatar_url}
						<AvatarImage src={post.users.avatar_url} alt={post.users.username} />
					{/if}
					<AvatarFallback class="text-xs font-medium">
						{post.users?.username?.charAt(0)?.toUpperCase() || 'U'}
					</AvatarFallback>
				</Avatar>
				<div class="text-sm">
					<div class="font-medium">{post.users?.username || 'Unknown'}</div>
					<div class="text-muted-foreground text-xs">{formatDate(post.created_at)}</div>
				</div>
			</div>
			
			{#if isOwner}
				<Button variant="ghost" size="sm" href="/posts/edit/{post.id}" class="h-8 w-8 p-0">
					<Edit class="h-4 w-4" />
				</Button>
			{/if}
		</div>
	</CardHeader>

	<CardContent class="flex-grow pt-0">
		{#if tags.length > 0}
			<div class="mb-3 flex flex-wrap gap-1">
				{#each tags.slice(0, 3) as tag}
					<Button
						variant="outline"
						size="sm"
						href={`/posts?tags=${encodeURIComponent(tag)}`}
						class="h-6 px-2 text-xs"
					>
						{tag}
					</Button>
				{/each}
				{#if tags.length > 3}
					<div class="flex h-6 items-center rounded border px-2 text-xs text-muted-foreground">
						+{tags.length - 3}
					</div>
				{/if}
			</div>
		{/if}
	</CardContent>

	<CardFooter class="flex-shrink-0 flex items-center justify-between pt-0">
		<div class="flex items-center gap-3 text-sm text-muted-foreground">
			<span class="flex items-center gap-1">
				<Eye class="h-4 w-4" />
				{getPostViews(post)}
			</span>
			<span class="flex items-center gap-1">
				<Heart class="h-4 w-4" />
				{likes}
			</span>
			<span class="flex items-center gap-1">
				<MessageCircle class="h-4 w-4" />
				{comments}
			</span>
		</div>
		
		<Button variant="outline" size="sm" href="/posts/{post.id}" class="h-8 px-3 text-sm">
			Read More
		</Button>
	</CardFooter>
</Card>
