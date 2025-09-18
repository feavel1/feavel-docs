<script lang="ts">
	import ProfileCard from '$lib/components/modules/cards/ProfileCard.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Search } from '@lucide/svelte';

	let searchTerm = $state('');

	const { data: propsData } = $props();
	const { userProfilesWithStats, session, supabase } = propsData;

	let filteredUsers = $derived.by(() => {
		if (!searchTerm) return userProfilesWithStats;
		return userProfilesWithStats.filter(
			(user) =>
				user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
		);
	});
</script>

<div class="h-full pt-20 pb-8">
	<div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="mx-auto w-full max-w-2xl text-center">
			<h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Members</h1>
			<p class="mt-2 text-lg text-muted-foreground">Discover our community members</p>
		</div>

		<!-- Search Bar -->
		<div class="mx-auto mt-8 max-w-md">
			<div class="relative">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input class="pl-10" placeholder="Search members..." bind:value={searchTerm} />
			</div>
		</div>

		<div class="mt-8">
			{#if filteredUsers.length > 0}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{#each filteredUsers as userProfile}
						<ProfileCard {userProfile} {supabase} stats={userProfile.stats} />
					{/each}
				</div>
			{:else}
				<Card class="mx-auto max-w-md">
					<CardContent class="py-8 text-center">
						<div class="text-muted-foreground">
							{#if searchTerm}
								<p class="text-lg">No members found matching "{searchTerm}".</p>
								<Button variant="outline" class="mt-4" onclick={() => (searchTerm = '')}>
									Clear Search
								</Button>
							{:else}
								<p class="text-lg">No members found.</p>
								<p class="mt-2">Be the first to join our community!</p>
								{#if !session}
									<div class="mt-4">
										<Button onclick={() => (window.location.href = '/auth/signup')}>Sign Up</Button>
									</div>
								{/if}
							{/if}
						</div>
					</CardContent>
				</Card>
			{/if}
		</div>
	</div>
</div>
