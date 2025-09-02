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

	interface SelectableItem {
		id: number | string;
		[name: string]: any;
	}

	interface Props<T extends SelectableItem> {
		items: T[];
		selectedItems: string[];
		itemNameProperty: string;
		placeholder?: string;
		label?: string;
		showSearch?: boolean;
		searchPlaceholder?: string;
		emptyMessage?: string;
	}

	let {
		items,
		selectedItems = $bindable(),
		itemNameProperty,
		placeholder = 'Select items...',
		label = '',
		showSearch = true,
		searchPlaceholder = 'Search...',
		emptyMessage = 'No items found.'
	}: Props<SelectableItem> = $props();

	let open = $state(false);

	function toggleItem(itemName: string) {
		if (!itemName || typeof itemName !== 'string') {
			console.warn('Invalid item name provided to toggleItem');
			return;
		}

		const sanitizedItemName = itemName.trim();

		if (selectedItems.includes(sanitizedItemName)) {
			selectedItems = selectedItems.filter((item) => item !== sanitizedItemName);
		} else {
			// Validate that the item exists in the available items
			const itemExists = items.some((item) => item[itemNameProperty] === sanitizedItemName);
			if (itemExists) {
				selectedItems = [...selectedItems, sanitizedItemName];
			} else {
				console.warn('Item not found in available items:', sanitizedItemName);
			}
		}
	}

	function clearAll() {
		selectedItems = [];
	}
</script>

<div class="">
	{#if label}
		<label
			for="multi-select"
			class="mb-2 block text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			{label}
		</label>
	{/if}

	<Popover bind:open>
		<PopoverTrigger>
			<Button
				id="multi-select"
				variant={selectedItems.length > 0 ? 'default' : 'outline'}
				role="combobox"
				aria-expanded={open}
				class={cn(
					'w-full justify-between',
					selectedItems.length > 0 && 'bg-primary text-primary-foreground hover:bg-primary/90'
				)}
			>
				<div class="flex items-center gap-2">
					{#if selectedItems.length > 0}
						<Filter class="h-4 w-4" />
						<span class="font-medium">
							{selectedItems.length} filter{selectedItems.length === 1 ? '' : 's'} applied
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
					<CommandInput placeholder={searchPlaceholder} />
				{/if}
				<CommandList>
					<CommandEmpty>{emptyMessage}</CommandEmpty>
					<CommandGroup>
						{#each items as item}
							<CommandItem
								value={item[itemNameProperty]}
								onclick={() => toggleItem(item[itemNameProperty])}
								class="flex items-center justify-between"
							>
								<span>{item[itemNameProperty]}</span>
								{#if selectedItems.includes(item[itemNameProperty])}
									<Check class="h-4 w-4" />
								{/if}
							</CommandItem>
						{/each}
					</CommandGroup>
					{#if selectedItems.length > 0}
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
