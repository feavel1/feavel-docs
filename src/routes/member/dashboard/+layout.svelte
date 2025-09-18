<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';

	let { children } = $props();
</script>

<div class="min-h-screen">
	<div class="mx-auto max-w-6xl px-4 py-8">
		<h1 class="mb-6 text-2xl font-bold">User Dashboard</h1>

		<nav class="flex h-5 items-center space-x-4 text-sm">
			<a href="/member/dashboard">Overview</a>
			<Separator orientation="vertical" />
			<a href="/member/dashboard/posts">Posts</a>
			<Separator orientation="vertical" />
			<a href="/member/dashboard/messages">Messages</a>
			<Separator orientation="vertical" />
			<a href="/member/dashboard/orders">Orders</a>
			<Separator orientation="vertical" />
			<a href="/member/dashboard/settings">Settings</a>
		</nav>

		<div class="mt-6">
			{@render children()}
		</div>
	</div>
</div>
