<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	// Get data from parent layout
	const { data } = $props();
	const { studio, isApproved } = data;
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle>Studio Information</CardTitle>
			</CardHeader>
			<CardContent>
				{#if studio}
					<dl class="space-y-2">
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Name</dt>
							<dd class="text-sm">{studio.name}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Description</dt>
							<dd class="text-sm">{studio.description}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-muted-foreground">Status</dt>
							<dd class="text-sm capitalize">{studio.status}</dd>
						</div>
					</dl>
				{:else}
					<p class="text-sm text-muted-foreground">No studio information available.</p>
				{/if}
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Quick Actions</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2">
					{#if isApproved}
						<a
							href="/studio/dashboard/services"
							class="block text-sm text-blue-600 hover:underline"
						>
							Manage Services
						</a>
						<a href="/studio/dashboard/orders" class="block text-sm text-blue-600 hover:underline">
							View Orders
						</a>
					{:else}
						<p class="text-sm text-muted-foreground">
							Additional features will be available after your studio is approved.
						</p>
					{/if}
					<a href="/studio/dashboard/settings" class="block text-sm text-blue-600 hover:underline">
						Studio Settings
					</a>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Next Steps</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-2 text-sm">
					{#if isApproved}
						<p> Your studio has been approved</p>
						<p> Set up your services</p>
						<p> Configure your availability</p>
						<p>� Enable bookings</p>
					{:else}
						<p> Application submitted</p>
						<p>� Waiting for approval</p>
						<p class="text-muted-foreground">Once approved, you can:</p>
						<ul class="mt-1 list-inside list-disc text-muted-foreground">
							<li>Create service listings</li>
							<li>Set your availability</li>
							<li>Manage bookings</li>
						</ul>
					{/if}
				</div>
			</CardContent>
		</Card>
	</div>
</div>
