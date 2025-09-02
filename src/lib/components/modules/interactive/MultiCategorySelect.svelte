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

	interface ServiceCategory {
		id: number;
		category_name: string;
	}

	interface Props {
		categories: ServiceCategory[];
		selectedCategories: string[];
		placeholder?: string;
		label?: string;
		showSearch?: boolean;
	}

	let {
		categories,
		selectedCategories = $bindable(),
		placeholder = 'Select categories...',
		label = '',
		showSearch = true
	}: Props = $props();

	let open = $state(false);

	function toggleCategory(categoryName: string) {
		if (!categoryName || typeof categoryName !== 'string') {
			console.warn('Invalid category name provided to toggleCategory');
			return;
		}

		const sanitizedCategoryName = categoryName.trim();

		if (selectedCategories.includes(sanitizedCategoryName)) {
			selectedCategories = selectedCategories.filter(
				(category) => category !== sanitizedCategoryName
			);
		} else {
			// Validate that the category exists in the available categories
			const categoryExists = categories.some(
				(category) => category.category_name === sanitizedCategoryName
			);
			if (categoryExists) {
				selectedCategories = [...selectedCategories, sanitizedCategoryName];
			} else {
				console.warn('Category not found in available categories:', sanitizedCategoryName);
			}
		}
	}

	function clearAll() {
		selectedCategories = [];
	}
</script>

<div class="">
	{#if label}
		<label
			for="category-select"
			class="mb-2 block text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			{label}
		</label>
	{/if}

	<Popover bind:open>
		<PopoverTrigger>
			<Button
				id="category-select"
				variant={selectedCategories.length > 0 ? 'default' : 'outline'}
				role="combobox"
				aria-expanded={open}
				class={cn(
					'w-full justify-between',
					selectedCategories.length > 0 && 'bg-primary text-primary-foreground hover:bg-primary/90'
				)}
			>
				<div class="flex items-center gap-2">
					{#if selectedCategories.length > 0}
						<Filter class="h-4 w-4" />
						<span class="font-medium">
							{selectedCategories.length} filter{selectedCategories.length === 1 ? '' : 's'} applied
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
					<CommandInput placeholder="Search categories..." />
				{/if}
				<CommandList>
					<CommandEmpty>No categories found.</CommandEmpty>
					<CommandGroup>
						{#each categories as category}
							<CommandItem
								value={category.category_name}
								onclick={() => toggleCategory(category.category_name)}
								class="flex items-center justify-between"
							>
								<span>{category.category_name}</span>
								{#if selectedCategories.includes(category.category_name)}
									<Check class="h-4 w-4" />
								{/if}
							</CommandItem>
						{/each}
					</CommandGroup>
					{#if selectedCategories.length > 0}
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
