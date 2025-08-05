<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children, data } = $props();
	let { supabase, session } = data;

	$effect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				session = newSession;
			}
		});

		return () => {
			authListener.subscription.unsubscribe();
		};
	});
</script>

<!-- Hidden locale links for SEO -->
<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>

{@render children()}

<Toaster />
