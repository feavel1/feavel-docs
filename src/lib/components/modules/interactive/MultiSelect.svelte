<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Check, ChevronsUpDown, X, Tag } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	interface SelectableItem {
		id?: number | string;
		[name: string]: any;
	}

	interface Props<T extends SelectableItem> {
		items: T[];
		selectedItems: string[];
		itemNameProperty: string;
		label?: string;
		disabled?: boolean;
		allowNewItems?: boolean;
	}

	let {
		items,
		selectedItems = $bindable(),
		itemNameProperty,
		disabled = false,
		allowNewItems = false
	}: Props<SelectableItem> = $props();

	let open = $state(false);
	let searchValue = $state('');

	// Derived values
	let filteredItems = $derived.by(() => {
		if (!searchValue) return items;

		const searchTerm = searchValue.toLowerCase();
		const matchedItems = items.filter((item) =>
			item[itemNameProperty].toLowerCase().includes(searchTerm)
		);

		// If allowNewItems is true and search term doesn't match existing items, add it as a new item
		if (
			allowNewItems &&
			searchTerm &&
			!matchedItems.some((item) => item[itemNameProperty].toLowerCase() === searchTerm)
		) {
			return [...matchedItems, { [itemNameProperty]: searchValue } as SelectableItem];
		}

		return matchedItems;
	});

	function toggleItem(itemName: string) {
		if (disabled) return;

		if (!itemName || typeof itemName !== 'string') {
			console.warn('Invalid item name provided to toggleItem');
			return;
		}

		const sanitizedItemName = itemName.trim();
		if (!sanitizedItemName) return;

		if (selectedItems.includes(sanitizedItemName)) {
			selectedItems = selectedItems.filter((item) => item !== sanitizedItemName);
		} else {
			// Check if item exists in available items or if new items are allowed
			const itemExists = items.some((item) => item[itemNameProperty] === sanitizedItemName);
			if (itemExists || allowNewItems) {
				selectedItems = [...selectedItems, sanitizedItemName];
			} else {
				console.warn('Item not found in available items:', sanitizedItemName);
			}
		}

		// Clear search after selection
		searchValue = '';
	}

	// createNewItem function removed as we're not allowing new items

	// removeItem function removed as it's not being used

	function clearAll() {
		if (disabled) return;
		selectedItems = [];
	}

	function handleInputKeyDown(e: KeyboardEvent) {
		if (disabled) return;

		if (e.key === 'Escape') {
			open = false;
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<Button
			id="multi-select"
			variant={selectedItems.length > 0 ? 'default' : 'outline'}
			role="combobox"
			aria-expanded={open}
			{disabled}
			class={cn(
				'w-full max-w-md min-w-[180px] justify-between',
				selectedItems.length > 0 && 'bg-primary text-primary-foreground hover:bg-primary/90',
				disabled && 'cursor-not-allowed opacity-50'
			)}
		>
			<div class="flex h-full w-full items-center gap-2">
				{#if selectedItems.length > 0}
					<span class="text-sm font-medium">
						{selectedItems.length}
						{selectedItems.length === 1 ? 'item' : 'items'}
					</span>
				{:else}
					<span class="text-sm text-muted-foreground">Select items...</span>
				{/if}
			</div>
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-full p-0">
		<Command.Root>
			<div class="flex items-center border-b px-3">
				<input
					bind:value={searchValue}
					type="text"
					placeholder="Search..."
					class="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
					onkeydown={handleInputKeyDown}
					{disabled}
				/>
				{#if searchValue}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onclick={() => (searchValue = '')}
						class="h-6 w-6 p-0"
					>
						<X class="h-4 w-4" />
					</Button>
				{/if}
			</div>
			<Command.List>
				<Command.Empty>
					<div class="py-6 text-center text-sm">No items found.</div>
				</Command.Empty>
				<Command.Group>
					{#each filteredItems as item}
						<Command.Item
							value={item[itemNameProperty]}
							onclick={() => toggleItem(item[itemNameProperty])}
							disabled={disabled && !selectedItems.includes(item[itemNameProperty])}
							class="flex items-center justify-between data-[disabled=true]:opacity-50"
						>
							<span>{item[itemNameProperty]}</span>
							{#if selectedItems.includes(item[itemNameProperty])}
								<Check class="h-4 w-4" />
							{:else if allowNewItems && !items.some((i) => i[itemNameProperty] === item[itemNameProperty])}
								<Tag class="h-4 w-4" />
							{/if}
						</Command.Item>
					{/each}
				</Command.Group>
				{#if selectedItems.length > 0}
					<Command.Separator />
					<div class="p-2">
						<Button
							variant="ghost"
							size="sm"
							onclick={clearAll}
							class="h-8 w-full text-xs"
							{disabled}
						>
							Clear all
						</Button>
					</div>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
