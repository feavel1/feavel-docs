<script lang="ts">
	import { Command } from '$lib/components/ui/command';
	import { searchPosts } from '$lib/utils/search';
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

	export let supabase: any;

	let searchQuery = '';
	let searchResults: Post[] = [];
	let isSearching = false;
	let isOpen = false;

	$: if (searchQuery.length > 2) {
		performSearch();
	} else {
		searchResults = [];
	}

	async function performSearch() {
		isSearching = true;
		const { data } = await searchPosts(supabase, searchQuery);
		searchResults = data || [];
		isSearching = false;
	}

	function handleSelect(value: string) {
		const post = searchResults.find((p) => p.title === value);
		if (post) {
			goto(`/posts/${post.id}`);
			isOpen = false;
			searchQuery = '';
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
			searchQuery = '';
		}
	}
</script>

<!-- Search Command Component -->
<div class="relative">
	<input
		type="text"
		placeholder="Search posts..."
		bind:value={searchQuery}
		on:keydown={handleKeyDown}
		class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
	/>

	{#if isSearching}
		<div
			class="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md"
		>
			<div class="p-4 text-sm text-muted-foreground">Searching...</div>
		</div>
	{:else if searchResults.length > 0}
		<div
			class="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md"
		>
			{#each searchResults as post (post.id)}
				<button
					class="relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
					on:click={() => handleSelect(post.title)}
				>
					<div class="flex items-center gap-2">
						<span class="font-medium">{post.title}</span>
						<span class="text-muted-foreground">by {post.users?.username}</span>
					</div>
				</button>
			{/each}
		</div>
	{:else if searchQuery.length > 2}
		<div
			class="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md"
		>
			<div class="p-4 text-sm text-muted-foreground">No posts found.</div>
		</div>
	{/if}
</div>
