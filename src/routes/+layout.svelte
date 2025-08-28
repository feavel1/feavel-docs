<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import HamburgerMenu from '$lib/components/modules/HamburgerMenu.svelte';
	import Feavel from '$lib/components/modules/Feavel.svelte';
	import { updateMostUsedTags } from '$lib/stores/mostUsedTags';
	import LangSwitch from '$lib/components/modules/LangSwitch.svelte';
	import CloudBackground from '$lib/components/modules/CloudBackground.svelte';

	let { children, data } = $props();

	// Initialize the most used tags store with data from the server
	updateMostUsedTags(data.mostUsedTags || []);
</script>

<svelte:head>
	<title>Feavel Docs</title>
</svelte:head>

<ModeWatcher />

<div class="min-h-screen">
	<header class="fixed top-0 z-50 w-full px-4 pt-2 pb-1 lg:px-14 lg:pt-10">
		<div class="flex items-center justify-between">
			<Feavel />
			<div class="flex items-center gap-2">
				<LangSwitch />
				<HamburgerMenu />
			</div>
		</div>
	</header>

	<main class="mx-auto min-h-dvh pt-20">
		{@render children()}
		<CloudBackground />
	</main>
</div>

<Toaster />
