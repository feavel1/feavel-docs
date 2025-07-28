<script lang="ts">
	import { page } from '$app/stores';
	import { getAvatarDisplayUrl } from '$lib/utils/user';

	const { data: propsData } = $props();
	const { userProfiles, session } = propsData;
	const { supabase } = $page.data;

	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		const fallback = img.nextElementSibling as HTMLElement;
		if (img && fallback) {
			img.style.display = 'none';
			fallback.style.display = 'flex';
		}
	}
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
						<div class="overflow-hidden rounded-lg bg-white shadow">
							<div class="px-4 py-5 sm:p-6">
								<div class="flex items-center">
									<div class="flex-shrink-0">
										<div
											class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300"
										>
											<img
												class="h-12 w-12 rounded-full object-cover"
												src={getAvatarDisplayUrl(userProfile.avatar_url, userProfile.username)}
												alt={userProfile.full_name || userProfile.username}
												onerror={handleImageError}
											/>
											<span class="text-lg font-medium text-gray-700" style="display: none;">
												{(userProfile.full_name ?? userProfile.username ?? '')
													.charAt(0)
													.toUpperCase()}
											</span>
										</div>
									</div>
									<div class="ml-4 min-w-0 flex-1">
										<p class="truncate text-sm font-medium text-gray-900">
											{userProfile.full_name || userProfile.username}
										</p>
										<p class="truncate text-sm text-gray-500">
											@{userProfile.username}
										</p>
										{#if userProfile.description}
											<p class="mt-1 line-clamp-2 text-sm text-gray-600">
												{userProfile.description}
											</p>
										{/if}
									</div>
								</div>
								<div class="mt-4">
									<a
										href="/member/{userProfile.username}"
										class="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-3 py-2 text-sm leading-4 font-medium text-indigo-700 hover:bg-indigo-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
									>
										View Profile
									</a>
								</div>
							</div>
						</div>
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
