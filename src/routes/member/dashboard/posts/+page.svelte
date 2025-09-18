<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { FileText, Plus } from '@lucide/svelte';
	import PostCard from '$lib/components/modules/cards/PostCard.svelte';

	const { data: propsData } = $props();
	const { posts = [], supabase } = propsData;
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold">My Posts</h1>
			<p class="text-muted-foreground">Manage your blog posts</p>
		</div>
		<Button onclick={() => (window.location.href = '/posts/new')}>
			<Plus class="mr-2 h-4 w-4" />
			Create New Post
		</Button>
	</div>

	{#if posts.length > 0}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each posts as post (post.id)}
				<PostCard {post} {supabase} />
			{/each}
		</div>
	{:else}
		<Card>
			<CardContent class="py-12 text-center">
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<FileText class="h-6 w-6 text-muted-foreground" />
				</div>
				<h3 class="mt-4 text-lg font-medium">No posts yet</h3>
				<p class="mt-2 text-sm text-muted-foreground">Get started by creating a new post.</p>
				<div class="mt-6">
					<Button onclick={() => (window.location.href = '/posts/new')}>
						<Plus class="mr-2 h-4 w-4" />
						Create Post
					</Button>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
