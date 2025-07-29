<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { invalidate } from '$app/navigation';
	import { Toaster } from '$lib/components/ui/sonner';
	import { getAvatarUrl } from '$lib/utils/user';

	let { children, data } = $props();
	let { supabase, session, userProfile } = data;

	const avatarDisplayUrl = $derived(
		getAvatarUrl(userProfile?.avatar_url, userProfile?.username, supabase)
	);

	$effect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => authListener.subscription.unsubscribe();
	});

	async function handleLogout() {
		await supabase.auth.signOut();
	}
</script>

<!-- Hidden locale links for SEO -->
<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>

{@render children()}

<Toaster />
