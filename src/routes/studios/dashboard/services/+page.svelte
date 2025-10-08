<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import Services from '$lib/components/modules/content/Services.svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';

	interface Data {
		isApproved: boolean;
		services: any[];
		supabase: SupabaseClient;
	}

	// Get data from parent layout
	const { data }: { data: Data } = $props();
	const { isApproved, services, supabase } = data;
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Studio Services</h1>
	</div>

	{#if isApproved}
		<!-- Display services using existing Services component -->
		<Services {supabase} initialServices={services} />
	{:else}
		<!-- Display limited access message -->
		<Card>
			<CardHeader>
				<CardTitle>Services Management</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="rounded-md bg-yellow-50 p-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<div class="h-5 w-5 text-yellow-400">⚠️</div>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-yellow-800">Limited Access</h3>
							<div class="mt-2 text-sm text-yellow-700">
								<p>
									Service management will be available after your studio application is approved.
								</p>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>