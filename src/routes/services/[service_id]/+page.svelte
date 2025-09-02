<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { ArrowLeft, Calendar, User, Phone } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let { service, session } = data;

	function handleOrderService() {
		if (!session) {
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
		<div class="mb-8">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<h1 class="mb-4 text-4xl font-bold">{service.name}</h1>
					<div class="mb-6 flex items-center gap-4 text-muted-foreground">
						<div class="flex items-center gap-2">
							<User class="h-4 w-4" />
							<span>{service.studios[0]?.name}</span>
						</div>
						<div class="flex items-center gap-2">
							<Calendar class="h-4 w-4" />
							<span>{new Date(service.created_at).toLocaleDateString()}</span>
						</div>
					</div>
				</div>
				<Button onclick={handleOrderService}>
					Order for {formatPrice(service.price)}
				</Button>
			</div>

			{#if service.cover_url}
				<div class="mb-6 overflow-hidden rounded-lg">
					<img
						src={service.cover_url}
						alt={service.name}
						class="h-64 w-full object-cover md:h-96"
					/>
				</div>
			{/if}

			<div class="mb-4">
				<span class="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
					{service.service_type}
				</span>
			</div>
		</div>

		<!-- Service Content -->
		<Card class="mb-8">
			<CardHeader>
				<h2 class="text-2xl font-semibold">Description</h2>
			</CardHeader>
			<CardContent>
				{#if service.description}
					<div class="prose prose-lg max-w-none">
						<!-- For now, we'll display the JSON description as a string -->
						<!-- In a real implementation, you might want to render this as rich content -->
						<p>{JSON.stringify(service.description)}</p>
					</div>
				{:else}
					<p class="text-muted-foreground">No description available.</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Highlights -->
		{#if service.highlights && service.highlights.length > 0}
			<Card class="mb-8">
				<CardHeader>
					<h2 class="text-2xl font-semibold">Highlights</h2>
				</CardHeader>
				<CardContent>
					<ul class="space-y-2">
						{#each service.highlights as highlight}
							<li class="flex items-start">
								<span class="mr-2">•</span>
								<span>{highlight}</span>
							</li>
						{/each}
					</ul>
				</CardContent>
			</Card>
		{/if}

		<!-- Studio Info -->
		<Card>
			<CardHeader>
				<h3 class="text-lg font-semibold">About the Studio</h3>
			</CardHeader>
			<CardContent>
				<div class="flex items-center gap-4">
					<div class="flex-shrink-0">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
							<span class="text-lg font-medium text-gray-700">
								{service.studios[0]?.name.charAt(0).toUpperCase()}
							</span>
						</div>
					</div>
					<div class="flex-1">
						<p class="font-medium">{service.studios[0]?.name}</p>
						<p class="mb-2 text-sm text-muted-foreground">
							{service.studios[0]?.description}
						</p>
						<div class="flex items-center gap-2 text-sm">
							<Phone class="h-4 w-4" />
							<span>{service.studios[0]?.contact_phone}</span>
						</div>
					</div>
				</div>
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
