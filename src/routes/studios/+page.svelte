<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	// Get data from parent layout
	const { data } = $props();
	const { studios, session } = data;
</script>

<div class="mx-auto max-w-6xl px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-3xl font-bold">Our Studios</h1>
		<p class="text-lg text-muted-foreground">
			Discover talented studios ready to help with your projects
		</p>
	</div>

	{#if session?.user}
		<div class="mb-8 text-center">
			<a href="/studios/apply">
				<Button variant="default">Apply to Become a Studio</Button>
			</a>
		</div>
	{/if}

	{#if studios?.length > 0}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each studios as studio (studio.id)}
				<Card class="flex h-full flex-col">
					<CardHeader>
						<CardTitle>{studio.name}</CardTitle>
					</CardHeader>
					<CardContent class="flex-grow">
						<p class="text-muted-foreground">{studio.description}</p>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else}
		<div class="py-12 text-center">
			<p class="text-lg text-muted-foreground">
				No studios available at the moment. Check back later!
			</p>
		</div>
	{/if}
</div>
