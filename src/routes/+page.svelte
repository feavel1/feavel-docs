<script lang="ts">
	import CloudBackground from '$lib/components/modules/CloudBackground.svelte';
	import { modalProp } from '$lib/components/modules/HamburgerModalProp';
</script>

<svelte:head>
	<title>Feavel Docs - Documentation Platform</title>
	<meta name="description" content="A modern documentation platform with blog features" />
</svelte:head>

<button
	onclick={modalProp.open}
	class="fixed top-0 h-screen w-full self-center object-cover object-center"
>
	<CloudBackground />
</button>
