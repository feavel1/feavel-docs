<!-- $lib/ui/components/chat/MessageInput.svelte -->
<script lang="ts">
	import SendIcon from '@lucide/svelte/icons/send';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { sendMessage as sendRemoteMessage } from '$lib/remote/chat.remote';

	let { conversationId, currentUserId, onMessageSent } = $props();

	let currentMessage = $state('');
	let isSending = $state(false);

	const handleSendMessage = async () => {
		if (!currentMessage.trim() || isSending) return;

		isSending = true;

		try {
			const newMessage = await sendRemoteMessage({
				message: currentMessage.trim(),
				conversation_id: conversationId,
				sent_from: currentUserId
			});

			// Call the callback with the new message
			onMessageSent?.(newMessage);

			currentMessage = '';
		} catch (error) {
			console.error('Error sending message:', error);
			// You might want to add error handling here
		} finally {
			isSending = false;
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};
</script>

<div class="sticky bottom-0 border-t border-border bg-background p-1">
	<div class="relative flex items-end gap-1">
		<Textarea
			bind:value={currentMessage}
			onkeydown={handleKeyDown}
			placeholder="Shift + Enter for new line"
			disabled={isSending}
			aria-label="Type your message"
			class="min-h-8 resize-none px-2 py-1.5 pr-8 text-xs"
		/>

		<Button
			onclick={handleSendMessage}
			disabled={!currentMessage.trim() || isSending}
			aria-label="Send message"
			type="button"
			variant="ghost"
			size="icon"
			class="absolute right-1.5 bottom-1.5 h-5 w-5 rounded-full"
		>
			{#if isSending}
				<SendIcon class="h-2.5 w-2.5 animate-spin" />
			{:else}
				<SendIcon class="h-2.5 w-2.5" />
			{/if}
		</Button>
	</div>
</div>
