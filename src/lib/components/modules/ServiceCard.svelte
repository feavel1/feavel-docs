<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

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

	let { service }: { service: Service } = $props();

	function formatPrice(price: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(price);
	}
</script>

<a href="/services/{service.id}" class="block h-full">
	<Card class="flex h-full flex-col hover:shadow-lg transition-shadow">
		{#if service.cover_url}
			<img src={service.cover_url} alt={service.name} class="h-48 w-full rounded-t-lg object-cover" />
		{/if}
		<CardHeader>
			<div class="flex items-start justify-between">
				<CardTitle>{service.name}</CardTitle>
				<Badge variant="secondary">{service.service_type}</Badge>
			</div>
		</CardHeader>
		<CardContent class="flex-grow">
			<div class="mb-4 text-2xl font-bold">{formatPrice(service.price)}</div>
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
			<Button size="sm" onclick={(e) => {
				e.preventDefault();
				alert('Order service functionality will be implemented in a future update.');
			}}>Order Service</Button>
		</CardFooter>
	</Card>
</a>
