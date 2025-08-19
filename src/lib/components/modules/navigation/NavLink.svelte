<script lang="ts">
	import { modalProp } from '$lib/components/modules/HamburgerModalProp';

	let { href, children } = $props();
</script>

<li class="transition-all duration-200 hover:underline">
	<a
		{href}
		data-sveltekit-preload-data="hover"
		class="text-foreground transition-colors hover:text-primary"
		onclick={modalProp.close}
	>
		{@render children?.()}
	</a>
</li>
