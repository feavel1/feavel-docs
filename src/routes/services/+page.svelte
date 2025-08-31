<script lang="ts">
	import ServiceCard from '$lib/components/modules/cards/ServiceCard.svelte';

	interface Service {
		id: number;
		name: string;
		price: number;
		cover_url?: string;
		highlights: string[];
		service_type: string;
		status: string;
		created_at: string;
	}

	let { data } = $props();
	let { services } = data;

	let searchQuery = $state('');

	let filteredServices = $derived.by(() => {
		let filtered = [...services]; // Create a copy to avoid mutating original

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(
				(service: Service) =>
					service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					service.service_type?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

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

	<!-- Search -->
	<div class="mb-6 max-w-md">
		<input
			type="text"
			placeholder="Search services..."
			bind:value={searchQuery}
			class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
		/>
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
				{:else}
					No services are currently available.
				{/if}
			</p>
		</div>
	{/if}
</div>
