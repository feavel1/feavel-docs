<script lang="ts">
	import ProfileCard from '$lib/components/modules/cards/ProfileCard.svelte';

	const { data: propsData } = $props();
	const { userProfile, stats, session, supabase } = propsData;
</script>

{#if !session?.user}
	<div class="py-8 text-center">
		<p>
			Please <a href="/auth/login" class="text-indigo-600 hover:underline">log in</a> to view your dashboard.
		</p>
	</div>
{:else}
	<!-- Profile Header with Stats -->
	<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Profile Card -->
		<div class="lg:col-span-1">
			<div class="relative">
				<ProfileCard {userProfile} {stats} {supabase} isOwnProfile={true} />
			</div>
		</div>
	</div>
{/if}
