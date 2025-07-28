<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { getAvatarUrl } from '$lib/utils/user';
	import type { UserProfile } from '$lib/utils/user';
	import type { SupabaseClient } from '@supabase/supabase-js';

	const {
		userProfile,
		supabase,
		isOwnProfile = false
	} = $props<{
		userProfile: UserProfile;
		supabase: SupabaseClient;
		isOwnProfile?: boolean;
	}>();
</script>

<div class="space-y-6">
	<!-- Avatar Display -->
	<div class="flex justify-center">
		<div class="relative">
			<Avatar class="h-24 w-24">
				<AvatarImage
					class="object-cover"
					src={getAvatarUrl(userProfile.avatar_url, userProfile.username, supabase)}
					alt={userProfile.full_name || userProfile.username}
				/>
				<AvatarFallback>{userProfile.username.charAt(0).toUpperCase()}</AvatarFallback>
			</Avatar>
		</div>
	</div>

	<!-- Profile Information -->
	<div class="space-y-4">
		<div>
			<span class="font-semibold">Username:</span>
			{userProfile.username}
		</div>
		{#if userProfile.full_name}
			<div>
				<span class="font-semibold">Full Name:</span>
				{userProfile.full_name}
			</div>
		{/if}
		{#if userProfile.description}
			<div>
				<span class="font-semibold">Bio:</span>
				{userProfile.description}
			</div>
		{/if}
		{#if userProfile.birthday}
			<div>
				<span class="font-semibold">Birthday:</span>
				{new Date(userProfile.birthday).toLocaleDateString()}
			</div>
		{/if}
		{#if isOwnProfile}
			<div class="pt-4">
				<a
					href="/member/{userProfile.username}/settings"
					class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
				>
					Edit Profile
				</a>
			</div>
		{/if}
	</div>
</div>
