<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { ShoppingCart, Package } from '@lucide/svelte';
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold">Orders</h1>
		<p class="text-muted-foreground">Your purchase history</p>
	</div>

	<Card>
		<CardContent class="py-12 text-center">
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
				<ShoppingCart class="h-6 w-6 text-muted-foreground" />
			</div>
			<h3 class="mt-4 text-lg font-medium">No orders yet</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				You haven't placed any orders. Order functionality is coming soon.
			</p>
			<div class="mt-6">
				<Button disabled>
					<Package class="mr-2 h-4 w-4" />
					Browse Products
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
