<!-- $lib/ui/components/chat/MessageInput.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import SendIcon from '@lucide/svelte/icons/send';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';

	const dispatch = createEventDispatcher();

	let { supabase, conversationId, currentUserId } = $props<{
		supabase: SupabaseClient;
		conversationId: string;
		currentUserId: string;
	}>();

	let currentMessage = $state('');
	let isSending = $state(false);

	const resizeTextarea = (e: Event) => {
		const textarea = e.target as HTMLTextAreaElement;
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	// SERVER-SIDE: This function must always run on the server for security
	// VALIDATION: Input sanitization required
	// VALIDATION: Length validation required
	// RATE LIMIT: Implement message rate limiting to prevent spam
	const sendMessage = async () => {
		if (!currentMessage.trim() || isSending) return;

		isSending = true;

		try {
			const { data: newMessage, error } = await supabase
				.from('chat_messages')
				.insert([
					{
						message: currentMessage.trim(),
						conversation_id: conversationId,
						sent_from: currentUserId
					}
				])
				.select(
					`
          id,
          message,
          created_at,
          sent_from(id, username, avatar_url)
        `
				)
				.single();

			if (error) throw error;

			dispatch('messageSent', {
				...newMessage,
				// Add client-side timestamp for immediate UI update
				created_at: new Date().toISOString()
			});

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
			sendMessage();
		}
	};
</script>

<div class="sticky bottom-0 border-t border-border bg-background p-1">
	<div class="relative flex items-end gap-1">
		<Textarea
			bind:value={currentMessage}
			onkeydown={handleKeyDown}
			oninput={resizeTextarea}
			onfocus={resizeTextarea}
			placeholder="Shift + Enter for new line"
			disabled={isSending}
			aria-label="Type your message"
			class="min-h-8 resize-none px-2 py-1.5 pr-8 text-xs"
		/>

		<Button
			onclick={sendMessage}
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
