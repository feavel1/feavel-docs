<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { AvatarUpload } from '$lib/components/modules';

	const { data: propsData } = $props();
	const { userProfile, session, supabase } = propsData;
</script>

<div class="h-full pt-24">
	<div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-md">
			<div class="mb-4">
				<a
					href="/member/{userProfile.username}"
					class="text-sm text-indigo-600 hover:text-indigo-500"
				>
					← Back to Profile
				</a>
			</div>
			<h2 class="mt-6 text-center text-2xl leading-9 font-bold tracking-tight">Edit Profile</h2>
		</div>

		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
			<div class="px-6 py-12 shadow sm:rounded-lg sm:px-12">
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
			</div>
		</div>
	</div>
</div>
