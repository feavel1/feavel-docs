<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	// Get data from parent layout
	const { data } = $props();
	const { studio, isApproved } = data;
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold">Studio Settings</h1>

	<Card>
		<CardHeader>
			<CardTitle>Studio Information</CardTitle>
		</CardHeader>
		<CardContent>
			{#if studio}
				<dl class="space-y-4">
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Name</dt>
						<dd class="text-sm">{studio.name}</dd>
					</div>
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Description</dt>
						<dd class="text-sm">{studio.description}</dd>
					</div>
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Contact Phone</dt>
						<dd class="text-sm">{studio.contact_phone?.toString() || 'Not provided'}</dd>
					</div>
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Salary Expectation</dt>
						<dd class="text-sm">{studio.salary_expectation || 'Not provided'}</dd>
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

	{#if isApproved}
		<Card>
			<CardHeader>
				<CardTitle>Studio Management</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					<Button variant="outline" disabled>Update Studio Information</Button>
					<Button variant="outline" disabled>Manage Team Members</Button>
					<Button variant="outline" disabled>Configure Notifications</Button>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
