<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import UserIcon from '@lucide/svelte/icons/user';
	import MessageInput from '$lib/components/modules/chat/MessageInput.svelte';
	import MessageList from '$lib/components/modules/chat/MessageList.svelte';
	import { startConversation, loadUserChats as loadUserChatsUtil, loadChatMessages as loadChatMessagesUtil, formatTime as formatTimeUtil, getOtherParticipant as getOtherParticipantUtil, type ChatConversation, type ChatMessage } from '$lib/utils/chatUtils';
	import { getAvatarUrlFromFileId } from '$lib/utils/user';

	// Props from page data
	let { data } = $props();

	// State management using Svelte 5 runes pattern
	let currentUserId = $state<string | null>(null);
	let currentUserAvatar = $state<string | null>(null);
	let chats = $state<ChatConversation[]>([]);
	let selectedChat = $state<ChatConversation | null>(null);
	let messages = $state<ChatMessage[]>([]);
	let searchQuery = $state('');
	let newChatUsername = $state('');
	let isCreatingChat = $state(false);
	let isLoading = $state(false);
	let chatsWatcher: any = $state(null);
	let messagesWatcher: any = $state(null);
	let isChatListOpen = $state(false); // For mobile sheet

	// Error and loading states
	let chatsError = $state<string | null>(null);
	let messagesError = $state<string | null>(null);
	let creatingChatError = $state<string | null>(null);

	// Avatar cache to prevent repeated lookups
	let avatarCache = $state<Record<string, string>>({});

	// Initialize component
	onMount(async () => {
		if (data?.session?.user?.id) {
			currentUserId = data.session.user.id;

			// Load current user's avatar
			if (data?.session?.user?.user_metadata?.avatar_url) {
				currentUserAvatar = data.session.user.user_metadata.avatar_url;
			} else {
				// Try to get from users table
				const { data: userData } = await data.supabase
					.from('users')
					.select('avatar_file_id')
					.eq('id', currentUserId)
					.single();

				if (userData?.avatar_file_id) {
					// Use our utility to get the avatar URL
					currentUserAvatar = await getAvatarUrlFromFileId(data.supabase, userData.avatar_file_id);
				}
			}

			// Load initial chats
			await loadUserChats();
			// Set up realtime subscriptions
			setupChatsSubscription();
		}
	});

	// Clean up subscriptions
	onDestroy(() => {
		chatsWatcher?.unsubscribe();
		messagesWatcher?.unsubscribe();
	});

	// Load all chats for current user
	async function loadUserChats(): Promise<void> {
		if (!currentUserId || !data?.supabase) return;

		isLoading = true;
		chatsError = null;
		try {
			const chatData = await loadUserChatsUtil(data.supabase, currentUserId);
			chats = chatData;
		} catch (error) {
			console.error('Error loading chats:', error);
			chatsError = error instanceof Error ? error.message : 'Failed to load chats';
		} finally {
			isLoading = false;
		}
	}

	// Set up realtime subscription for chat updates
	function setupChatsSubscription() {
		if (!currentUserId || !data?.supabase) return;

		// Unsubscribe from any existing chat subscription
		if (chatsWatcher) {
			chatsWatcher.unsubscribe();
		}

		// TODO: Fix realtime subscription setup - currently causing TypeScript errors
		// chatsWatcher = data.supabase
		// 	.channel('user-chats')
		// 	.on(
		// 		'postgres_changes',
		// 		{
		// 			event: '*',
		// 			schema: 'public',
		// 			table: 'chat_conversations'
		// 		},
		// 		async () => {
		// 			await loadUserChats();
		// 		}
		// 	)
		// 	.on(
		// 		'postgres_changes',
		// 		{
		// 			event: 'INSERT',
		// 			schema: 'public',
		// 			table: 'chat_participants'
		// 		},
		// 		async (payload: { new: { user_id: string } }) => {
		// 			if (payload.new.user_id === currentUserId) {
		// 				await loadUserChats();
		// 			}
		// 		}
		// 	)
		// 	.on(
		// 		'postgres_changes',
		// 		{
		// 			event: 'DELETE',
		// 			schema: 'public',
		// 			table: 'chat_participants'
		// 		},
		// 		async (payload: { old: { user_id: string } }) => {
		// 			if (payload.old.user_id === currentUserId) {
		// 				await loadUserChats();
		// 			}
		// 		}
		// 	)
		// 	.subscribe();
	}

	// Select a chat and load its messages
	async function selectChat(chat: ChatConversation): Promise<void> {
		selectedChat = chat;
		isChatListOpen = false; // Close sheet on mobile when chat is selected

		// Load messages for selected chat
		await loadChatMessages(chat.id);

		// Set up realtime subscription for messages
		setupMessagesSubscription(chat.id);
	}

	// Load messages for a specific chat
	async function loadChatMessages(chatId: string): Promise<void> {
		if (!chatId || !data?.supabase) return;

		messagesError = null;
		try {
			const messageData = await loadChatMessagesUtil(data.supabase, chatId);

			// Add avatar URLs to messages
			const messagesWithAvatars = await Promise.all(
				(messageData || []).map(async (message) => {
					if (message.sent_from && message.users?.avatar_file_id) {
						const avatarUrl = await getAvatarUrlForUser(message.sent_from);
						return {
							...message,
							sent_from_avatar_url: avatarUrl
						};
					}
					return message;
				})
			);

			messages = messagesWithAvatars;
		} catch (error) {
			console.error('Error loading messages:', error);
			messagesError = error instanceof Error ? error.message : 'Failed to load messages';
		}
	}

	// Set up realtime subscription for messages
	function setupMessagesSubscription(chatId: string) {
		if (!chatId || !data?.supabase) return;

		// Unsubscribe from any existing messages subscription
		if (messagesWatcher) {
			messagesWatcher.unsubscribe();
		}

		// TODO: Fix realtime subscription setup - currently causing TypeScript errors
		// messagesWatcher = data.supabase
		// 	.channel(`conversation-${chatId}`)
		// 	.on(
		// 		'postgres_changes',
		// 		{
		// 			event: 'INSERT',
		// 			schema: 'public',
		// 			table: 'chat_messages',
		// 			filter: `conversation_id=eq.${chatId}`
		// 		},
		// 		async (payload: { new: ChatMessage }) => {
		// 			// Add avatar URL to new message
		// 			const newMessage = payload.new;
		// 			if (newMessage.sent_from && newMessage.users?.avatar_file_id) {
		// 				const avatarUrl = await getAvatarUrlForUser(newMessage.sent_from);
		// 				newMessage.sent_from_avatar_url = avatarUrl;
		// 			}
		// 			// Add new message to the conversation
		// 			messages = [...messages, newMessage];
		// 		}
		// 	)
		// 	.subscribe();
	}

	// Create a new chat with a user
	async function createNewChat() {
		if (!newChatUsername.trim() || !currentUserId || !data?.supabase) return;

		isCreatingChat = true;
		creatingChatError = null;
		try {
			const result = await startConversation(data.supabase, currentUserId, newChatUsername);

			if (!result.success) {
				throw new Error(result.error || 'Failed to start conversation');
			}

			// Clear input and refresh chats
			newChatUsername = '';
			await loadUserChats();
		} catch (error) {
			console.error('Error creating chat:', error);
			creatingChatError = error instanceof Error ? error.message : 'Failed to create chat';
		} finally {
			isCreatingChat = false;
		}
	}

	// Handle new message sent
	function handleNewMessage(newMessage: ChatMessage) {
		messages = [...messages, newMessage];
	}

	// Get other participant in a chat
	function getOtherParticipant(chat: ChatConversation) {
		return getOtherParticipantUtil(chat, currentUserId || '');
	}

	// Get avatar URL for a user with caching
	async function getAvatarUrlForUser(userId: string): Promise<string> {
		if (!userId) return '';

		// Check if avatar is already in cache
		if (avatarCache[userId]) {
			return avatarCache[userId];
		}

		// Special case for current user - use current user's avatar if available
		if (userId === currentUserId && currentUserAvatar) {
			avatarCache[userId] = currentUserAvatar;
			return currentUserAvatar;
		}

		// Look up user's avatar file ID in the current messages or chats
		const user = findUserInMessages(userId);
		if (user && user.avatar_file_id) {
			const avatarUrl = await getAvatarUrlFromFileId(data.supabase, user.avatar_file_id);
			if (avatarUrl) {
				avatarCache[userId] = avatarUrl;
				return avatarUrl;
			}
		}

		// Return a default avatar URL if none found
		return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
	}

	// Simplified user interface for chat messages
	interface ChatUser {
		full_name: string | null;
		username: string | null;
		avatar_file_id: string | null;
	}

	// Find user data in messages
	function findUserInMessages(userId: string): ChatUser | null {
		// Look for user in current messages
		for (const message of messages) {
			if (message.users && message.sent_from === userId) {
				return message.users;
			}
		}

		// Look for user in current chats
		for (const chat of chats) {
			for (const participant of chat.chat_participants) {
				if (participant.user_id === userId && participant.users) {
					return participant.users;
				}
			}
		}

		return null;
	}

	// Format time for display
	function formatTime(dateString: string) {
		return formatTimeUtil(dateString);
	}
