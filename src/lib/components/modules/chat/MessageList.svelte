<script lang="ts">
	import MessageBlock from './MessageBlock.svelte';
	import { ScrollArea, Scrollbar } from '$lib/components/ui/scroll-area';
	import type { ChatMessage } from '$lib/utils/chatUtils';

	let {
		initialMessages = [],
		currentUserId,
		currentUserAvatar = null,
		conversationId = null,
		onLoadMore,
		hasMoreMessages = true,
		class: customClass = ''
	} = $props();

	// State management
	let messages = $state<ChatMessage[]>(initialMessages);
	let scrollTop = $state<number>(0);
	let shouldAutoScroll = $state<boolean>(true);
	let isLoadingMore = $state<boolean>(false);
	let scrollAreaRef = $state<HTMLElement | null>(null);

	// Handle scroll events
	function handleScroll(e: Event) {
		const target = e.target as HTMLElement;
		scrollTop = target.scrollTop;

		// Check if we need to load more messages (scrolled to top)
		if (scrollTop < 100 && onLoadMore && !isLoadingMore && hasMoreMessages) {
			isLoadingMore = true;
			onLoadMore();
			// Reset loading state after a delay to prevent rapid firing
			setTimeout(() => {
				isLoadingMore = false;
			}, 1000);
		}

		// Determine if we should auto-scroll (user is at bottom)
		const scrollThreshold = target.scrollHeight - target.clientHeight - 100;
		shouldAutoScroll = target.scrollTop >= scrollThreshold;
	}

	// Auto-scroll to bottom when new messages arrive and user is at bottom
	$effect(() => {
		if (shouldAutoScroll && conversationId) {
			// Use requestAnimationFrame to ensure DOM is updated
			requestAnimationFrame(() => {
				const scrollArea = document.querySelector('[data-message-list]');
				if (scrollArea) {
					scrollArea.scrollTop = scrollArea.scrollHeight;
				}
			});
		}
	});

	// Update messages when initialMessages change
	let derivedMessages = $derived(initialMessages);
	$effect(() => {
		messages = derivedMessages;
	});

	// Attach scroll listener after component mounts
	$effect(() => {
		if (scrollAreaRef) {
			const viewport = scrollAreaRef.querySelector('[data-slot="scroll-area-viewport"]');
			if (viewport) {
				viewport.addEventListener('scroll', handleScroll);
				return () => viewport.removeEventListener('scroll', handleScroll);
			}
		}
		return () => {}; // Return empty cleanup function for all code paths
	});
</script>

<ScrollArea
	class={`h-full rounded-none border-0 border-b ${customClass}`}
	bind:ref={scrollAreaRef}
	data-message-list
>
	<div class="space-y-1 p-2">
		{#if isLoadingMore}
			<div class="py-2 text-center text-xs text-gray-500">Loading more messages...</div>
		{/if}

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
