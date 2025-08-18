<script lang="ts">
	import { locales as availableLanguageTags } from '$lib/paraglide/runtime.js';
	import { setLocale } from '$lib/paraglide/runtime.js';

	function switchLanguage(lang: 'en' | 'cn' | 'ru') {
		// Set the new locale
		setLocale(lang);
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each availableLanguageTags as lang}
		<button
			onclick={() => switchLanguage(lang)}
			class="rounded-md border bg-background px-3 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			{lang}
		</button>
	{/each}
</div>