</script>

<!-- Unified chat interface -->
<div class="flex h-full flex-col md:flex-row md:gap-6">
	<!-- Chat List Sidebar - hidden on mobile when chat is selected -->
	<div class="flex w-full flex-col rounded-lg border md:w-1/3 transition-all duration-300 {selectedChat && 'hidden md:flex'}">
		<div class="flex h-full flex-col">
			<CardHeader class="border-b">
				<div class="flex items-center justify-between">
					<CardTitle>Messages</CardTitle>
					<Button size="sm" variant="outline" onclick={() => (isCreatingChat = !isCreatingChat)}>
						<PlusIcon class="h-4 w-4" />
					</Button>
				</div>

				{#if isCreatingChat}
					<div class="mt-4 flex gap-2">
						<Input bind:value={newChatUsername} placeholder="Enter username..." class="flex-1" />
						<Button
							onclick={createNewChat}
							size="sm"
							disabled={!newChatUsername.trim() || isCreatingChat}
						>
							Create
						</Button>
					</div>
					{#if creatingChatError}
						<div class="mt-2 text-sm text-red-500">{creatingChatError}</div>
					{/if}
				{/if}

				<div class="relative mt-4">
					<SearchIcon
						class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input bind:value={searchQuery} placeholder="Search conversations..." class="pl-10" />
				</div>
			</CardHeader>

			<CardContent class="flex-1 overflow-y-auto p-0">
				{#if isLoading}
					<div class="p-4 text-center text-muted-foreground">Loading conversations...</div>
				{:else if chatsError}
					<div class="p-4 text-center text-red-500">
						Error: {chatsError}
						<Button variant="outline" size="sm" class="ml-2" onclick={loadUserChats}>
							Retry
						</Button>
					</div>
				{:else if chats.length === 0}
					<div class="p-8 text-center">
						<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<MessageCircleIcon class="h-6 w-6 text-muted-foreground" />
						</div>
						<h3 class="mt-4 text-lg font-medium">No conversations yet</h3>
						<p class="mt-2 text-sm text-muted-foreground">
							Start a conversation by creating a new chat.
						</p>
					</div>
				{:else}
					<div class="divide-y">
						{#each chats as chat}
							<div
								role="button"
								tabindex="0"
								class="cursor-pointer p-4 transition-colors hover:bg-muted {selectedChat?.id ===
								chat.id
									? 'bg-muted'
									: ''}"
								onclick={() => selectChat(chat)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										selectChat(chat);
									}
								}}
							>
								{#if chat}
									{@const otherParticipant = getOtherParticipant(chat)}
									<div class="flex items-center gap-3">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
										>
											<UserIcon class="h-5 w-5 text-primary" />
										</div>
										<div class="min-w-0 flex-1">
											<div class="flex items-center justify-between">
												<h4 class="truncate font-medium">
													{otherParticipant?.full_name ||
														otherParticipant?.username ||
														'Unknown User'}
												</h4>
												{#if chat.chat_messages?.[0]?.created_at}
													<span class="text-xs text-muted-foreground">
														{formatTime(chat.chat_messages[0].created_at)}
													</span>
												{/if}
											</div>
											{#if chat.chat_messages?.[0]?.message}
												<p class="truncate text-sm text-muted-foreground">
													{chat.chat_messages[0].message}
												</p>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</div>
	</div>

	<!-- Mobile header when chat is selected -->
	<div class="flex items-center justify-between border-b p-4 md:hidden {selectedChat ? 'flex' : 'hidden'}">
		{#if selectedChat}
			{@const otherParticipant = getOtherParticipant(selectedChat)}
			<div class="flex items-center gap-3">
				<Button variant="ghost" size="sm" onclick={() => (selectedChat = null)} class="p-2">
					←
				</Button>
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
					<UserIcon class="h-5 w-5 text-primary" />
				</div>
				<div class="min-w-0 flex-1">
					<h3 class="truncate font-medium">
						{otherParticipant?.full_name || otherParticipant?.username || 'Unknown User'}
					</h3>
				</div>
			</div>
			<Button variant="ghost" size="sm" onclick={() => (isChatListOpen = true)} class="p-2">
				Chats
			</Button>
		{/if}
	</div>

	<!-- Mobile Sheet for chat list -->
	<Sheet.Root bind:open={isChatListOpen}>
		<Sheet.Content side="left" class="w-4/5 p-0 md:hidden">
			<Sheet.Header class="border-b p-4 flex items-center justify-between">
				<Sheet.Title>Messages</Sheet.Title>
				<Button variant="ghost" size="sm" onclick={() => (isChatListOpen = false)} class="p-2">
					✕
				</Button>
			</Sheet.Header>
			<!-- Chat list content -->
			<div class="flex h-[calc(100%-64px)] flex-1 flex-col">
				<div class="border-b p-4">
					<Button
						size="sm"
						variant="outline"
						class="w-full"
						onclick={() => (isCreatingChat = !isCreatingChat)}
					>
						<PlusIcon class="mr-2 h-4 w-4" />
						New Chat
					</Button>

					{#if isCreatingChat}
						<div class="mt-4 flex gap-2">
							<Input
								bind:value={newChatUsername}
								placeholder="Enter username..."
								class="flex-1"
							/>
							<Button
								onclick={createNewChat}
								size="sm"
								disabled={!newChatUsername.trim() || isCreatingChat}
							>
								Create
							</Button>
						</div>
						{#if creatingChatError}
							<div class="mt-2 text-sm text-red-500">{creatingChatError}</div>
						{/if}
					{/if}

					<div class="relative mt-4">
						<SearchIcon
							class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							bind:value={searchQuery}
							placeholder="Search conversations..."
							class="pl-10"
						/>
					</div>
				</div>

				<div class="flex-1 overflow-y-auto">
					{#if isLoading}
						<div class="p-4 text-center text-muted-foreground">
							Loading conversations...
						</div>
					{:else if chatsError}
						<div class="p-4 text-center text-red-500">
							Error: {chatsError}
							<Button variant="outline" size="sm" class="ml-2" onclick={loadUserChats}>
								Retry
							</Button>
						</div>
					{:else if chats.length === 0}
						<div class="p-8 text-center">
							<div
								class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted"
							>
								<MessageCircleIcon class="h-6 w-6 text-muted-foreground" />
							</div>
							<h3 class="mt-4 text-lg font-medium">No conversations yet</h3>
							<p class="mt-2 text-sm text-muted-foreground">
								Start a conversation by creating a new chat.
							</p>
						</div>
					{:else}
						<div class="divide-y">
							{#each chats as chat}
								<div
									role="button"
									tabindex="0"
									class="cursor-pointer p-4 transition-colors hover:bg-muted {selectedChat?.id ===
									chat.id
										? 'bg-muted'
										: ''}"
									onclick={() => {
										selectChat(chat);
										isChatListOpen = false;
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											selectChat(chat);
											isChatListOpen = false;
										}
									}}
								>
									{#if chat}
										{@const otherParticipant = getOtherParticipant(chat)}
										<div class="flex items-center gap-3">
											<div
												class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
											>
												<UserIcon class="h-5 w-5 text-primary" />
											</div>
											<div class="min-w-0 flex-1">
												<div class="flex items-center justify-between">
													<h4 class="truncate font-medium">
														{otherParticipant?.full_name ||
															otherParticipant?.username ||
															'Unknown User'}
													</h4>
													{#if chat.chat_messages?.[0]?.created_at}
														<span class="text-xs text-muted-foreground">
															{formatTime(chat.chat_messages[0].created_at)}
														</span>
													{/if}
												</div>
												{#if chat.chat_messages?.[0]?.message}
													<p class="truncate text-sm text-muted-foreground">
														{chat.chat_messages[0].message}
													</p>
												{/if}
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</Sheet.Content>
	</Sheet.Root>

	<!-- Chat Area -->
	<div class="flex flex-1 flex-col rounded-lg border transition-all duration-300 {selectedChat ? 'flex' : 'hidden md:flex'}">
		{#if selectedChat}
			<CardHeader class="border-b hidden md:flex">
				{#if selectedChat}
					{@const otherParticipant = getOtherParticipant(selectedChat)}
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<UserIcon class="h-5 w-5 text-primary" />
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="truncate font-medium">
								{otherParticipant?.full_name || otherParticipant?.username || 'Unknown User'}
							</h3>
						</div>
					</div>
				{/if}
			</CardHeader>

			<CardContent class="flex-1 p-0">
				{#if messagesError}
					<div class="p-4 text-center text-red-500">
						Error: {messagesError}
						<Button variant="outline" size="sm" class="ml-2" onclick={() => selectedChat && loadChatMessages(selectedChat.id)}>
							Retry
						</Button>
					</div>
				{:else if !selectedChat}
					<div class="flex flex-1 items-center justify-center">
						<div class="text-center">
							<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
								<MessageCircleIcon class="h-6 w-6 text-muted-foreground" />
							</div>
							<h3 class="mt-4 text-lg font-medium">Select a conversation</h3>
							<p class="mt-2 text-sm text-muted-foreground">
								Choose a conversation from the list to start chatting.
							</p>
						</div>
					</div>
				{:else}
					<MessageList
						initialMessages={messages}
						currentUserId={currentUserId || ''}
						currentUserAvatar={currentUserAvatar || ''}
						height="100%"
						class="p-4"
					/>
				{/if}
			</CardContent>

			<div class="border-t p-4">
				<MessageInput
					supabase={data?.supabase}
					conversationId={selectedChat.id}
					currentUserId={currentUserId || ''}
					on:messageSent={(e) => handleNewMessage(e.detail)}
				/>
			</div>
		{:else}
			<div class="flex flex-1 items-center justify-center">
				<div class="text-center">
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
						<MessageCircleIcon class="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 class="mt-4 text-lg font-medium">Select a conversation</h3>
					<p class="mt-2 text-sm text-muted-foreground">
						Choose a conversation from the list to start chatting.
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>
