<script lang="ts">
	import MessageBlock from './MessageBlock.svelte';
	import { ScrollArea, Scrollbar } from '$lib/components/ui/scroll-area';
	import type { ChatMessage } from '$lib/utils/chatUtils';

	let {
		initialMessages = [],
		currentUserId,
		currentUserAvatar = null,
		class: customClass = ''
	} = $props();

	// State management
	let messages = $state<ChatMessage[]>(initialMessages);

	// Update messages when initialMessages change
	let derivedMessages = $derived(initialMessages);
	$effect(() => {
		messages = derivedMessages;
	});
</script>

<ScrollArea class={`h-full rounded-none border-0 border-b ${customClass}`} data-message-list>
	<div class="space-y-1 p-2">
		{#each messages as message}
			<!-- SANITIZATION: Sanitize message content to prevent XSS -->
			<MessageBlock
				{message}
				isCurrentUser={message.sent_from === currentUserId}
				avatarUrl={message.sent_from === currentUserId ? currentUserAvatar : null}
			/>
		{/each}
	</div>
	<Scrollbar orientation="vertical" />
</ScrollArea>
