<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Mail, Send } from '@lucide/svelte';
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold">Messages</h1>
		<p class="text-muted-foreground">Your private conversations</p>
	</div>

	<Card>
		<CardContent class="py-12 text-center">
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
				<Mail class="h-6 w-6 text-muted-foreground" />
			</div>
			<h3 class="mt-4 text-lg font-medium">No messages yet</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				You don't have any messages. Messaging functionality is coming soon.
			</p>
			<div class="mt-6">
				<Button disabled>
					<Send class="mr-2 h-4 w-4" />
					Send Message
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
