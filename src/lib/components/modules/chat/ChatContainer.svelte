<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ChatMessage, ChatConversation } from '$lib/remote/chat.remote';

	// Import UI components
	import ConversationList from './ConversationList.svelte';
	import MessageList from './MessageList.svelte';
	import MessageInput from './MessageInput.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import MenuIcon from '@lucide/svelte/icons/menu';

	// Import remote functions for data fetching
	import { getUserConversations, getConversationMessages } from '$lib/remote/chat.remote';
	// Keep subscription functions in utilities for real-time logic
	import { subscribeToMessages, subscribeToConversations } from '$lib/utils/chatUtils';

	let { session, supabase } = $props();

	// State management
	let conversations = $state<ChatConversation[]>([]);
	let activeConversation = $state<ChatConversation | null>(null);
	let messages = $state<ChatMessage[]>([]);
	let isLoading = $state<boolean>(true);
	let messageSubscription = $state<any>(null);
	let conversationSubscription = $state<any>(null);
	let isMobileConversationOpen = $state(false);

	// Pagination state
	let hasMoreMessages = $state<boolean>(true);
	let isLoadingMoreMessages = $state<boolean>(false);
	let initialMessageLimit = $state<number>(10);

	const currentUserId = session.user.id;

	// Load user conversations
	async function loadConversations() {
		isLoading = true;
		try {
			const userConversations = await getUserConversations(currentUserId);
			conversations = userConversations;
		} catch (error) {
			console.error('Error loading conversations:', error);
		} finally {
			isLoading = false;
		}
	}

	// Set active conversation
	async function selectConversation(conversationId: string) {
		console.log('Selecting conversation:', conversationId);
		const conversation = conversations.find((c) => c.id === conversationId);
		if (conversation) {
			activeConversation = conversation;
			console.log('Active conversation set:', conversation);
			// Reset pagination state
			hasMoreMessages = true;
			isLoadingMoreMessages = false;
			await loadMessages(conversationId, 0, initialMessageLimit);
			setupMessageSubscription(conversationId);
		} else {
			console.log('Conversation not found:', conversationId);
		}
	}

	// Load messages for active conversation (initial load or more messages)
	async function loadMessages(conversationId: string, offset: number = 0, limit: number = 20) {
		try {
			const conversationMessages = await getConversationMessages({
				conversationId,
				limit,
				before: offset > 0 ? messages[0]?.created_at : undefined
			});

			if (offset === 0) {
				// Initial load
				messages = conversationMessages;
				hasMoreMessages = conversationMessages.length === limit;
			} else {
				// Loading more (older) messages
				messages = [...conversationMessages, ...messages];
				hasMoreMessages = conversationMessages.length === limit;
			}
		} catch (error) {
			console.error('Error loading messages:', error);
		} finally {
			isLoadingMoreMessages = false;
		}
	}

	// Load more messages for pagination
	async function loadMoreMessages() {
		if (!activeConversation || !hasMoreMessages || isLoadingMoreMessages) return;

		isLoadingMoreMessages = true;
		// For pagination, we pass 1 as the offset to indicate we want to load more messages
		// The actual logic is handled in loadMessages by using the before timestamp
		await loadMessages(activeConversation.id, 1, initialMessageLimit);
	}

	// Create new conversation
	async function createNewConversation(participantIds: string[]) {
		// This would typically call a utility function to create a conversation
		// For now, we'll just log it
		console.log('Creating new conversation with participants:', participantIds);
	}

	// Set up real-time subscriptions
	function setupMessageSubscription(conversationId: string) {
		console.log('Setting up message subscription for conversation:', conversationId);
		// Clean up existing subscription
		if (messageSubscription) {
			console.log('Cleaning up existing message subscription');
			messageSubscription();
		}

		// Set up new subscription
		subscribeToMessages(supabase, conversationId, (message: ChatMessage) => {
			console.log('Received new message via subscription:', message);
			messages = [...messages, message];
		}).then((unsub) => {
			messageSubscription = unsub;
		});
	}

	function setupConversationSubscription() {
		console.log('Setting up conversation subscription for user:', currentUserId);
		// Clean up existing subscription
		if (conversationSubscription) {
			console.log('Cleaning up existing conversation subscription');
			conversationSubscription();
		}

		// Set up new subscription
		subscribeToConversations(supabase, currentUserId, (conversation: ChatConversation) => {
			console.log('Received new conversation via subscription:', conversation);
			conversations = [conversation, ...conversations];
		}).then((unsub) => {
			conversationSubscription = unsub;
		});
	}

	// Initialize component
	onMount(async () => {
		console.log('Initializing chat container');
		await loadConversations();
		console.log('Loaded conversations:', conversations);
		setupConversationSubscription();

		// If there are conversations, load the first one
		if (conversations.length > 0) {
			console.log('Selecting first conversation:', conversations[0].id);
			await selectConversation(conversations[0].id);
		} else {
			console.log('No conversations found');
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

<div class="mx-auto flex h-[600px] max-w-4xl flex-col border">
	{#if isLoading}
		<div class="flex h-full items-center justify-center">
			<p>Loading conversations...</p>
		</div>
	{:else}
		<!-- Header with mobile conversation trigger -->
		<div class="flex flex-row items-center justify-between border-b p-2">
			<div class="text-lg font-bold">Chat</div>
			<Sheet.Sheet
				bind:open={() => isMobileConversationOpen, (v) => (isMobileConversationOpen = v)}
			>
				<Sheet.SheetTrigger class="md:hidden">
					<Button variant="ghost" size="icon">
						<MenuIcon class="h-4 w-4" />
					</Button>
				</Sheet.SheetTrigger>
				<Sheet.SheetContent side="right" class="w-64">
					<Sheet.SheetHeader class="border-b">
						<Sheet.SheetTitle>Conversations</Sheet.SheetTitle>
						<Sheet.Description>Add new friends to chat!</Sheet.Description>
					</Sheet.SheetHeader>
					<ConversationList
						{conversations}
						currentConversationId={activeConversation?.id}
						onConversationSelect={selectConversation}
						onCreateNewConversation={() => createNewConversation([currentUserId])}
					/>
				</Sheet.SheetContent>
			</Sheet.Sheet>
		</div>

		<div class="flex flex-1 overflow-hidden">
			<div class="hidden w-1/3 border-r bg-background md:block lg:w-1/4">
				<ConversationList
					{conversations}
					currentConversationId={activeConversation?.id}
					onConversationSelect={selectConversation}
					onCreateNewConversation={() => createNewConversation([currentUserId])}
				/>
			</div>

			<!-- Main Chat Area -->
			<div class="flex flex-1 flex-col">
				{#if activeConversation?.id}
					<div class="flex flex-1 flex-col overflow-hidden">
						<MessageList
							initialMessages={messages}
							{currentUserId}
							hasMore={hasMoreMessages}
							isLoadingMore={isLoadingMoreMessages}
							onLoadMore={loadMoreMessages}
						/>
					</div>

					<MessageInput
						onMessageSent={() => {
							// Removed immediate UI update to prevent duplicate messages
							// Real-time subscription in setupMessageSubscription handles UI updates
						}}
						conversationId={activeConversation!.id}
						{currentUserId}
					/>
				{:else}
					<div class="flex h-full items-center justify-center">
						<div class="text-center">
							<h3 class="text-lg font-medium">No conversation selected</h3>
							<p class="text-gray-500">Select a conversation or create a new one</p>
							<Button href="/members" class="mt-4">Start New Conversation</Button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
