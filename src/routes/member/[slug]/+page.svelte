<script lang="ts">
	import ProfileDisplay from '$lib/components/modules/ProfileDisplay.svelte';

	const { data: propsData } = $props();
	const { userProfile, isOwnProfile, session, supabase } = propsData;
</script>

<div class="h-full pt-24">
	<div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-md">
			<div class="mb-4">
				<a href="/members" class="text-sm text-indigo-600 hover:text-indigo-500">
					← Back to Members
				</a>
			</div>
			<h2 class="mt-6 text-center text-2xl leading-9 font-bold tracking-tight">
				{isOwnProfile ? 'Your Profile' : `${userProfile.username}'s Profile`}
			</h2>
		</div>

		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
			<div class="px-6 py-12 shadow sm:rounded-lg sm:px-12">
				{#if userProfile}
					<ProfileDisplay {userProfile} {supabase} {isOwnProfile} />
				{:else}
					<div class="text-center text-gray-500">
						Profile not found.<br />
						<a href="/" class="font-semibold text-indigo-600 hover:text-indigo-500"> Go Home </a>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
