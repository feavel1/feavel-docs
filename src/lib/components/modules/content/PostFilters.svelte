<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Search } from '@lucide/svelte';
	import MultiSelect from '../interactive/MultiSelect.svelte';

	let { tags, searchQuery, selectedTags } = $props();
</script>

<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
	<div class="relative max-w-md flex-1">
		<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		<Input placeholder="Search posts..." bind:value={searchQuery} class="pl-10" />
	</div>

	<div class="w-[300px]">
		<MultiSelect
			items={tags}
			bind:selectedItems={selectedTags}
			itemNameProperty="tag_name"
			placeholder="Filter by tags..."
			label=""
			showSearch={false}
			searchPlaceholder="Search tags..."
			emptyMessage="No tags found."
		/>
	</div>
</div>
