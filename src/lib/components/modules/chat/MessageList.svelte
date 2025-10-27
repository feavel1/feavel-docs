<script lang="ts">
	import { tick } from 'svelte';
	import MessageBlock from './MessageBlock.svelte';
	import type { ChatMessage } from '$lib/utils/chatUtils';

	let { initialMessages = [], currentUserId, currentUserAvatar = null } = $props();

	// State management
	let messages = $state<ChatMessage[]>(initialMessages);

	let scrollContainerRef: HTMLDivElement;

	// Scroll to bottom of the message list
	const scrollToBottom = async (node: HTMLDivElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	// Update messages when initialMessages change
	let derivedMessages = $derived(initialMessages);

	$effect(() => {
		messages = derivedMessages;
		tick().then(() => {
			scrollToBottom(scrollContainerRef);
		});
	});
</script>

<div
	class="h-full overflow-y-auto rounded-none border-0 border-b"
	bind:this={scrollContainerRef}
	data-message-list
>
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
</div>
