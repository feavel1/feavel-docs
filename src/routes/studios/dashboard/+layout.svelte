<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';

	let { children, data } = $props();
	const { studio, isApproved } = data;
</script>

<div class="min-h-screen">
	<div class="mx-auto max-w-6xl px-4 py-8">
		<h1 class="mb-6 text-2xl font-bold">
			Studio Dashboard
			{#if studio?.name}
				- {studio.name}
			{/if}
		</h1>

		{#if !isApproved}
			<div class="mb-6 rounded-md bg-yellow-50 p-4">
				<div class="flex">
					<div class="flex-shrink-0">
						<div class="h-5 w-5 text-yellow-400">⚠️</div>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-yellow-800">Application Status</h3>
						<div class="mt-2 text-sm text-yellow-700">
							<p>
								Your studio application is currently under review. You have limited access to the
								dashboard while waiting for approval.
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<nav class="mb-6 flex h-5 items-center space-x-4 text-sm">
			<a href="/studios/dashboard">Overview</a>
			<Separator orientation="vertical" />
			<a href="/studios/dashboard/services">Services</a>
			<Separator orientation="vertical" />
			<a href="/studios/dashboard/orders">Orders</a>
			<Separator orientation="vertical" />
			<a href="/studios/dashboard/settings">Settings</a>
		</nav>

		<div class="mt-6">
			{@render children()}
		</div>
	</div>
</div>
