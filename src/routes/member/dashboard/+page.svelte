<script lang="ts">
	import ProfileCard from '$lib/components/modules/cards/ProfileCard.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	// Mock data for the dashboard
	const mockPosts = [
		{
			id: 1,
			title: 'Getting Started with SvelteKit 5',
			author: { username: 'svelte_dev', avatar_url: null },
			createdAt: '2023-10-15T10:30:00Z',
			views: 1242,
			likes: 42,
			comments: 7
		},
		{
			id: 2,
			title: 'Building Real-time Applications with Supabase',
			author: { username: 'supabase_fan', avatar_url: null },
			createdAt: '2023-10-12T14:22:00Z',
			views: 892,
			likes: 38,
			comments: 12
		},
		{
			id: 3,
			title: 'Advanced TypeScript Patterns for Modern Apps',
			author: { username: 'ts_expert', avatar_url: null },
			createdAt: '2023-10-10T09:15:00Z',
			views: 2103,
			likes: 89,
			comments: 23
		}
	];

	const mockActivities = [
		{
			id: 1,
			user: 'alex_dev',
			action: 'liked your post',
			target: 'Understanding Runes in Svelte 5',
			time: '2 hours ago'
		},
		{
			id: 2,
			user: 'sara_codes',
			action: 'commented on',
			target: 'Your Supabase Setup Guide',
			time: '5 hours ago'
		},
		{ id: 3, user: 'mike_tech', action: 'started following you', time: '1 day ago' },
		{
			id: 4,
			user: 'jane_design',
			action: 'liked your post',
			target: 'UI Design Best Practices',
			time: '1 day ago'
		}
	];

	const { data: propsData } = $props();
	const { userProfile, stats, session, supabase } = propsData;
</script>

{#if !session?.user}
	<div class="py-8 text-center">
		<p>
			Please <a href="/auth/login" class="text-indigo-600 hover:underline">log in</a> to view your dashboard.
		</p>
	</div>
{:else}
	<!-- Welcome Section -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold">
			Welcome back, {userProfile.full_name || userProfile.username}!
		</h1>
		<p class="text-muted-foreground">Here's what's happening with your content today.</p>
	</div>

	<!-- Stats Overview -->
	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardContent class="">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-muted-foreground">Total Posts</p>
						<h3 class="text-2xl font-bold">{stats?.posts || 0}</h3>
					</div>
					<div class="h-12 w-12 rounded-full bg-blue-100 p-3">
						<div class="h-6 w-6 text-blue-600">📝</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardContent class="">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-muted-foreground">Total Likes</p>
						<h3 class="text-2xl font-bold">{stats?.likes || 0}</h3>
					</div>
					<div class="h-12 w-12 rounded-full bg-green-100 p-3">
						<div class="h-6 w-6 text-green-600">❤️</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardContent class="">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-muted-foreground">Comments</p>
						<h3 class="text-2xl font-bold">{stats?.comments || 0}</h3>
					</div>
					<div class="h-12 w-12 rounded-full bg-purple-100 p-3">
						<div class="h-6 w-6 text-purple-600">💬</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardContent class="">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-muted-foreground">Followers</p>
						<h3 class="text-2xl font-bold">124</h3>
					</div>
					<div class="h-12 w-12 rounded-full bg-orange-100 p-3">
						<div class="h-6 w-6 text-orange-600">👥</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Profile Card -->
		<div class="lg:col-span-1">
			<div class="relative">
				<ProfileCard {userProfile} {stats} {supabase} isOwnProfile={true} />
			</div>
		</div>

		<!-- Activity Feed -->
		<div class="lg:col-span-2">
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						{#each mockActivities as activity (activity.id)}
							<div class="flex items-start space-x-3">
								<div class="mt-1 h-8 w-8 rounded-full bg-gray-200">
									<div
										class="h-full w-full rounded-full bg-gradient-to-br from-indigo-100 to-purple-100"
									></div>
								</div>
								<div class="flex-1">
									<p class="text-sm">
										<span class="font-medium">{activity.user}</span>
										{activity.action}
										{#if activity.target}
											<span class="font-medium">{activity.target}</span>{/if}
									</p>
									<p class="text-xs text-muted-foreground">{activity.time}</p>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>

			<!-- Trending Posts Section -->
			<Card class="mt-6">
				<CardHeader>
					<CardTitle>Trending in Your Network</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						{#each mockPosts as post (post.id)}
							<div class="flex items-start space-x-3 border-b pb-4 last:border-0 last:pb-0">
								<div class="mt-1 h-8 w-8 rounded-full bg-gray-200">
									<div
										class="h-full w-full rounded-full bg-gradient-to-br from-indigo-100 to-purple-100"
									></div>
								</div>
								<div class="flex-1">
									<h4 class="font-medium">{post.title}</h4>
									<p class="text-sm text-muted-foreground">
										by @{post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
									</p>
									<div class="mt-1 flex space-x-4 text-xs text-muted-foreground">
										<span>{post.views} views</span>
										<span>{post.likes} likes</span>
										<span>{post.comments} comments</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		</div>
	</div>

	<!-- Future Features Preview -->
	<div class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Coming Soon</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<Card>
				<CardContent class="">
					<h3 class="font-medium">Studio Bookings</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Reserve time with studios for your projects
					</p>
					<Button variant="outline" class="mt-3 w-full" disabled>Coming Soon</Button>
				</CardContent>
			</Card>
			<Card>
				<CardContent class="">
					<h3 class="font-medium">Digital Downloads</h3>
					<p class="mt-2 text-sm text-muted-foreground">Access your purchased digital products</p>
					<Button variant="outline" class="mt-3 w-full" disabled>Coming Soon</Button>
				</CardContent>
			</Card>
			<Card>
				<CardContent class="">
					<h3 class="font-medium">Analytics</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Detailed insights on your content performance
					</p>
					<Button variant="outline" class="mt-3 w-full" disabled>Coming Soon</Button>
				</CardContent>
			</Card>
		</div>
	</div>
{/if}
