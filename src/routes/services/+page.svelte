<script lang="ts">
	import { page } from '$app/state';
	import ServiceCard from '$lib/components/modules/cards/ServiceCard.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Search, Clock, DollarSign } from '@lucide/svelte';
	import MultiCategorySelect from '$lib/components/modules/interactive/MultiCategorySelect.svelte';
	import SingleSelect from '$lib/components/modules/interactive/SingleSelect.svelte';
	import type { ServiceCategory } from '$lib/utils/serviceCategories';

	interface Service {
		id: number;
		name: string;
		price: number;
		cover_url?: string;
		highlights: string[];
		service_type: string;
		status: string;
		created_at: string;
		services_category_rel?: Array<{
			services_category: {
				category_name: string;
			};
		}>;
	}

	interface PageData {
		services: Service[];
		categories: ServiceCategory[];
	}

	let { data }: { data: PageData } = $props();
	let { services, categories } = data;

	let searchQuery = $state('');
	let selectedCategories = $state<string[]>([]);
	let sortBy = $state<'newest' | 'price_low' | 'price_high'>('newest');

	// Define sort options for SingleSelect component
	let options = $state([
		{ value: 'newest', label: 'Newest', icon: Clock },
		{ value: 'price_low', label: 'Price: Low to High', icon: DollarSign },
		{ value: 'price_high', label: 'Price: High to Low', icon: DollarSign }
	]);

	// Initialize selectedCategories and sortBy from URL parameters
	let urlCategories = $derived(page.url.searchParams.get('categories'));
	let urlSort = $derived(page.url.searchParams.get('sort'));

	$effect(() => {
		if (urlCategories) {
			selectedCategories = urlCategories
				.split(',')
				.map((category) => decodeURIComponent(category.trim()));
		} else {
			selectedCategories = [];
		}

		if (urlSort && ['newest', 'price_low', 'price_high'].includes(urlSort)) {
			sortBy = urlSort as 'newest' | 'price_low' | 'price_high';
		} else {
			sortBy = 'newest';
		}
	});

	$effect(() => {
		// Update URL when selectedCategories or sortBy change
		const newUrl = new URL(page.url);

		// Update categories parameter
		if (selectedCategories.length > 0) {
			const newCategoriesParam = selectedCategories
				.map((category) => encodeURIComponent(category))
				.join(',');
			newUrl.searchParams.set('categories', newCategoriesParam);
		} else {
			newUrl.searchParams.delete('categories');
		}

		// Update sort parameter
		if (sortBy !== 'newest') {
			newUrl.searchParams.set('sort', sortBy);
		} else {
			newUrl.searchParams.delete('sort');
		}

		history.replaceState(null, '', newUrl.toString());
	});

	let filteredServices = $derived.by(() => {
		let filtered = [...services]; // Create a copy to avoid mutating original

		// Filter by categories
		if (selectedCategories.length > 0) {
			filtered = filtered.filter((service: Service) =>
				service.services_category_rel?.some((rel) =>
					selectedCategories.includes(rel.services_category.category_name)
				)
			);
		}

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(
				(service: Service) =>
					service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					service.service_type?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Sort services
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'price_low':
					return a.price - b.price;
				case 'price_high':
					return b.price - a.price;
				case 'newest':
				default:
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			}
		});

		return filtered;
	});
</script>

<svelte:head>
	<title>Studio Services</title>
	<meta name="description" content="Browse all studio services" />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Studio Services</h1>
		<p class="text-muted-foreground">Explore our range of professional services</p>
	</div>

	<!-- Search, Filters, and Sorting -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="relative max-w-md flex-1">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input placeholder="Search services..." bind:value={searchQuery} class="pl-10" />
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<SingleSelect bind:value={sortBy} {options} placeholder="Sort by..." />

			<MultiCategorySelect
				{categories}
				bind:selectedCategories
				placeholder="Filter by categories..."
				label=""
				showSearch={false}
			/>
		</div>
	</div>

	<!-- Services Grid -->
	{#if filteredServices.length > 0}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredServices as service (service.id)}
				<ServiceCard {service} />
			{/each}
		</div>

		<!-- Results count -->
		<div class="mt-6 text-center text-sm text-muted-foreground">
			Showing {filteredServices.length} of {services.length} services
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<div class="mb-4 rounded-full bg-muted p-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-8 w-8 text-muted-foreground"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="M12 16v-4" />
					<path d="M12 8h.01" />
				</svg>
			</div>
			<h3 class="mb-2 text-lg font-semibold">No services found</h3>
			<p class="text-muted-foreground">
				{#if searchQuery}
					No services match your search criteria.
				{:else if selectedCategories.length > 0}
					No services found with the selected categories.
				{:else}
					No services are currently available.
				{/if}
			</p>
		</div>
	{/if}
</div>
