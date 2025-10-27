<script lang="ts">
	import { tick } from 'svelte';
	import MessageBlock from './MessageBlock.svelte';
	import InfiniteScroll from '../infinite-scroll/InfiniteScroll.svelte';
	import type { ChatMessage } from '$lib/utils/chatUtils';

	let {
		initialMessages = [],
		currentUserId,
		currentUserAvatar = null,
		hasMore = true,
		isLoadingMore = false,
		onLoadMore = () => {}
	} = $props();

	// State management
	let messages = $state<ChatMessage[]>(initialMessages);
	let scrollContainerRef: HTMLDivElement;
	let previousScrollHeight = $state(0);
	let hasInitialized = $state(false);

	// Scroll to bottom of the message list
	const scrollToBottom = async (node: HTMLDivElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	// Preserve scroll position when prepending messages
	const preserveScrollPosition = async (container: HTMLDivElement, oldHeight: number) => {
		await tick();
		const newHeight = container.scrollHeight;
		const heightDifference = newHeight - oldHeight;
		container.scrollTop += heightDifference;
	};

	// Handle loading more messages
	const handleLoadMore = () => {
		if (hasMore && !isLoadingMore && scrollContainerRef) {
			previousScrollHeight = scrollContainerRef.scrollHeight;
			onLoadMore();
		}
	};

	// Handle new messages being added
	let derivedMessages = $derived(initialMessages);

	$effect(() => {
		const isFirstLoad = !hasInitialized && initialMessages.length > 0;

		if (isFirstLoad) {
			// First load - scroll to bottom
			messages = derivedMessages;
			hasInitialized = true;
			tick().then(() => {
				if (scrollContainerRef) {
					scrollToBottom(scrollContainerRef);
				}
			});
		} else if (
			messages.length < initialMessages.length &&
			initialMessages.length > messages.length
		) {
			// Messages were prepended - preserve scroll position
			messages = derivedMessages;
			tick().then(() => {
				if (scrollContainerRef) {
					preserveScrollPosition(scrollContainerRef, previousScrollHeight);
				}
			});
		} else {
			// Real-time messages added to the end - scroll to bottom if user was near bottom
			const container = scrollContainerRef;
			if (container) {
				const isNearBottom =
					container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
				messages = derivedMessages;
				if (isNearBottom) {
					tick().then(() => {
						scrollToBottom(container);
					});
				}
			}
		}
	});
</script>

<div
	class="h-full overflow-y-auto rounded-none border-0 border-b"
	bind:this={scrollContainerRef}
	data-message-list
>
	<InfiniteScroll
		{hasMore}
		isLoading={isLoadingMore}
		loadMore={handleLoadMore}
		threshold={0.1}
		loadingContent={() =>
			'<div class="flex justify-center py-2"><div class="h-6 w-6 animate-spin rounded-full border-2 border-t-foreground"></div></div>'}
	/>

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
