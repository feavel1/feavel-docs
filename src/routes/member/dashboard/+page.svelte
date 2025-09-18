<script lang="ts">
	import ProfileCard from '$lib/components/modules/cards/ProfileCard.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Heart, MessageCircle, FileText } from '@lucide/svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	const { data: propsData } = $props();
	const { userProfile, stats, session } = propsData;

	// Get supabase client from parent layout data
	const parentData = get(page).data;
	const supabase = parentData?.supabase;
</script>

{#if !session?.user}
	<div class="py-8 text-center">
		<p>
			Please <a href="/auth/login" class="text-indigo-600 hover:underline">log in</a> to view your dashboard.
		</p>
	</div>
{:else}
	<!-- Profile Header with Stats -->
	<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Profile Card -->
		<div class="lg:col-span-1">
			<div class="relative">
				<ProfileCard {userProfile} {supabase} isOwnProfile={true} />
			</div>
		</div>

		<!-- Stats Overview -->
		<div class="lg:col-span-2">
			<Card>
				<CardHeader>
					<CardTitle>Your Activity Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div class="flex flex-col items-center rounded-lg border p-6">
							<FileText class="mb-2 h-8 w-8 text-muted-foreground" />
							<span class="text-3xl font-bold">{stats?.posts || 0}</span>
							<span class="text-sm text-muted-foreground">Posts</span>
						</div>
						<div class="flex flex-col items-center rounded-lg border p-6">
							<MessageCircle class="mb-2 h-8 w-8 text-muted-foreground" />
							<span class="text-3xl font-bold">{stats?.comments || 0}</span>
							<span class="text-sm text-muted-foreground">Comments</span>
						</div>
						<div class="flex flex-col items-center rounded-lg border p-6">
							<Heart class="mb-2 h-8 w-8 text-muted-foreground" />
							<span class="text-3xl font-bold">{stats?.likes || 0}</span>
							<span class="text-sm text-muted-foreground">Likes Received</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
{/if}
