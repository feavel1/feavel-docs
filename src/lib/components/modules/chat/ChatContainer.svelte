<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ChatMessage, ChatConversation } from '$lib/utils/chatUtils';

	// Import utility functions
	import {
		getUserConversations,
		getConversationMessages,
		getOlderMessages,
		subscribeToMessages,
		subscribeToConversations,
		joinGroupChat
	} from '$lib/utils/chatUtils';

	let { session, supabase, children } = $props();

	// State management
	let conversations = $state<ChatConversation[]>([]);
	let activeConversation = $state<ChatConversation | null>(null);
	let messages = $state<ChatMessage[]>([]);
	let isLoading = $state<boolean>(true);
	let messageSubscription = $state<any>(null);
	let conversationSubscription = $state<any>(null);
	let hasMoreMessages = $state<boolean>(true); // Track if there are more messages to load

	const currentUserId = session.user.id;

	// Load user conversations
	async function loadConversations() {
		isLoading = true;
		try {
			const userConversations = await getUserConversations(supabase, currentUserId);
			conversations = userConversations;
		} catch (error) {
			console.error('Error loading conversations:', error);
		} finally {
			isLoading = false;
		}
	}

	// Set active conversation
	async function selectConversation(conversationId: string) {
		const conversation = conversations.find((c) => c.id === conversationId);
		if (conversation) {
			activeConversation = conversation;
			await loadMessages(conversationId);
			setupMessageSubscription(conversationId);
		}
	}

	// Load messages for active conversation
	async function loadMessages(conversationId: string) {
		try {
			const conversationMessages = await getConversationMessages(supabase, conversationId, {
				limit: 50
			});
			messages = conversationMessages;

			// If we got fewer messages than the limit, there are no more older messages
			hasMoreMessages = conversationMessages.length >= 50;
		} catch (error) {
			console.error('Error loading messages:', error);
		}
	}

	// Load older messages for pagination
	async function loadOlderMessages() {
		if (!activeConversation || !hasMoreMessages) return;

		try {
			// Get the oldest message timestamp
			if (messages.length === 0) return;

			const oldestMessage = messages[0];
			const olderMessages = await getOlderMessages(
				supabase,
				activeConversation.id,
				oldestMessage.created_at,
				50
			);

			// Prepend older messages to the existing messages
			messages = [...olderMessages, ...messages];

			// If we got fewer messages than the limit, there are no more older messages
			hasMoreMessages = olderMessages.length >= 50;
		} catch (error) {
			console.error('Error loading older messages:', error);
		}
	}

	// Join a group chat
	async function joinGroup(conversationId: string) {
		try {
			const success = await joinGroupChat(supabase, conversationId, currentUserId);

			if (success) {
				// Refresh conversations list
				await loadConversations();

				// Select the joined conversation
				await selectConversation(conversationId);
			}
		} catch (error) {
			console.error('Error joining group chat:', error);
		}
	}

	// Create new conversation
	async function createNewConversation(participantIds: string[]) {
		// This would typically call a utility function to create a conversation
		// For now, we'll just log it
		console.log('Creating new conversation with participants:', participantIds);
	}

	// Set up real-time subscriptions
	function setupMessageSubscription(conversationId: string) {
		// Clean up existing subscription
		if (messageSubscription) {
			messageSubscription();
		}

		// Set up new subscription
		subscribeToMessages(supabase, conversationId, (message: ChatMessage) => {
			messages = [...messages, message];
		}).then((unsub) => {
			messageSubscription = unsub;
		});
	}

	function setupConversationSubscription() {
		// Clean up existing subscription
		if (conversationSubscription) {
			conversationSubscription();
		}

		// Set up new subscription
		subscribeToConversations(supabase, currentUserId, (conversation: ChatConversation) => {
			conversations = [conversation, ...conversations];
		}).then((unsub) => {
			conversationSubscription = unsub;
		});
	}

	// Initialize component
	onMount(async () => {
		await loadConversations();
		setupConversationSubscription();

		// If there are conversations, load the first one
		if (conversations.length > 0) {
			await selectConversation(conversations[0].id);
		}
	});

	// Clean up subscriptions
	onDestroy(() => {
		if (messageSubscription) {
			messageSubscription();
		}
		if (conversationSubscription) {
			conversationSubscription();
		}
	});
</script>

<div class="mx-auto flex h-[700px] max-w-4xl flex-col border">
	{#if isLoading}
		<div class="flex h-full items-center justify-center">
			<p>Loading conversations...</p>
		</div>
	{:else}
		{@render children?.({
			conversations,
			activeConversationId: activeConversation?.id,
			messages,
			isLoading,
			onSelectConversation: selectConversation,
			onJoinGroup: joinGroup,
			onCreateConversation: createNewConversation,
			onLoadMoreMessages: loadOlderMessages,
			hasMoreMessages
		})}
	{/if}
</div>
