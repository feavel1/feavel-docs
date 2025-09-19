<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import PostCard from '$lib/components/modules/cards/PostCard.svelte';
	import { Settings, Calendar } from '@lucide/svelte';
	import { Card, CardContent } from '$lib/components/ui/card';

	const { data: propsData } = $props();
	const { viewedUserProfile: userProfile, isOwnProfile, supabase, posts, stats } = propsData;
</script>

<div class="container mx-auto px-4 py-6">
	<div class="mx-auto max-w-6xl">
		<!-- Profile Header -->
		<div
			class="relative mb-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-lg"
		>
			<div class="flex flex-col items-center text-center sm:flex-row sm:items-end sm:text-left">
				<div class="relative mb-4 sm:mr-6 sm:mb-0">
					<div
						class="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg sm:h-32 sm:w-32"
					>
						<img
							src={userProfile.avatar_url
								? `${supabase.storage.from('avatars').getPublicUrl(userProfile.avatar_url).data.publicUrl}`
								: `https://api.dicebear.com/6.x/initials/svg?seed=${userProfile.username}`}
							alt={userProfile.username}
							class="h-full w-full object-cover"
							onerror={(e) => {
								const target = e.target as HTMLImageElement;
								target.src = `https://api.dicebear.com/6.x/initials/svg?seed=${userProfile.username}`;
							}}
						/>
					</div>
					{#if false}
						<!-- Verification badge placeholder -->
						<Badge
							class="absolute -right-1 -bottom-1 rounded-full border-2 border-white bg-blue-500 p-1"
						>
							<span class="text-xs font-bold text-white">✓</span>
						</Badge>
					{/if}
				</div>

				<div class="flex-1">
					<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 class="text-2xl font-bold md:text-3xl">
								{userProfile.full_name || userProfile.username}
							</h1>
							<p class="mt-1 text-indigo-100">@{userProfile.username}</p>
						</div>
						<div class="mt-4 flex flex-wrap justify-center gap-2 sm:mt-0">
							{#if isOwnProfile}
								<Button
									size="sm"
									variant="secondary"
									onclick={() => (window.location.href = '/member/dashboard')}
								>
									<Settings class="mr-2 h-4 w-4" />
									Dashboard
								</Button>
							{/if}
						</div>
					</div>

					{#if userProfile.description}
						<p class="mt-3 max-w-2xl text-indigo-100">
							{userProfile.description}
						</p>
					{/if}

					<div class="mt-4 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
						<div class="flex items-center text-indigo-100">
							<Calendar class="mr-2 h-4 w-4" />
							<span>User Profile</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Stats Section -->
		<div class="mb-8">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card>
					<CardContent class="p-4 text-center">
						<div class="text-3xl font-bold text-indigo-600">{stats.posts}</div>
						<div class="text-sm text-muted-foreground">Posts</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="p-4 text-center">
						<div class="text-3xl font-bold text-indigo-600">{stats.comments}</div>
						<div class="text-sm text-muted-foreground">Comments</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="p-4 text-center">
						<div class="text-3xl font-bold text-indigo-600">{stats.likes}</div>
						<div class="text-sm text-muted-foreground">Likes Received</div>
					</CardContent>
				</Card>
			</div>
		</div>

		<!-- Content Tabs -->
		<div class="mb-8">
			<Tabs value="posts" class="w-full">
				<TabsList class="grid w-full grid-cols-3">
					<TabsTrigger value="posts">Posts</TabsTrigger>
					<TabsTrigger value="comments">Comments</TabsTrigger>
					<TabsTrigger value="liked">Liked</TabsTrigger>
				</TabsList>
				<TabsContent value="posts" class="mt-6">
					{#if posts.length > 0}
						<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{#each posts as post (post.id)}
								<PostCard {post} {supabase} />
							{/each}
						</div>
					{:else}
						<Card>
							<CardContent class="py-12 text-center">
								<div class="text-muted-foreground">
									<p class="text-lg">No posts yet.</p>
									{#if isOwnProfile}
										<p class="mt-2">Start sharing your thoughts with the community!</p>
									{/if}
								</div>
							</CardContent>
						</Card>
					{/if}
				</TabsContent>
				<TabsContent value="comments" class="mt-6">
					<Card>
						<CardContent class="py-12 text-center">
							<div class="text-muted-foreground">
								<p>Comments section coming soon.</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value="liked" class="mt-6">
					<Card>
						<CardContent class="py-12 text-center">
							<div class="text-muted-foreground">
								<p>Liked posts section coming soon.</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	</div>
</div>
