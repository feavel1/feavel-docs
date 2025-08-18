<script lang="ts">
	import { modalProp } from './HamburgerModalProp';

	export let href: string;
</script>

<li class="child-hover:line-through">
	<a {href} data-sveltekit-preload-code="eager" onclick={modalProp.close}>
		<slot />
	</a>
</li>
