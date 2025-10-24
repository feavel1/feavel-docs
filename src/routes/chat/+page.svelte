<script lang="ts">
	import { onMount } from 'svelte';
	import MessageList from '$lib/components/modules/chat/MessageList.svelte';
	import MessageInput from '$lib/components/modules/chat/MessageInput.svelte';
	import ConversationList from '$lib/components/modules/chat/ConversationList.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import type { ChatMessage, ChatConversation } from '$lib/utils/chatUtils';

	// Import utility functions
	import {
		getUserConversations,
		getConversationMessages,
		sendMessage,
		createConversation
		// subscribeToMessages,
		// subscribeToConversations
	} from '$lib/utils/chatUtils';

	// Props from parent layout
	let { data } = $props();
	let { session, supabase } = data;

	// Ensure session exists
	if (!session) {
		throw new Error('User must be logged in to view messages');
	}

	// State management
	let conversations = $state<ChatConversation[]>([]);
	let currentConversationId = $state<string | null>(null);
	let currentMessages = $state<ChatMessage[]>([]);

	const currentUserId = session.user.id;
	let currentUserAvatar = $state<string | null>(null);
	let isMobileConversationOpen = $state(false);

	const handleNewMessage = async (event: CustomEvent<any>) => {
		if (!currentConversationId) return;

		// Send message using utility function
		const newMessageData = {
			conversation_id: currentConversationId,
			message: event.detail.message,
			sent_from: currentUserId
		};

		const newMessage = await sendMessage(supabase, newMessageData);

		if (newMessage) {
			// Add message to current messages
			currentMessages = [...currentMessages, newMessage];
		}
	};

	const selectConversation = async (conversationId: string) => {
		currentConversationId = conversationId;

		// Load messages for the selected conversation
		const messages = await getConversationMessages(supabase, conversationId, currentUserId);
		currentMessages = messages;

		// Close the sheet on mobile after selecting a conversation
		isMobileConversationOpen = false;
	};

	const createNewConversation = async () => {
		// Create new conversation using utility function
		const newConversation = await createConversation(supabase, [currentUserId]);

		if (newConversation) {
			// Add to conversations list
			conversations = [newConversation, ...conversations];
			currentConversationId = newConversation.id;

			// Initialize empty message array for new conversation
			currentMessages = [];
		}

		// Close the sheet on mobile after creating a new conversation
		isMobileConversationOpen = false;
	};

	onMount(async () => {
		// Load user conversations
		const userConversations = await getUserConversations(supabase, currentUserId);
		conversations = userConversations;

		// If there are conversations, load the first one
		if (userConversations.length > 0) {
			currentConversationId = userConversations[0].id;
			const messages = await getConversationMessages(
				supabase,
				userConversations[0].id,
				currentUserId
			);
			currentMessages = messages;
		}

		// Scroll to bottom of message list
		const scrollArea = document.querySelector('[data-scroll-area]');
		if (scrollArea) {
			scrollArea.scrollTop = scrollArea.scrollHeight;
		}
	});
</script>

<div class="mx-auto flex h-[700px] max-w-4xl flex-col border">
	<!-- Header with mobile conversation trigger -->
	<div class="flex flex-row items-center justify-between border-b p-2">
		<div class="text-lg font-bold">Chat</div>
		<Sheet.Sheet bind:open={() => isMobileConversationOpen, (v) => (isMobileConversationOpen = v)}>
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
					{currentConversationId}
					onConversationSelect={(conversationId: string) => {
						selectConversation(conversationId);
					}}
					onCreateNewConversation={() => {
						createNewConversation();
					}}
				/>
			</Sheet.SheetContent>
		</Sheet.Sheet>
	</div>

	<div class="flex flex-1 overflow-hidden">
		<div class="hidden w-1/3 border-r bg-background md:block lg:w-1/4">
			<ConversationList
				{conversations}
				{currentConversationId}
				onConversationSelect={(conversationId: string) => {
					selectConversation(conversationId);
				}}
				onCreateNewConversation={() => {
					createNewConversation();
				}}
			/>
		</div>

		<!-- Main Chat Area -->
		<div class="flex flex-1 flex-col">
			{#if currentConversationId}
				<MessageList
					initialMessages={currentMessages}
					{currentUserId}
					{currentUserAvatar}
					conversationId={currentConversationId}
				/>

				<MessageInput
					{supabase}
					on:messageSent={handleNewMessage}
					conversationId={currentConversationId}
					{currentUserId}
				/>
			{:else}
				<div class="flex h-full items-center justify-center">
					<div class="text-center">
						<h3 class="text-lg font-medium">No conversation selected</h3>
						<p class="text-gray-500">Select a conversation or create a new one</p>
						<Button onclick={() => createNewConversation()} class="mt-4">
							Start New Conversation
						</Button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
