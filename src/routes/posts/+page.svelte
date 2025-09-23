<script lang="ts">
	import Posts from '$lib/components/modules/content/Posts.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { PackageOpen, Plus } from '@lucide/svelte';

	let { data } = $props();
	let { session, drafts, supabase } = data;
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
			{#if session && drafts}
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

	<Posts {supabase} />
</div>
