<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus, Search } from '@lucide/svelte';

	interface Props {
		searchQuery: string;
		selectedTags: string[];
	}

	let { searchQuery, selectedTags }: Props = $props();
</script>

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
