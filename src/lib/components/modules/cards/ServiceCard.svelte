<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { getServiceTags } from '$lib/utils/serviceCategories';
	import { FileStorage } from '$lib/services/storage';
	import type { Service } from '$lib/utils/services';

	let { service, studioId, supabase } = $props();

	// Add state for cover URL - this assumes supabase is passed in
	let coverUrl = $state<string | null>(null);

	// Helper function to get studio name regardless of data structure
	function getStudioName(studios: Service['studios']): string | undefined {
		if (!studios) return undefined;
		// Handle both array and object formats
		if (Array.isArray(studios)) {
			if (studios.length === 0) return undefined;
			const firstStudio = studios[0];
			if (!firstStudio || typeof firstStudio !== 'object') return undefined;
			return firstStudio.name || undefined;
		}
		// Handle object format
		if (typeof studios === 'object' && studios && 'name' in studios) {
			return (studios as { name: string }).name || undefined;
		}
		return undefined;
	}

	// Derived values for better performance
	let tags = $derived(getServiceTags(service));
	let formattedDate = $derived(new Date(service.created_at || '').toLocaleDateString());

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price);
	}

	// Function to get status badge variant based on service status
	function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'approved':
				return 'default';
			case 'applied':
				return 'secondary';
			case 'disabled':
				return 'outline';
			case 'blocked':
				return 'destructive';
			default:
				return 'secondary';
		}
	}

	// Asynchronously get service cover URL
	$effect(() => {
		const fetchCoverUrl = async () => {
			if (service.cover_file_id && supabase) {
				const storage = new FileStorage(supabase);
				const url = await storage.getUrl(service.cover_file_id);
				coverUrl = url || null;
			}
		};
		fetchCoverUrl();
	});
</script>

<a href="/services/{service.id}" class="block h-full">
	<Card class="flex h-full flex-col transition-shadow hover:shadow-lg">
		{#if service.cover_file_id}
			{#if coverUrl}
				<img src={coverUrl} alt={service.name} class="h-48 w-full rounded-t-lg object-cover" />
			{:else}
				<div class="h-48 w-full animate-pulse rounded-t-lg bg-muted" />
			{/if}
		{/if}
		<CardHeader>
			<div class="flex items-start justify-between">
				<CardTitle class="line-clamp-1 text-lg leading-tight">{service.name}</CardTitle>
				{#if service.status}
					<Badge variant={getStatusVariant(service.status)}>{service.status}</Badge>
				{/if}
			</div>

			<div class="mt-3 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
						<span class="text-xs font-medium text-gray-700">
							{getStudioName(service.studios)?.charAt(0)?.toUpperCase() || 'S'}
						</span>
					</div>
					<div class="text-sm">
						<div class="font-medium">
							{getStudioName(service.studios) || 'Unknown Studio'}
						</div>
						<div class="text-xs text-muted-foreground">{formattedDate}</div>
					</div>
				</div>
				<Badge variant="secondary">{service.type}</Badge>
			</div>
		</CardHeader>
		<CardContent class="flex-grow">
			<div class="mb-4 text-2xl font-bold">{formatPrice(service.price)}</div>
			{#if tags.length > 0}
				<div class="mb-3 flex flex-wrap gap-1">
					{#each tags as tag, i}
						{#if i < 3}
							<Button
								variant="outline"
								size="sm"
								href={`/services?categories=${encodeURIComponent(tag)}`}
								class="h-6 px-2 text-xs"
							>
								{tag}
							</Button>
						{:else if i === 3}
							<div class="flex h-6 items-center rounded border px-2 text-xs text-muted-foreground">
								+{tags.length - 3}
							</div>
						{/if}
					{/each}
				</div>
			{/if}
			{#if service.highlights && Array.isArray(service.highlights) && service.highlights.length > 0}
				<ul class="space-y-2">
					{#each service.highlights as highlight}
						<li class="flex items-start">
							<span class="mr-2">•</span>
							<span>{highlight}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</CardContent>
		<CardFooter class="flex justify-between">
			<span class="text-sm text-muted-foreground">Added {formattedDate}</span>
			<div class="flex gap-2">
				{#if studioId && service.created_by === studioId}
					<Button href="/studios/dashboard/services/{service.id}" variant="outline" size="sm">
						Edit
					</Button>
				{/if}
				<Button
					size="sm"
					onclick={(e) => {
						e.preventDefault();
						alert('Order service functionality will be implemented in a future update.');
					}}>Order Service</Button
				>
			</div>
		</CardFooter>
	</Card>
</a>
