<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Search } from '@lucide/svelte';
	import type { Tag } from '$lib/types/posts';
	import MultiTagSelect from '../interactive/MultiTagSelect.svelte';

	interface Props {
		tags: Tag[];
		searchQuery: string;
		selectedTags: string[];
		onSearchChange: (query: string) => void;
		onTagsChange: (tags: string[]) => void;
	}

	let { tags, searchQuery, selectedTags }: Props = $props();
</script>

<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
	<div class="relative max-w-md flex-1">
		<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		<Input placeholder="Search posts..." bind:value={searchQuery} class="pl-10" />
	</div>

	<div class="w-[300px]">
		<MultiTagSelect
			{tags}
			bind:selectedTags
			placeholder="Filter by tags..."
			label=""
			showSearch={false}
		/>
	</div>
</div>
