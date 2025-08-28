<script lang="ts">
	import { locales as availableLanguageTags } from '$lib/paraglide/runtime.js';
	import { setLocale, getLocale } from '$lib/paraglide/runtime.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
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

<DropdownMenu>
	<DropdownMenuTrigger>
		<Button variant="outline" size="icon" class="rounded-full">
			<Globe class="size-4" />
			<span class="sr-only">Switch language</span>
		</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end">
		{#each availableLanguageTags as lang}
			<DropdownMenuItem
				onclick={() => switchLanguage(lang)}
				class={lang === currentLocale ? 'bg-accent' : ''}
			>
				<span class="font-medium uppercase">{lang}</span>
			</DropdownMenuItem>
		{/each}
	</DropdownMenuContent>
</DropdownMenu>
