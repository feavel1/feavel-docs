<script lang="ts">
	import MessageBlock from './MessageBlock.svelte';
	import { ScrollArea, Scrollbar } from '$lib/components/ui/scroll-area';
	import { onMount, afterUpdate } from 'svelte';

	export let initialMessages: any[];
	export let currentUserId: string;
	export let currentUserAvatar: string;
	export let height = '100%';

	let scrollAreaRef: any = null;

	// Function to scroll to the bottom
	const scrollToBottom = () => {
		if (scrollAreaRef && scrollAreaRef.scrollTo) {
			// Scroll to bottom of the viewport
			const viewport = scrollAreaRef.$el?.querySelector('[data-slot="scroll-area-viewport"]');
			if (viewport) {
				viewport.scrollTop = viewport.scrollHeight;
			}
		}
	};

	// Scroll to bottom when component mounts
	onMount(() => {
		scrollToBottom();
	});

	// Scroll to bottom when messages change
	afterUpdate(() => {
		scrollToBottom();
	});
</script>

<div class={$$props.class}>
	<ScrollArea bind:this={scrollAreaRef} style={`height: ${height}`}>
		<div class="space-y-4 p-4">
			{#each initialMessages as message}
				<MessageBlock
					{message}
					isCurrentUser={message.sent_from?.id === currentUserId}
					avatarUrl={message.sent_from?.id === currentUserId
						? currentUserAvatar
						: message.sent_from?.avatar_url}
				/>
			{/each}
		</div>
		<Scrollbar orientation="vertical" />
	</ScrollArea>
</div>
