<script lang="ts">
	import { getAvatarUrl } from '$lib/utils/user';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { UserProfile } from '$lib/utils/user';

	const { userProfile, supabase, isOwnProfile = false } = $props<{
		userProfile: UserProfile;
		supabase: SupabaseClient;
		isOwnProfile?: boolean;
	}>();

	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		const fallback = img.nextElementSibling as HTMLElement;
		if (img && fallback) {
			img.style.display = 'none';
			fallback.style.display = 'flex';
		}
	}
</script>

<div class="overflow-hidden rounded-lg bg-white shadow">
	<div class="px-4 py-5 sm:p-6">
		<div class="flex items-center">
			<div class="flex-shrink-0">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
					<img
						class="h-12 w-12 rounded-full object-cover"
						src={getAvatarUrl(userProfile.avatar_url, userProfile.username, supabase)}
						alt={userProfile.full_name || userProfile.username}
						onerror={handleImageError}
					/>
					<span class="text-lg font-medium text-gray-700" style="display: none;">
						{(userProfile.full_name ?? userProfile.username ?? '').charAt(0).toUpperCase()}
					</span>
				</div>
			</div>
			<div class="ml-4 min-w-0 flex-1">
				<p class="truncate text-sm font-medium text-gray-900">
					{userProfile.full_name || userProfile.username}
				</p>
				<p class="truncate text-sm text-gray-500">@{userProfile.username}</p>
				{#if userProfile.description}
					<p class="mt-1 line-clamp-2 text-sm text-gray-600">{userProfile.description}</p>
				{/if}
			</div>
		</div>
		<div class="mt-4">
			<a
				href="/member/{userProfile.username}"
				class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-3 py-2 text-sm leading-4 font-medium text-indigo-700 hover:bg-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
			>
				{#if isOwnProfile}
					Your Profile
				{:else}
					View Profile
				{/if}
			</a>
		</div>
	</div>
</div>
