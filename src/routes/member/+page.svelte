<script lang="ts">
	import ProfileCard from '$lib/components/modules/cards/ProfileCard.svelte';

	const { data: propsData } = $props();
	const { userProfiles, session, supabase } = propsData;
</script>

<div class="h-full pt-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-2xl">
			<h1 class="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
				Members
			</h1>
			<p class="mt-4 text-center text-lg text-gray-600">Discover our community members</p>
		</div>

		<div class="mt-12">
			{#if userProfiles.length > 0}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each userProfiles as userProfile}
						<ProfileCard {userProfile} {supabase} />
					{/each}
				</div>
			{:else}
				<div class="py-12 text-center">
					<div class="text-gray-500">
						<p class="text-lg">No members found.</p>
						<p class="mt-2">Be the first to join our community!</p>
						{#if !session}
							<div class="mt-4">
								<a
									href="/auth/signup"
									class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
								>
									Sign Up
								</a>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
