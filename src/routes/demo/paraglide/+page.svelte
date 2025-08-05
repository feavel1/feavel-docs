<script lang="ts">
	import { setLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages.js';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>
<div>
	<Button onclick={() => setLocale('en')}>en</Button>
	<Button onclick={() => setLocale('cn')}>cn</Button>
	<Button onclick={() => setLocale('ru')}>ru</Button>
</div>
<p>
	If you use VSCode, install the <a
		href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension"
		target="_blank">Sherlock i18n extension</a
	> for a better i18n experience.
</p>
