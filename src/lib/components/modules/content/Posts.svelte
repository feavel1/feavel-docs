<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Eye, Heart, Search, Clock, Plus } from '@lucide/svelte';
	import MultiSelect from '$lib/components/modules/interactive/MultiSelect.svelte';
	import SingleSelect from '$lib/components/modules/interactive/SingleSelect.svelte';
	import PostCard from '$lib/components/modules/cards/PostCard.svelte';
	import { getPostLikes } from '$lib/utils/posts';
	import type { Post } from '$lib/utils/posts';
	import type { SupabaseClient } from '@supabase/supabase-js';

	interface Props {
		supabase: SupabaseClient;
		postsPerPage?: number;
		userId?: string;
		hideControls?: boolean;
		showDrafts?: boolean;
	}

	let {
		supabase,
		postsPerPage = 9,
		userId,
		hideControls = false,
		showDrafts = false
	}: Props = $props();

	let searchQuery = $state('');
	let selectedTags = $state<string[]>([]);
	let sortBy = $state<'newest' | 'popular' | 'liked'>('newest');
	let allPosts = $state<Post[]>([]);
	let displayedPosts = $state<Post[]>([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let hasMorePosts = $state(true);
	let offset = $state(0);
	let allTags = $state<{ id: number; tag_name: string }[]>([]);

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

	// Fetch initial posts and tags
	$effect(() => {
		fetchInitialData();
	});

	async function fetchInitialData() {
		loading = true;
		try {
			// Fetch tags for filtering
			const { data: tags, error: tagsError } = await supabase
				.from('post_tags')
				.select('id, tag_name')
				.order('tag_name');

			if (tagsError) {
				console.error('Error fetching tags:', tagsError);
			} else {
				allTags = tags || [];
			}

			// Fetch initial posts
			await fetchPosts();
		} catch (error) {
			console.error('Error fetching initial data:', error);
		} finally {
			loading = false;
		}
	}

	async function fetchPosts() {
		try {
			let query = supabase
				.from('posts')
				.select(
					`
					*,
					users!inner(username, avatar_url),
					posts_tags_rel(
						post_tags!inner(tag_name)
					),
					post_likes(id),
					post_comments(id)
				`
				)
				.range(offset, offset + postsPerPage - 1)
				.order('created_at', { ascending: false });

			// Filter by user ID if provided
			if (userId) {
				query = query.eq('user_id', userId);
				// Only filter by public_visibility if not showing drafts
				if (!showDrafts) {
					query = query.eq('public_visibility', true);
				}
			} else {
				// Only show public posts for general feed
				query = query.eq('public_visibility', true);
			}

			const { data: posts, error } = await query;

			if (error) {
				console.error('Error fetching posts:', error);
				return;
			}

			// Update posts
			if (offset === 0) {
				allPosts = posts || [];
			} else {
				allPosts = [...allPosts, ...(posts || [])];
			}

			// Check if there are more posts
			hasMorePosts = (posts?.length || 0) >= postsPerPage;

			// Update displayed posts
			updateFilteredPosts();
		} catch (error) {
			console.error('Error in fetchPosts:', error);
		}
	}

	function updateFilteredPosts() {
		let filtered = [...allPosts]; // Create a copy to avoid mutating original

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

		displayedPosts = filtered; // For now, show all filtered posts
	}

	async function loadMorePosts() {
		if (!hasMorePosts || loadingMore) return;

		loadingMore = true;
		offset += postsPerPage;
		await fetchPosts();
		loadingMore = false;
	}

	// Update filtered posts when search, tags, or sort change
	$effect(() => {
		updateFilteredPosts();
	});
</script>

<!-- Search, Filters, and Sorting -->
{#if !hideControls}
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="relative max-w-md flex-1">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input placeholder="Search posts..." bind:value={searchQuery} class="pl-10" />
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<SingleSelect bind:value={sortBy} {options} placeholder="Sort by..." />
			<MultiSelect items={allTags} bind:selectedItems={selectedTags} itemNameProperty="tag_name" />
		</div>
	</div>
{/if}

<!-- Posts Grid -->
{#if loading}
	<div class="flex justify-center py-12">
		<div
			class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
		></div>
	</div>
{:else if displayedPosts.length > 0}
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each displayedPosts as post (post.id)}
			<PostCard {post} {supabase} />
		{/each}
	</div>

	<!-- Load More Button -->
	{#if hasMorePosts}
		<div class="mt-8 flex justify-center">
			<Button onclick={loadMorePosts} disabled={loadingMore} variant="outline">
				{#if loadingMore}
					<div
						class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
					></div>
					Loading...
				{:else}
					Load More
				{/if}
			</Button>
		</div>
	{/if}

	<!-- Results count -->
	<div class="mt-6 text-center text-sm text-muted-foreground">
		Showing {displayedPosts.length} posts
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
				{#if userId}
					Create a post
				{:else}
					Create the first post
				{/if}
			</Button>
		{/if}
	</div>
{/if}
