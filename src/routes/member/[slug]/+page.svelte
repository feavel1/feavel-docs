<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { getAvatarUrl } from '$lib/utils/user';

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
							{#if session?.user?.email}
								<div>
									<span class="font-semibold">Email:</span>
									{session.user.email}
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
