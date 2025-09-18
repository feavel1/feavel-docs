<script lang="ts">
	import { modalProp } from './HamburgerModalProp';

	let { href, children } = $props();
</script>

<li class="">
	<a
		{href}
		data-sveltekit-preload-data="hover"
		class="text-white transition-all duration-100 hover:text-gray-500 hover:underline"
		onclick={modalProp.close}
	>
		{@render children?.()}
	</a>
</li>
