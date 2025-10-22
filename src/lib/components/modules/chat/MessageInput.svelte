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

<div class="rounded-b-2xl border-t border-border bg-background p-4">
	<div class="relative flex items-end gap-2">
		<Textarea
			bind:value={currentMessage}
			onkeydown={handleKeyDown}
			oninput={resizeTextarea}
			onfocus={resizeTextarea}
			placeholder="Type your message..."
			disabled={isSending}
			aria-label="Type your message"
			class="min-h-12 resize-none px-4 py-3 pr-12"
		/>

		<Button
			onclick={sendMessage}
			disabled={!currentMessage.trim() || isSending}
			aria-label="Send message"
			type="button"
			size="icon"
			class="absolute right-2 bottom-2 h-8 w-8 rounded-full"
		>
			{#if isSending}
				<SendIcon class="h-4 w-4 animate-spin" />
			{:else}
				<SendIcon class="h-4 w-4" />
			{/if}
		</Button>
	</div>
</div>
