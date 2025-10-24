<script lang="ts">
	import MessageBlock from './MessageBlock.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	export let initialMessages: any[];
	export let currentUserId: string;
	export let currentUserAvatar: string | null = null;
	export let conversationId: string | null = null;
</script>

<ScrollArea class="h-full rounded-none border-0 border-b">
	<div class="space-y-1 p-2">
		{#each initialMessages as message}
			<!-- SANITIZATION: Sanitize message content to prevent XSS -->
			<MessageBlock
				{message}
				isCurrentUser={message.sent_from === currentUserId}
				avatarUrl={message.sent_from === currentUserId
					? currentUserAvatar
					: message.sent_from_avatar_url}
			/>
		{/each}
	</div>
</ScrollArea>
