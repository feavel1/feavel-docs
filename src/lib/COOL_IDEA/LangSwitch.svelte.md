<script>
	import { availableLanguageTags, languageTag } from '$lib/paraglide/runtime.js';
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	// import { Popover } from '@skeletonlabs/skeleton-svelte';

	let openState = $state(false);

	function popoverClose() {
		openState = false;
	}
</script>

<div class="flex gap-2">
	{#each availableLanguageTags as lang}
		<!-- the hreflang attribute decides which language the link points to -->
		<a
			href={i18n.route($page.url.pathname)}
			hreflang={lang}
			aria-current={lang === languageTag() ? 'page' : undefined}
		>
			{lang}
		</a>
	{/each}
</div>
