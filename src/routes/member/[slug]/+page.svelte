<script lang="ts">
	import ProfileCard from '$lib/components/modules/cards/ProfileCard.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import PostCard from '$lib/components/modules/cards/PostCard.svelte';
	import { Settings } from '@lucide/svelte';

	const { data: propsData } = $props();
	const { viewedUserProfile: userProfile, isOwnProfile, supabase, posts, stats } = propsData;
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold">
		{isOwnProfile ? 'Your Profile' : `${userProfile.username}'s Profile`}
	</h1>

	<!-- Profile Header with Stats -->
	<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
		<!-- Profile Card -->
		<div class="lg:col-span-1">
			<div class="relative">
				<ProfileCard {userProfile} {supabase} {isOwnProfile} {stats} />
				<!-- Verification badge placeholder -->
				{#if false}
					<!-- Replace with actual verification check when implemented -->
					<div class="absolute -top-2 -right-2">
						<Badge variant="default" class="rounded-full p-1">
							<div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
								<span class="text-xs font-bold text-white">✓</span>
							</div>
						</Badge>
					</div>
				{/if}
			</div>

			<!-- Settings Button for Own Profile -->
			{#if isOwnProfile}
				<div class="mt-4">
					<Button href="/member/dashboard" variant="outline" class="w-full">
						<Settings class="mr-2 h-4 w-4" />
						Profile Dashboard
					</Button>
				</div>
			{/if}
		</div>

		<!-- Content Tabs -->
		<div class="lg:col-span-3">
			<Tabs value="posts" class="w-full">
				<TabsList class="grid w-full grid-cols-3">
					<TabsTrigger value="posts">Posts</TabsTrigger>
					<TabsTrigger value="comments">Comments</TabsTrigger>
					<TabsTrigger value="liked">Liked</TabsTrigger>
				</TabsList>
				<TabsContent value="posts" class="mt-6">
					{#if posts.length > 0}
						<div class="grid gap-6 md:grid-cols-3">
							{#each posts as post (post.id)}
								<PostCard {post} {supabase} />
							{/each}
						</div>
					{:else}
						<div class="py-8 text-center text-muted-foreground">
							<p>No posts yet.</p>
						</div>
					{/if}
				</TabsContent>
				<TabsContent value="comments" class="mt-6">
					<div class="py-8 text-center text-muted-foreground">
						<p>Comments section coming soon.</p>
					</div>
				</TabsContent>
				<TabsContent value="liked" class="mt-6">
					<div class="py-8 text-center text-muted-foreground">
						<p>Liked posts section coming soon.</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	</div>
</div>
