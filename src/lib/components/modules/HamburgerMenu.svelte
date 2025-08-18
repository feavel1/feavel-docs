<script lang="ts">
	import { fade } from 'svelte/transition';
	import Navigation from './Navigation.svelte';
	import { modalProp } from './HamburgerModalProp';
	import { Menu } from '@lucide/svelte';
</script>

<div>
	<Menu
		role="none"
		onclick={modalProp.open}
		class="h-8 w-8 cursor-pointer text-foreground"
		stroke="currentColor"
		stroke-width="2"
	/>

	{#if $modalProp}
		<div
			class="fixed top-0 right-0 bottom-0 left-0 bg-neutral-800/80"
			in:fade={{ delay: 0, duration: 1000 }}
			out:fade={{ delay: 0, duration: 200 }}
		></div>

		<div
			role="none"
			onclick={modalProp.close}
			in:fade={{ delay: 0, duration: 1000 }}
			out:fade={{ delay: 0, duration: 200 }}
			class="fixed top-0 right-0 bottom-0 left-0 h-screen w-full self-center object-cover object-center"
		>
			<Navigation />
		</div>
	{/if}
</div>
