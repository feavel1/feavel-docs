<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { getServiceTags } from '$lib/utils/serviceCategories';

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

	let { service }: { service: Service } = $props();

	// Derived values for better performance
	let tags = $derived(getServiceTags(service));

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price);
	}
</script>

<a href="/services/{service.id}" class="block h-full">
	<Card class="flex h-full flex-col transition-shadow hover:shadow-lg">
		{#if service.cover_url}
			<img
				src={service.cover_url}
				alt={service.name}
				class="h-48 w-full rounded-t-lg object-cover"
			/>
		{/if}
		<CardHeader>
			<div class="flex items-start justify-between">
				<CardTitle>{service.name}</CardTitle>
				<Badge variant="secondary">{service.service_type}</Badge>
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
			{#if service.highlights && service.highlights.length > 0}
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
			<span class="text-sm text-muted-foreground"> Added </span>
			<Button
				size="sm"
				onclick={(e) => {
					e.preventDefault();
					alert('Order service functionality will be implemented in a future update.');
				}}>Order Service</Button
			>
		</CardFooter>
	</Card>
</a>
