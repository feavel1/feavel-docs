<script lang="ts">
	import { locales as availableLanguageTags } from '$lib/paraglide/runtime.js';
	import { setLocale, getLocale } from '$lib/paraglide/runtime.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Globe } from '@lucide/svelte';

	// Get the current locale
	let currentLocale = $state(getLocale());

	function switchLanguage(lang: 'en' | 'cn' | 'ru') {
		// Set the new locale
		setLocale(lang);
		// Update the current locale state
		currentLocale = lang;
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="icon">
				<Globe class="size-4" />
				<span class="sr-only">Switch language</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-16">
		{#each availableLanguageTags as lang}
			<DropdownMenu.Item
				onclick={() => switchLanguage(lang)}
				class={lang === currentLocale ? 'bg-accent' : ''}
			>
				<span class="font-medium uppercase">{lang}</span>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
