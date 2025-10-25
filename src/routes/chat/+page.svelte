<script lang="ts">
	import ChatContainer from '$lib/components/modules/chat/ChatContainer.svelte';
	import ConversationList from '$lib/components/modules/chat/ConversationList.svelte';
	import MessageList from '$lib/components/modules/chat/MessageList.svelte';
	import MessageInput from '$lib/components/modules/chat/MessageInput.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import MenuIcon from '@lucide/svelte/icons/menu';

	// Import utility functions
	import { sendMessage } from '$lib/utils/chatUtils';

	// Props from parent layout
	let { data } = $props();
	let { session, supabase } = data;

	// Ensure session exists
	if (!session) {
		throw new Error('User must be logged in to view messages');
	}

	// State management
	let isMobileConversationOpen = $state(false);

	const currentUserId = session.user.id;

	// Handle new message
	const handleNewMessage = async (conversationId: string, messageText: string) => {
		// Send message using utility function
		const newMessageData = {
			conversation_id: conversationId,
			message: messageText,
			sent_from: currentUserId
		};

		const newMessage = await sendMessage(supabase, newMessageData);
		return newMessage;
	};
</script>

<ChatContainer {session} {supabase}>
	{#snippet children({
		conversations,
		activeConversationId,
		messages,
		onSelectConversation,
		onJoinGroup,
		onCreateConversation,
		onLoadMoreMessages,
		hasMoreMessages
	})}
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
						currentConversationId={activeConversationId}
						onConversationSelect={onSelectConversation}
						onCreateNewConversation={() => onCreateConversation([currentUserId])}
						{onJoinGroup}
					/>
				</Sheet.SheetContent>
			</Sheet.Sheet>
		</div>

		<div class="flex flex-1 overflow-hidden">
			<div class="hidden w-1/3 border-r bg-background md:block lg:w-1/4">
				<ConversationList
					{conversations}
					currentConversationId={activeConversationId}
					onConversationSelect={onSelectConversation}
					onCreateNewConversation={() => onCreateConversation([currentUserId])}
					{onJoinGroup}
				/>
			</div>

			<!-- Main Chat Area -->
			<div class="flex flex-1 flex-col">
				{#if activeConversationId}
					<MessageList
						initialMessages={messages}
						{currentUserId}
						conversationId={activeConversationId}
						onLoadMore={onLoadMoreMessages}
						{hasMoreMessages}
					/>

					<MessageInput
						{supabase}
						on:messageSent={(e) => handleNewMessage(activeConversationId, e.detail.message)}
						conversationId={activeConversationId}
						{currentUserId}
					/>
				{:else}
					<div class="flex h-full items-center justify-center">
						<div class="text-center">
							<h3 class="text-lg font-medium">No conversation selected</h3>
							<p class="text-gray-500">Select a conversation or create a new one</p>
							<Button onclick={() => onCreateConversation([currentUserId])} class="mt-4">
								Start New Conversation
							</Button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/snippet}
</ChatContainer>
