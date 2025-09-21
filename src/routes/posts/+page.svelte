<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { Eye, Heart, Plus, Search, Clock, PackageOpen } from '@lucide/svelte';
	import MultiSelect from '$lib/components/modules/interactive/MultiSelect.svelte';
	import SingleSelect from '$lib/components/modules/interactive/SingleSelect.svelte';
	import PostCard from '$lib/components/modules/cards/PostCard.svelte';
	import { getPostLikes } from '$lib/utils/posts';

	import type { Post } from '$lib/utils/posts';

	let { data } = $props();
	let { session, posts, drafts, tags, supabase } = data;

	let searchQuery = $state('');
	let selectedTags = $state<string[]>([]);
	let sortBy = $state<'newest' | 'popular' | 'liked'>('newest');

	// Define sort options for SingleSelect component
	const options = $state([
		{ value: 'newest', label: 'Newest', icon: Clock },
		{ value: 'popular', label: 'Most Viewed', icon: Eye },
		{ value: 'liked', label: 'Most Liked', icon: Heart }
	]);

	// Initialize selectedTags from URL parameters
	const urlTags = $derived(page.url.searchParams.get('tags'));
	const urlSort = $derived(page.url.searchParams.get('sort'));

	$effect(() => {
		if (urlTags) {
			selectedTags = urlTags.split(',').map((tag) => decodeURIComponent(tag.trim()));
		} else {
			selectedTags = [];
		}

		if (urlSort && ['newest', 'popular', 'liked'].includes(urlSort)) {
			sortBy = urlSort as 'newest' | 'popular' | 'liked';
		} else {
			sortBy = 'newest';
		}
	});

	$effect(() => {
		// Update URL when selectedTags or sortBy change
		const newUrl = new URL(page.url);

		// Update tags parameter
		if (selectedTags.length > 0) {
			const newTagsParam = selectedTags.map((tag) => encodeURIComponent(tag)).join(',');
			newUrl.searchParams.set('tags', newTagsParam);
		} else {
			newUrl.searchParams.delete('tags');
		}

		// Update sort parameter
		if (sortBy !== 'newest') {
			newUrl.searchParams.set('sort', sortBy);
		} else {
			newUrl.searchParams.delete('sort');
		}

		history.replaceState(null, '', newUrl.toString());
	});

	let filteredPosts = $derived.by(() => {
		let filtered = [...posts]; // Create a copy to avoid mutating original

		// Filter by tags
		if (selectedTags.length > 0) {
			filtered = filtered.filter((post: Post) =>
				post.posts_tags_rel?.some((rel) => selectedTags.includes(rel.post_tags.tag_name))
			);
		}

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(
				(post: Post) =>
					post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					post.users?.username?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Sort posts
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'popular':
					return (b.post_views || 0) - (a.post_views || 0);
				case 'liked':
					return getPostLikes(b) - getPostLikes(a);
				case 'newest':
				default:
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			}
		});

		return filtered;
	});
</script>

<svelte:head>
	<title>Blog Posts</title>
	<meta name="description" content="Browse all blog posts" />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold">Blog Posts</h1>
			<p class="text-muted-foreground">Discover stories, ideas, and insights from our community</p>
		</div>
		<div class="flex items-center gap-2">
			{#if session && drafts && drafts.length > 0}
				<HoverCard.Root>
					<HoverCard.Trigger>
						<Button variant="outline" class="flex items-center gap-2">
							<PackageOpen class="h-4 w-4" /> Drafts ({drafts.length})
						</Button>
					</HoverCard.Trigger>
					<HoverCard.Content class="w-64 p-2">
						{#each drafts.slice(0, 5) as draft (draft.id)}
							<a
								href="/posts/{draft.id}"
								class="block cursor-pointer truncate rounded px-3 py-2 text-sm hover:bg-accent"
								title={draft.title}
							>
								{draft.title || 'Untitled Draft'}
							</a>
						{:else}
							<div class="px-3 py-2 text-sm text-muted-foreground">No drafts found</div>
						{/each}
						{#if drafts.length > 5}
							<div class="mt-1 border-t px-3 py-2 pt-2 text-center text-xs text-muted-foreground">
								+{drafts.length - 5} more drafts
							</div>
						{/if}
					</HoverCard.Content>
				</HoverCard.Root>
			{/if}
			<Button href="/posts/new" class="flex items-center gap-2">
				<Plus class="h-4 w-4" />
				New Post
			</Button>
		</div>
	</div>

	<!-- Search, Filters, and Sorting -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="relative max-w-md flex-1">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input placeholder="Search posts..." bind:value={searchQuery} class="pl-10" />
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<SingleSelect bind:value={sortBy} {options} placeholder="Sort by..." />

			<MultiSelect items={tags} bind:selectedItems={selectedTags} itemNameProperty="tag_name" />
		</div>
	</div>

	<!-- Posts Grid -->
	{#if filteredPosts.length > 0}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredPosts as post (post.id)}
				<PostCard {post} {supabase} />
			{/each}
		</div>

		<!-- Results count -->
		<div class="mt-6 text-center text-sm text-muted-foreground">
			Showing {filteredPosts.length} of {posts.length} posts
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
				{:else if selectedTags.length > 0}
					No posts found with the selected tags.
				{:else}
					No posts have been published yet.
				{/if}
			</p>
			{#if !searchQuery && selectedTags.length === 0}
				<Button href="/posts/new" class="mt-4">
					<Plus class="mr-2 h-4 w-4" />
					Create the first post
				</Button>
			{/if}
		</div>
	{/if}
</div>
