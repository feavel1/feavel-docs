<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import Posts from '$lib/components/modules/content/Posts.svelte';

	const { data: propsData } = $props();
	const { session, supabase } = propsData;
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

	<Posts {supabase} userId={session?.user?.id} showDrafts={true} />
</div>
