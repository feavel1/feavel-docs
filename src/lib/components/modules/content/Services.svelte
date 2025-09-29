<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search, Clock, DollarSign } from '@lucide/svelte';
	import MultiSelect from '$lib/components/modules/interactive/MultiSelect.svelte';
	import SingleSelect from '$lib/components/modules/interactive/SingleSelect.svelte';
	import ServiceCard from '$lib/components/modules/cards/ServiceCard.svelte';
	import type { ServiceCategory } from '$lib/utils/serviceCategories';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { toast } from 'svelte-sonner';

	interface Props {
		supabase: SupabaseClient;
		servicesPerPage?: number;
		initialServices?: any[];
		initialCategories?: ServiceCategory[];
	}

	let {
		supabase,
		servicesPerPage = 9,
		initialServices = [],
		initialCategories = []
	}: Props = $props();

	let searchQuery = $state('');
	let selectedCategories = $state<string[]>([]);
	let sortBy = $state<'newest' | 'price_low' | 'price_high'>('newest');
	let allServices = $state<any[]>(initialServices);
	let displayedServices = $state<any[]>([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let hasMoreServices = $state(true);
	let offset = $state(0);
	let allCategories = $state<ServiceCategory[]>(initialCategories);

	// Define sort options for SingleSelect component
	const options = $state([
		{ value: 'newest', label: 'Newest', icon: Clock },
		{ value: 'price_low', label: 'Price: Low to High', icon: DollarSign },
		{ value: 'price_high', label: 'Price: High to Low', icon: DollarSign }
	]);

	// Initialize selectedCategories and sortBy from URL parameters
	const urlCategories = $derived(page.url.searchParams.get('categories'));
	const urlSort = $derived(page.url.searchParams.get('sort'));

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

	// Fetch initial services and categories
	$effect(() => {
		fetchInitialData();
	});

	async function fetchInitialData() {
		loading = true;
		try {
			// If we don't have categories yet, fetch them
			if (allCategories.length === 0) {
				const { data: categories, error: categoriesError } = await supabase
					.from('services_category')
					.select('id, category_name')
					.order('category_name');

				if (categoriesError) {
					console.error('Error fetching categories:', categoriesError);
					toast.error('Failed to load service categories');
				} else {
					allCategories = categories || [];
				}
			}

			// Fetch initial services
			await fetchServices();
		} catch (error) {
			console.error('Error fetching initial data:', error);
			toast.error('Failed to load services');
		} finally {
			loading = false;
		}
	}

	async function fetchServices() {
		try {
			// If we're fetching the first batch, clear the existing services
			if (offset === 0) {
				allServices = [];
			}

			// Fetch services with pagination
			const { data: services, error } = await supabase
				.from('services_v2')
				.select(
					`
					id,
					name,
					price,
					cover_url,
					highlights,
					service_type,
					status,
					created_at,
					created_by,
					studios!services_v2_created_by_fkey(name),
					services_category_rel(
						services_category!inner(category_name)
					)
				`
				)
				.eq('enabled', true)
				.range(offset, offset + servicesPerPage - 1)
				.order('created_at', { ascending: false });

			if (error) {
				console.error('Error fetching services:', error);
				toast.error('Failed to load services');
				return;
			}

			// Update services
			if (offset === 0) {
				allServices = services || [];
			} else {
				allServices = [...allServices, ...(services || [])];
			}

			// Check if there are more services
			hasMoreServices = (services?.length || 0) >= servicesPerPage;

			// Update displayed services (apply filtering and sorting)
			updateDisplayedServices();
		} catch (error) {
			console.error('Error in fetchServices:', error);
			toast.error('Failed to load services');
		}
	}

	function updateDisplayedServices() {
		let filtered = [...allServices]; // Create a copy to avoid mutating original

		// Filter by categories
		if (selectedCategories.length > 0) {
			filtered = filtered.filter((service: any) =>
				service.services_category_rel?.some((rel: any) =>
					selectedCategories.includes(rel.services_category.category_name)
				)
			);
		}

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter((service: any) =>
				service.name?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Sort services
		filtered.sort((a: any, b: any) => {
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

		displayedServices = filtered;
	}

	async function loadMoreServices() {
		if (!hasMoreServices || loadingMore) return;

		loadingMore = true;
		offset += servicesPerPage;
		await fetchServices();
		loadingMore = false;
	}

	// Reset pagination when filters or sort change
	$effect(() => {
		offset = 0;
		fetchServices();
	});

	// Update displayed services when allServices changes
	$effect(() => {
		updateDisplayedServices();
	});
</script>

<!-- Search, Filters, and Sorting -->
<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
	<div class="relative max-w-md flex-1">
		<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
		<Input placeholder="Search services..." bind:value={searchQuery} class="pl-10" />
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<SingleSelect bind:value={sortBy} {options} placeholder="Sort by..." />

		<MultiSelect
			items={allCategories}
			bind:selectedItems={selectedCategories}
			itemNameProperty="category_name"
		/>
	</div>
</div>

<!-- Services Grid -->
{#if loading}
	<div class="flex justify-center py-12">
		<div
			class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
		></div>
	</div>
{:else if displayedServices.length > 0}
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each displayedServices as service (service.id)}
			<ServiceCard {service} />
		{/each}
	</div>

	<!-- Load More Button -->
	{#if hasMoreServices}
		<div class="mt-8 flex justify-center">
			<Button onclick={loadMoreServices} disabled={loadingMore} variant="outline">
				{#if loadingMore}
					<div
						class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
					></div>
					Loading...
				{:else}
					Load More
				{/if}
			</Button>
		</div>
	{:else if offset > 0 && !hasMoreServices}
		<!-- "You reached bottom" message -->
		<div class="mt-8 text-center text-muted-foreground">
			<p>You reached bottom</p>
		</div>
	{/if}

	<!-- Results count -->
	<div class="mt-6 text-center text-sm text-muted-foreground">
		Showing {displayedServices.length} services
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
