<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Edit, Eye, Plus, Search, Tag, X } from '@lucide/svelte';
	import { goto } from '$app/navigation';

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

	let {
		posts = [],
		currentTag = null,
		session
	} = $props<{
		posts: Post[];
		currentTag: string | null;
		session?: any;
	}>();

	let searchQuery = $state('');
	let filteredPosts = $derived(
		searchQuery
			? posts.filter(
					(post: Post) =>
						post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
						post.users?.username?.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: posts
	);

	function handleTagClick(tag: string) {
		goto(`/posts?tag=${encodeURIComponent(tag)}`);
	}

	function clearTagFilter() {
		goto('/posts');
	}

	function handleSearch() {
		// Search functionality will be implemented with command palette
		console.log('Search:', searchQuery);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}
</script>

<svelte:head>
	<title>Blog Posts</title>
	<meta name="description" content="Browse all blog posts" />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Blog Posts</h1>
			<p class="text-muted-foreground">Discover stories, ideas, and insights from our community</p>
		</div>
		<Button href="/posts/new" class="flex items-center gap-2">
			<Plus class="h-4 w-4" />
			New Post
		</Button>
	</div>

	<!-- Search and Filters -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="relative max-w-md flex-1">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				placeholder="Search posts..."
				bind:value={searchQuery}
				class="pl-10"
				onkeydown={handleKeyDown}
			/>
		</div>

		{#if currentTag}
			<div class="flex items-center gap-2">
				<Tag class="h-4 w-4 text-muted-foreground" />
				<Badge variant="secondary" class="flex items-center gap-1">
					{currentTag}
					<Button
						variant="ghost"
						size="sm"
						class="h-auto p-0 hover:bg-transparent"
						onclick={clearTagFilter}
					>
						<X class="h-3 w-3" />
					</Button>
				</Badge>
			</div>
		{/if}
	</div>

	<!-- Posts Grid -->
	{#if filteredPosts.length > 0}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredPosts as post (post.id)}
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
							{#if post.user_id === session?.user?.id}
								<Button variant="ghost" size="sm" href={`/posts/edit/${post.id}`}>
									<Edit class="h-4 w-4" />
								</Button>
							{/if}
						</div>

						<div class="flex items-center gap-2 text-sm text-muted-foreground">
							<span>by {post.users?.username || 'Unknown'}</span>
							<span>•</span>
							<span>{new Date(post.created_at).toLocaleDateString()}</span>
							<span>•</span>
							<span class="flex items-center gap-1">
								<Eye class="h-4 w-4" />
								{post.post_views || 0}
							</span>
						</div>
					</CardHeader>
					<CardContent class="pt-0">
						{#if post.posts_tags_rel && post.posts_tags_rel.length > 0}
							<div class="mb-3 flex flex-wrap gap-1">
								{#each post.posts_tags_rel as relation (relation.post_tags.tag_name)}
									<Badge
										variant="outline"
										class="cursor-pointer text-xs hover:bg-primary/10"
										onclick={() => handleTagClick(relation.post_tags.tag_name)}
									>
										{relation.post_tags.tag_name}
									</Badge>
								{/each}
							</div>
						{/if}
						<Button variant="outline" size="sm" href="/posts/{post.id}" class="w-full">
							Read More
						</Button>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<div class="mb-4 rounded-full bg-muted p-4">
				<Search class="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 class="mb-2 text-lg font-semibold">No posts found</h3>
			<p class="text-muted-foreground">
				{#if searchQuery}
					No posts match your search criteria.
				{:else if currentTag}
					No posts found with the tag "{currentTag}".
				{:else}
					No posts have been published yet.
				{/if}
			</p>
			{#if !searchQuery && !currentTag}
				<Button href="/posts/new" class="mt-4">
					<Plus class="mr-2 h-4 w-4" />
					Create the first post
				</Button>
			{/if}
		</div>
	{/if}
</div>
