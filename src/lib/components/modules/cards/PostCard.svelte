<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Eye, Heart, MessageCircle } from '@lucide/svelte';
	import type { Post } from '$lib/utils/posts';
	import { FileStorage } from '$lib/services/storage';

	interface Props {
		post: Post;
		supabase: any;
	}

	let { post, supabase }: Props = $props();
	let postCoverUrl = $state<string | null>(null);
	let userAvatarUrl = $state<string | null>(null);

	// Asynchronously get cover URL
	$effect(() => {
		const fetchCoverUrl = async () => {
			if (post.cover_file_id && supabase) {
				const storage = new FileStorage(supabase);
				const url = await storage.getUrl(post.cover_file_id);
				postCoverUrl = url || null;
			}
		};
		fetchCoverUrl();
	});

	// Asynchronously get user avatar URL
	$effect(() => {
		const fetchAvatarUrl = async () => {
			if (post.users?.avatar_file_id && supabase) {
				const storage = new FileStorage(supabase);
				const avatarUrl = await storage.getUrl(post.users.avatar_file_id);
				userAvatarUrl = avatarUrl || null;
			}
		};
		fetchAvatarUrl();
	});
</script>

<Card class="group flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
	{#if post.cover_file_id}
		<div class="aspect-video overflow-hidden">
			{#if postCoverUrl}
				<img
					src={postCoverUrl}
					alt={post.title}
					loading="lazy"
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>
			{:else}
				<div class="h-full w-full animate-pulse bg-muted"></div>
			{/if}
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
					{#if userAvatarUrl}
						<AvatarImage src={userAvatarUrl} alt={post.users?.username || ''} />
					{/if}
					<AvatarFallback class="text-xs font-medium">
						{post.users?.username?.charAt(0)?.toUpperCase() || 'U'}
					</AvatarFallback>
				</Avatar>
				<div class="text-sm">
					<div class="font-medium">{post.users?.username || 'Unknown'}</div>
					<div class="text-xs text-muted-foreground">
						{new Date(post.created_at).toLocaleDateString()}
					</div>
				</div>
			</div>
		</div>
	</CardHeader>

	<CardContent class="flex-grow pt-0">
		{#if (post.posts_tags_rel
				?.map((rel) => rel.posts_tags?.tag_name)
				.filter(Boolean) || []).length > 0}
			<div class="mb-3 flex flex-wrap gap-1">
				{#each post.posts_tags_rel
					?.map((rel) => rel.posts_tags?.tag_name)
					.filter(Boolean) || [] as tag, i}
					{#if i < 3}
						<Button
							variant="outline"
							size="sm"
							href={`/posts?tags=${encodeURIComponent(tag || '')}`}
							class="h-6 px-2 text-xs"
						>
							{tag}
						</Button>
					{:else if i === 3}
						<div class="flex h-6 items-center rounded border px-2 text-xs text-muted-foreground">
							+{(post.posts_tags_rel?.map((rel) => rel.posts_tags?.tag_name).filter(Boolean) || [])
								.length - 3}
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
				{post.posts_likes?.length || 0}
			</span>
			<span class="flex items-center gap-1">
				<MessageCircle class="h-4 w-4" />
				{post.posts_comments?.length || 0}
			</span>
		</div>

		<Button variant="outline" size="sm" href="/posts/{post.id}" class="h-8 px-3 text-sm">
			Read More
		</Button>
	</CardFooter>
</Card>
