<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { ArrowLeft, Calendar, User, Phone, Edit } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { getServiceTags } from '$lib/utils/services';
	import { FileStorage } from '$lib/services/storage';
	import ServiceFileDisplay from '$lib/components/modules/services/ServiceFileDisplay.svelte';

	let { data } = $props();
	let { service, userProfile, supabase, canAccessProduct } = data;

	// Simplified studio data access - based on our query, studios is an object with name, description, and contact_phone
	let studio = $derived(service?.studios || null);

	// Check if user can edit this service (authorized studio owner)
	let canEdit = $derived(
		userProfile?.studio?.id && service?.created_by && userProfile.studio.id === service.created_by
	);

	// Derived values
	let tags = $derived(service ? getServiceTags(service as any) : []);

	// State for resolved cover URL
	let coverUrl = $state('');

	$effect(() => {
		const fetchCoverUrl = async () => {
			if (service?.cover_file_id && supabase) {
				const storage = new FileStorage(supabase);
				const url = await storage.getUrl(service.cover_file_id);
				coverUrl = url || '';
			}
		};
		fetchCoverUrl();
	});

	function handleOrderService() {
		if (!userProfile) {
			// Redirect to login if not authenticated
			goto('/auth/login?redirectTo=/studio/services/' + service.id);
		} else {
			// For now, we'll just show an alert that this feature is not implemented yet
			alert('Order service functionality will be implemented in a future update.');
		}
	}

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price);
	}
</script>

<svelte:head>
	<title>{service?.name || 'Service Not Found'}</title>
	<meta name="description" content={service?.name || 'Service details'} />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<!-- Back Button -->
	<Button href="/services" variant="ghost" class="mb-6">
		<ArrowLeft class="mr-2 h-4 w-4" />
		Back to Services
	</Button>

	{#if service}
		<!-- Service Header -->

		<div class="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
			<div class="min-w-0 flex-1">
				<h1 class="mb-2 text-3xl font-bold break-words md:text-4xl">{service.name}</h1>
				<div class="mb-4 flex flex-wrap items-center gap-4 text-muted-foreground">
					<div class="flex min-w-0 items-center gap-2">
						<User class="h-4 w-4 flex-shrink-0" />
						<span class="truncate"
							>{typeof studio === 'object' && studio !== null && 'name' in studio
								? studio.name
								: 'Unknown Studio'}</span
						>
					</div>
					<div class="flex items-center gap-2">
						<Calendar class="h-4 w-4 flex-shrink-0" />
						<span>{new Date(service.created_at || '').toLocaleDateString()}</span>
					</div>
				</div>
			</div>

			<div class="flex flex-shrink-0 gap-2">
				{#if canEdit}
					<Button
						href="/studios/dashboard/services/{service.id}"
						variant="outline"
						class="flex-shrink-0"
					>
						<Edit class="mr-2 h-4 w-4" />
						Edit
					</Button>
				{/if}
				<Button onclick={handleOrderService} class="flex-shrink-0">
					Order for {formatPrice(service.price)}
				</Button>
			</div>
		</div>

		{#if coverUrl}
			<div class="mb-6 overflow-hidden rounded-lg">
				<img src={coverUrl} alt={service.name} class="h-64 w-full object-cover md:h-96" />
			</div>
		{/if}

		{#if tags.length > 0}
			<div class="mb-6 flex flex-wrap gap-2">
				{#each tags as tag}
					<Button
						variant="outline"
						size="sm"
						href={`/services?categories=${encodeURIComponent(tag)}`}
						class="h-7 px-3 text-xs"
					>
						{tag}
					</Button>
				{/each}
			</div>
		{/if}

		<!-- Service Content -->
		<Card class="mb-8">
			<CardHeader>
				<h2 class="text-2xl font-semibold">Description</h2>
			</CardHeader>
			<CardContent>
				{#if service.description}
					<div class="prose prose-lg max-w-none">
						<p>
							{@html typeof service.description === 'string'
								? service.description
								: JSON.stringify(service.description)}
						</p>
					</div>
				{:else}
					<p class="text-muted-foreground">No description available.</p>
				{/if}

				<!-- Highlights -->
				{#if service.highlights}
					{@const highlightsArray = Array.isArray(service.highlights)
						? service.highlights
						: typeof service.highlights === 'string'
							? JSON.parse(service.highlights) || []
							: []}
					{#if highlightsArray.length > 0}
						<div class="mt-6">
							<h3 class="mb-3 text-lg font-medium">Highlights</h3>
							<ul class="space-y-1">
								{#each highlightsArray as highlight}
									<li class="flex items-start">
										<span class="mt-1 mr-2">•</span>
										<span>{highlight}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				{/if}
			</CardContent>
		</Card>

		<!-- Download Files (for download-type services) -->
		{#if service.type === 'download'}
			<ServiceFileDisplay {supabase} serviceId={service.id} {canAccessProduct} />
		{/if}

		<!-- Studio Info -->
		<Card>
			<CardHeader>
				<h3 class="text-lg font-semibold">About the Studio</h3>
			</CardHeader>
			<CardContent>
				{#if studio && typeof studio === 'object' && studio !== null && 'name' in studio}
					<div class="flex items-center gap-4">
						<div class="flex-shrink-0">
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
								<span class="text-lg font-medium text-gray-700">
									{(typeof studio.name === 'string' ? studio.name.charAt(0)?.toUpperCase() : '') ||
										'S'}
								</span>
							</div>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate font-medium">{studio.name}</p>
							<p class="mb-2 truncate text-sm text-muted-foreground">
								{('description' in studio && studio.description) || 'No description available'}
							</p>
							<div class="flex items-center gap-2 text-sm">
								<Phone class="h-4 w-4 flex-shrink-0" />
								<span class="truncate">
									{('contact_phone' in studio && studio.contact_phone) ||
										'No contact phone available'}
								</span>
							</div>
						</div>
					</div>
				{:else}
					<p class="text-muted-foreground">Studio information not available</p>
				{/if}
			</CardContent>
		</Card>
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
			<h3 class="mb-2 text-lg font-semibold">Service Not Found</h3>
			<p class="mb-4 text-muted-foreground">
				The service you're looking for doesn't exist or has been removed.
			</p>
			<Button href="/studio/services">
				<ArrowLeft class="mr-2 h-4 w-4" />
				Back to Services
			</Button>
		</div>
	{/if}
</div>
