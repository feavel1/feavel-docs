<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Command,
		CommandEmpty,
		CommandGroup,
		CommandInput,
		CommandItem,
		CommandList
	} from '$lib/components/ui/command';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import { Check, ChevronsUpDown, Filter } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	interface Tag {
		id: number;
		tag_name: string;
	}

	interface Props {
		tags: Tag[];
		selectedTags: string[];
		placeholder?: string;
		label?: string;
		showSearch?: boolean;
	}

	let {
		tags,
		selectedTags = $bindable(),
		placeholder = 'Select tags...',
		label = '',
		showSearch = true
	}: Props = $props();

	let open = $state(false);

	function toggleTag(tagName: string) {
		if (selectedTags.includes(tagName)) {
			selectedTags = selectedTags.filter((tag) => tag !== tagName);
		} else {
			selectedTags = [...selectedTags, tagName];
		}
	}

	function clearAll() {
		selectedTags = [];
	}
</script>

<div class="">
	{#if label}
		<label
			for="tag-select"
			class="mb-2 block text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			{label}
		</label>
	{/if}

	<Popover bind:open>
		<PopoverTrigger>
			<Button
				id="tag-select"
				variant={selectedTags.length > 0 ? 'default' : 'outline'}
				role="combobox"
				aria-expanded={open}
				class={cn(
					'w-full justify-between',
					selectedTags.length > 0 && 'bg-primary text-primary-foreground hover:bg-primary/90'
				)}
			>
				<div class="flex items-center gap-2">
					{#if selectedTags.length > 0}
						<Filter class="h-4 w-4" />
						<span class="font-medium">
							{selectedTags.length} filter{selectedTags.length === 1 ? '' : 's'} applied
						</span>
					{:else}
						<span class="text-muted-foreground">{placeholder}</span>
					{/if}
				</div>
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		</PopoverTrigger>
		<PopoverContent class="w-full p-0">
			<Command>
				{#if showSearch}
					<CommandInput placeholder="Search tags..." />
				{/if}
				<CommandList>
					<CommandEmpty>No tags found.</CommandEmpty>
					<CommandGroup>
						{#each tags as tag}
							<CommandItem
								value={tag.tag_name}
								onclick={() => toggleTag(tag.tag_name)}
								class="flex items-center justify-between"
							>
								<span>{tag.tag_name}</span>
								{#if selectedTags.includes(tag.tag_name)}
									<Check class="h-4 w-4" />
								{/if}
							</CommandItem>
						{/each}
					</CommandGroup>
					{#if selectedTags.length > 0}
						<div class="border-t p-2">
							<Button variant="ghost" size="sm" onclick={clearAll} class="w-full text-xs">
								Clear all
							</Button>
						</div>
					{/if}
				</CommandList>
			</Command>
		</PopoverContent>
	</Popover>
</div>
