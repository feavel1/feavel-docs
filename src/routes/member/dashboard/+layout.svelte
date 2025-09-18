<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { browser } from '$app/environment';

	let { children } = $props();

	// Determine the current tab based on the URL using Svelte 5 patterns
	let currentTab = $derived.by(() => {
		if (!browser) return 'dashboard';
		const path = window.location.pathname;
		if (path === '/member/dashboard/posts') return 'posts';
		if (path === '/member/dashboard/messages') return 'messages';
		if (path === '/member/dashboard/orders') return 'orders';
		if (path === '/member/dashboard/settings') return 'settings';
		return 'dashboard';
	});
</script>

<div class="min-h-screen">
	<div class="mx-auto max-w-6xl px-4 py-8">
		<h1 class="mb-6 text-2xl font-bold">Dashboard</h1>

		<Tabs.Root value={currentTab} class="w-full">
			<Tabs.List class="mb-6">
				<Tabs.Trigger value="dashboard">
					<a href="/member/dashboard" class="flex h-full w-full items-center justify-center">
						Overview
					</a>
				</Tabs.Trigger>
				<Tabs.Trigger value="posts">
					<a href="/member/dashboard/posts" class="flex h-full w-full items-center justify-center">
						Posts
					</a>
				</Tabs.Trigger>
				<Tabs.Trigger value="messages">
					<a
						href="/member/dashboard/messages"
						class="flex h-full w-full items-center justify-center">Messages</a
					>
				</Tabs.Trigger>
				<Tabs.Trigger value="orders">
					<a href="/member/dashboard/orders" class="flex h-full w-full items-center justify-center">
						Orders
					</a>
				</Tabs.Trigger>
				<Tabs.Trigger value="settings">
					<a
						href="/member/dashboard/settings"
						class="flex h-full w-full items-center justify-center"
					>
						Settings
					</a>
				</Tabs.Trigger>
			</Tabs.List>

			<div class="mt-6">
				{@render children()}
			</div>
		</Tabs.Root>
	</div>
</div>
