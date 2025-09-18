<script lang="ts">
	import { invalidate } from '$app/navigation';
	import AvatarUpload from '$lib/components/modules/user/AvatarUpload.svelte';

	const { data: propsData } = $props();
	const { userProfile, session, supabase } = propsData;
</script>

<div class="space-y-6">
	<div>
		<h3 class="mb-4 text-lg font-medium text-gray-900">Profile Picture</h3>
		<AvatarUpload
			{supabase}
			userId={session.user.id}
			username={userProfile.username}
			currentAvatarUrl={userProfile.avatar_url}
			on:avatarUpdated={() => invalidate('app:user')}
		/>
	</div>

	<hr class="border-gray-200" />

	<div class="space-y-4">
		<h3 class="text-lg font-medium text-gray-900">Profile Information</h3>
		<div>
			<span class="font-semibold">Username:</span>
			{userProfile.username}
		</div>
		<div>
			<span class="font-semibold">Email:</span>
			{session.user.email}
		</div>
		<div class="pt-4">
			<p class="text-gray-600">Profile editing functionality coming soon...</p>
		</div>
	</div>
</div>
