<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Eye, Heart, MessageCircle } from '@lucide/svelte';
	import type { Post } from '$lib/utils/posts';
	import { getPostCoverUrl } from '$lib/utils/storage';
	import { getAvatarUrl } from '$lib/utils/user';

	interface Props {
		post: Post;
		supabase: any;
	}

	let { post, supabase }: Props = $props();
</script>

<Card class="group flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
	{#if post.post_cover}
		<div class="aspect-video overflow-hidden">
			<img
				src={getPostCoverUrl(post.post_cover || '', supabase)}
				alt={post.title}
				loading="lazy"
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
			/>
		</div>
	{:else}
		<div
			class="flex aspect-video items-center justify-center bg-gradient-to-r from-primary/10 to-secondary/10"
		>
			<div class="text-lg font-medium text-muted-foreground">No cover image</div>
		</div>
	{/if}

	<CardHeader class="flex-shrink-0 pb-3">
		<CardTitle class="line-clamp-1 text-lg leading-tight">{post.title}</CardTitle>

		<div class="mt-3 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Avatar class="size-8">
					{#if post.users?.avatar_url}
						<AvatarImage src={getAvatarUrl(post.users?.avatar_url || '', post.users?.username || '', supabase)} alt={post.users.username} />
					{/if}
					<AvatarFallback class="text-xs font-medium">
						{post.users?.username?.charAt(0)?.toUpperCase() || 'U'}
					</AvatarFallback>
				</Avatar>
				<div class="text-sm">
					<div class="font-medium">{post.users?.username || 'Unknown'}</div>
					<div class="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</div>
				</div>
			</div>
		</div>
	</CardHeader>

	<CardContent class="flex-grow pt-0">
		{#if (post.posts_tags_rel?.map((rel) => rel.post_tags.tag_name) || []).length > 0}
			<div class="mb-3 flex flex-wrap gap-1">
				{#each (post.posts_tags_rel?.map((rel) => rel.post_tags.tag_name) || []) as tag, i}
					{#if i < 3}
						<Button
							variant="outline"
							size="sm"
							href={`/posts?tags=${encodeURIComponent(tag)}`}
							class="h-6 px-2 text-xs"
						>
							{tag}
						</Button>
					{:else if i === 3}
						<div class="flex h-6 items-center rounded border px-2 text-xs text-muted-foreground">
							+{(post.posts_tags_rel?.map((rel) => rel.post_tags.tag_name) || []).length - 3}
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</CardContent>

	<CardFooter class="flex flex-shrink-0 items-center justify-between pt-0">
		<div class="flex items-center gap-3 text-sm text-muted-foreground">
			<span class="flex items-center gap-1">
				<Eye class="h-4 w-4" />
				{post.post_views || 0}
			</span>
			<span class="flex items-center gap-1">
				<Heart class="h-4 w-4" />
				{post.post_likes?.length || 0}
			</span>
			<span class="flex items-center gap-1">
				<MessageCircle class="h-4 w-4" />
				{post.post_comments?.length || 0}
			</span>
		</div>

		<Button variant="outline" size="sm" href="/posts/{post.id}" class="h-8 px-3 text-sm">
			Read More
		</Button>
	</CardFooter>
</Card>
