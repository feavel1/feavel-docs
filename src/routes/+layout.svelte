<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { invalidate } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
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

{#if session}
	<header class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<div class="flex items-center space-x-8">
					<a href="/" class="text-xl font-bold text-gray-900">Feavel Docs</a>
					<nav class="hidden space-x-6 md:flex">
						<a
							href="/members"
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
						>
							Members
						</a>
					</nav>
				</div>
				{#if userProfile}
					<div class="flex items-center space-x-4">
						<DropdownMenu>
							<DropdownMenuTrigger>
								<Button variant="ghost" class="relative h-8 w-8 rounded-full">
									<Avatar class="h-8 w-8">
										<AvatarImage
											class="object-cover"
											src={avatarDisplayUrl}
											alt={userProfile.full_name || userProfile.username}
										/>
										<AvatarFallback>{userProfile.username?.charAt(0).toUpperCase()}</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent class="w-56" align="end" forceMount>
								<DropdownMenuLabel class="font-normal">
									<div class="flex flex-col space-y-1">
										<p class="text-sm leading-none font-medium">
											{userProfile.full_name || userProfile.username}
										</p>
										<p class="text-xs leading-none text-muted-foreground">{session.user.email}</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<a href="/member/{userProfile.username}">Profile</a>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<a href="/member/{userProfile.username}/settings">Settings</a>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onSelect={handleLogout}>Log out</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				{/if}
			</div>
		</div>
	</header>
{/if}

{@render children()}

<Toaster />
