<script lang="ts">
	import { FileStorage } from '$lib/services/storage';
	import { Card, CardContent, CardFooter, CardHeader } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	let { userProfile, supabase, isOwnProfile = false, stats = null } = $props();

	let avatarUrl = $state<string | null>(null);

	// Asynchronously get user avatar URL
	(async () => {
		if (userProfile.avatar_file_id && supabase) {
			const storage = new FileStorage(supabase);
			const url = await storage.getUrl(userProfile.avatar_file_id);
			avatarUrl = url || null;
		}
	})();

	function handleImageError(event: Event) {
		const img = event.target as HTMLImageElement;
		const fallback = img.nextElementSibling as HTMLElement;
		if (img && fallback) {
			img.style.display = 'none';
			fallback.style.display = 'flex';
		}
	}
</script>

<Card class="flex h-full flex-col transition-all hover:shadow-lg">
	<CardHeader class="flex flex-col items-center pb-4 text-center">
		<!-- Avatar -->
		<div class="relative mb-4">
			<div
				class="ring-opacity-50 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shadow-md ring-4 ring-white dark:ring-gray-800"
			>
				{#if avatarUrl}
					<img
						class="h-20 w-20 rounded-full border-2 border-white object-cover shadow-sm dark:border-gray-800"
						src={avatarUrl}
						alt={userProfile.full_name || userProfile.username}
						onerror={handleImageError}
					/>
				{:else}
					<!-- Fallback avatar while loading -->
					<img
						class="h-20 w-20 rounded-full border-2 border-white object-cover shadow-sm dark:border-gray-800"
						src="https://api.dicebear.com/7.x/avataaars/svg?seed=default"
						alt={userProfile.full_name || userProfile.username}
					/>
				{/if}
				<span class="text-2xl font-bold text-gray-700 dark:text-gray-300" style="display: none;">
					{(userProfile.full_name ?? userProfile.username ?? '').charAt(0).toUpperCase()}
				</span>
			</div>
		</div>

		<!-- User Info -->
		<div class="w-full">
			<h3 class="truncate text-lg font-bold text-foreground">
				{userProfile.full_name || userProfile.username}
			</h3>
			<p class="truncate text-sm font-medium text-indigo-600 dark:text-indigo-400">
				@{userProfile.username}
			</p>
		</div>
	</CardHeader>

	<CardContent class="flex flex-grow flex-col justify-between pb-4">
		<div class="mb-4 min-h-[3rem] w-full">
			{#if userProfile.description}
				<p class="line-clamp-2 text-sm text-muted-foreground">
					{userProfile.description}
				</p>
			{:else}
				<p class="text-sm text-muted-foreground italic">No description available</p>
			{/if}
		</div>

		<!-- Stats -->
		<div class="mb-4 grid w-full grid-cols-3 gap-2">
			<div class="flex flex-col items-center rounded-lg bg-muted/50 p-2">
				<span class="text-lg font-bold text-foreground">{stats?.posts || 0}</span>
				<span class="text-xs text-muted-foreground">Posts</span>
			</div>
			<div class="flex flex-col items-center rounded-lg bg-muted/50 p-2">
				<span class="text-lg font-bold text-foreground">{stats?.comments || 0}</span>
				<span class="text-xs text-muted-foreground">Comments</span>
			</div>
			<div class="flex flex-col items-center rounded-lg bg-muted/50 p-2">
				<span class="text-lg font-bold text-foreground">{stats?.likes || 0}</span>
				<span class="text-xs text-muted-foreground">Likes</span>
			</div>
		</div>
	</CardContent>

	<CardFooter class="pt-0">
		<!-- Action Button -->
		<Button variant="default" href="/member/{userProfile.username}" class="w-full">
			{#if isOwnProfile}
				View Your Profile
			{:else}
				View Profile
			{/if}
		</Button>
	</CardFooter>
</Card>
