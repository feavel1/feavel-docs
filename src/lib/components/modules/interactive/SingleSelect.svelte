<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { cn } from '$lib/utils';

	interface Option {
		value: string;
		label: string;
		icon?: any;
	}

	interface Props {
		options: Option[];
		value: string;
		placeholder?: string;
		label?: string;
	}

	let {
		options,
		value = $bindable(),
		placeholder = 'Select an option...',
		label = ''
	}: Props = $props();
</script>

<div class="w-auto min-w-[180px]">
	{#if label}
		<label
			class="mb-2 block text-sm leading-none font-medium text-muted-foreground"
			for="single-select"
		>
			{label}
		</label>
	{/if}

	<Select.Root bind:value type="single">
		<Select.Trigger id="single-select" class={cn('w-[180px]', value && 'text-foreground')}>
			<div class="flex items-center gap-2">
				{#if value}
					{#if options.find((opt) => opt.value === value)?.icon}
						{@const Icon = options.find((opt) => opt.value === value)?.icon}
						<Icon class="h-4 w-4" />
					{/if}
					<span class="truncate font-medium">
						{options.find((opt) => opt.value === value)?.label || value}
					</span>
				{:else}
					<span class="truncate text-muted-foreground">{placeholder}</span>
				{/if}
			</div>
			<!-- <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" /> -->
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				{#each options as option}
					<Select.Item value={option.value}>
						<div class="flex items-center gap-2">
							{#if option.icon}
								{@const Icon = option.icon}
								<Icon class="h-4 w-4" />
							{/if}
							<span>{option.label}</span>
						</div>
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
