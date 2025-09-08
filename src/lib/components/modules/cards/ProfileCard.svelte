<script lang="ts">
	import { getAvatarUrl } from '$lib/utils/user';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { UserProfile } from '$lib/utils/user';

	const {
		userProfile,
		supabase,
		isOwnProfile = false,
		stats = null
	} = $props<{
		userProfile: UserProfile;
		supabase: SupabaseClient;
		isOwnProfile?: boolean;
		stats?: { posts: number; comments: number; likes: number } | null;
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

<div class="overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-200 hover:border-indigo-300 transform hover:-translate-y-1">
	<div class="p-6">
		<div class="flex flex-col items-center text-center">
			<!-- Avatar -->
			<div class="relative mb-4">
				<div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shadow-md ring-4 ring-white ring-opacity-50">
					<img
						class="h-20 w-20 rounded-full object-cover border-2 border-white shadow-sm"
						src={getAvatarUrl(userProfile.avatar_url, userProfile.username, supabase)}
						alt={userProfile.full_name || userProfile.username}
						onerror={handleImageError}
					/>
					<span class="text-2xl font-bold text-gray-700" style="display: none;">
						{(userProfile.full_name ?? userProfile.username ?? '').charAt(0).toUpperCase()}
					</span>
				</div>
			</div>

			<!-- User Info -->
			<div class="mb-4 w-full">
				<h3 class="text-lg font-bold text-gray-900 truncate">
					{userProfile.full_name || userProfile.username}
				</h3>
				<p class="text-sm text-indigo-600 font-medium truncate">@{userProfile.username}</p>
				
				{#if userProfile.description}
					<p class="mt-2 text-sm text-gray-600 line-clamp-2">
						{userProfile.description}
					</p>
				{/if}
			</div>

			<!-- Stats (if provided) -->
			{#if stats}
				<div class="grid grid-cols-3 gap-4 w-full mb-4">
					<div class="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
						<span class="text-lg font-bold text-gray-900">{stats.posts}</span>
						<span class="text-xs text-gray-500">Posts</span>
					</div>
					<div class="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
						<span class="text-lg font-bold text-gray-900">{stats.comments}</span>
						<span class="text-xs text-gray-500">Comments</span>
					</div>
					<div class="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
						<span class="text-lg font-bold text-gray-900">{stats.likes}</span>
						<span class="text-xs text-gray-500">Likes</span>
					</div>
				</div>
			{/if}

			<!-- Action Button -->
			<a
				href="/member/{userProfile.username}"
				class="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full transition-all duration-200 shadow-md hover:shadow-lg"
			>
				{#if isOwnProfile}
					View Your Profile
				{:else}
					View Profile
				{/if}
			</a>
		</div>
	</div>
</div>