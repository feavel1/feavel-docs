<script lang="ts">
	import Services from '$lib/components/modules/content/Services.svelte';

	let { data } = $props();
	let { categories, supabase } = data;
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

	<Services {supabase} initialCategories={categories} />
</div>
