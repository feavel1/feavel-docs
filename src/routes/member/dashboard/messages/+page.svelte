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

	// Props from page data
	let { data } = $props();

	// State management using Svelte 5 runes pattern
	let currentUserId = $state<string | null>(null);
	let currentUserAvatar = $state<string | null>(null);
	let chats = $state<any[]>([]);
	let selectedChat = $state<any | null>(null);
	let messages = $state<any[]>([]);
	let searchQuery = $state('');
	let newChatUserEmail = $state('');
	let isCreatingChat = $state(false);
	let isLoading = $state(false);
	let chatsWatcher: any = $state(null);
	let messagesWatcher: any = $state(null);
	let isChatListOpen = $state(false); // For mobile sheet

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
					const { data: avatarData } = await data.supabase
						.from('file_storage')
						.select('storage_path')
						.eq('id', userData.avatar_file_id)
						.single();

					if (avatarData?.storage_path) {
						// This would be the public URL to the avatar
						// You might need to adjust this based on your storage configuration
						currentUserAvatar = avatarData.storage_path;
					}
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
	async function loadUserChats() {
		if (!currentUserId || !data?.supabase) return;

		isLoading = true;
		try {
			// First get all conversation IDs where current user is a participant
			const { data: participantData, error: participantError } = await data.supabase
				.from('chat_participants')
				.select('conversation_id')
				.eq('user_id', currentUserId);

			if (participantError) throw participantError;

			const conversationIds = participantData.map((p) => p.conversation_id);

			if (conversationIds.length === 0) {
				chats = [];
				isLoading = false;
				return;
			}

			// Then get the conversation details with participants and last message
			const { data: chatData, error: chatError } = await data.supabase
				.from('chat_conversations')
				.select(
					`
					id,
					created_at,
					chat_participants(
						user_id,
						users(full_name, username, avatar_file_id)
					),
					chat_messages(
						message,
						created_at,
						sent_from
					)
				`
				)
				.in('id', conversationIds)
				.order('created_at', { foreignTable: 'chat_messages', ascending: false })
				.limit(1, { foreignTable: 'chat_messages' });

			if (chatError) throw chatError;

			chats = chatData || [];
		} catch (error) {
			console.error('Error loading chats:', error);
		} finally {
			isLoading = false;
		}
	}

	// Set up realtime subscription for chat updates
	function setupChatsSubscription() {
		if (!currentUserId || !data?.supabase) return;

		chatsWatcher = data.supabase
			.channel('user-chats')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'chat_conversations'
				},
				async () => {
					await loadUserChats();
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'chat_participants'
				},
				async (payload: any) => {
					if (payload.new.user_id === currentUserId) {
						await loadUserChats();
					}
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'DELETE',
					schema: 'public',
					table: 'chat_participants'
				},
				async (payload: any) => {
					if (payload.old.user_id === currentUserId) {
						await loadUserChats();
					}
				}
			)
			.subscribe();
	}

	// Select a chat and load its messages
	async function selectChat(chat: any) {
		selectedChat = chat;
		isChatListOpen = false; // Close sheet on mobile when chat is selected

		// Unsubscribe from previous messages channel
		messagesWatcher?.unsubscribe();

		// Load messages for selected chat
		await loadChatMessages(chat.id);

		// Set up realtime subscription for messages
		setupMessagesSubscription(chat.id);
	}

	// Load messages for a specific chat
	async function loadChatMessages(chatId: string) {
		if (!chatId || !data?.supabase) return;

		try {
			const { data: messageData, error } = await data.supabase
				.from('chat_messages')
				.select(
					`
					id,
					message,
					created_at,
					sent_from,
					users:sent_from(full_name, username, avatar_file_id)
				`
				)
				.eq('conversation_id', chatId)
				.order('created_at', { ascending: true });

			if (error) throw error;

			messages = messageData || [];
		} catch (error) {
			console.error('Error loading messages:', error);
		}
	}

	// Set up realtime subscription for messages
	function setupMessagesSubscription(chatId: string) {
		if (!chatId || !data?.supabase) return;

		messagesWatcher = data.supabase
			.channel(`conversation-${chatId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'chat_messages',
					filter: `conversation_id=eq.${chatId}`
				},
				(payload: any) => {
					// Add new message to the conversation
					messages = [...messages, payload.new];
				}
			)
			.subscribe();
	}

	// Create a new chat with a user
	async function createNewChat() {
		if (!newChatUserEmail.trim() || !currentUserId || !data?.supabase) return;

		isCreatingChat = true;
		try {
			// First, find the user by email
			const { data: userData, error: userError } = await data.supabase
				.from('users')
				.select('id')
				.eq('email', newChatUserEmail)
				.single();

			if (userError) throw userError;
			if (!userData) {
				throw new Error('User not found');
			}

			// Create new conversation
			const { data: conversation, error: convError } = await data.supabase
				.from('chat_conversations')
				.insert([{}])
				.select()
				.single();

			if (convError) throw convError;

			// Add participants
			const { error: partError } = await data.supabase.from('chat_participants').insert([
				{ conversation_id: conversation.id, user_id: currentUserId },
				{ conversation_id: conversation.id, user_id: userData.id }
			]);

			if (partError) throw partError;

			// Clear input and refresh chats
			newChatUserEmail = '';
			await loadUserChats();
		} catch (error) {
			console.error('Error creating chat:', error);
		} finally {
			isCreatingChat = false;
		}
	}

	// Handle new message sent
	function handleNewMessage(newMessage: any) {
		messages = [...messages, newMessage];
	}

	// Get other participant in a chat
	function getOtherParticipant(chat: any) {
		if (!chat?.chat_participants || !currentUserId) return null;

		return chat.chat_participants.find((participant: any) => participant.user_id !== currentUserId)
			?.users;
	}

	// Format time for display
	function formatTime(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<!-- Mobile view - show either chat list or chat view -->
<div class="flex h-full flex-col md:hidden">
	{#if selectedChat}
		<!-- Mobile chat view -->
		<div class="flex flex-1 flex-col">
			<CardHeader class="flex items-center justify-between border-b">
				{#if selectedChat}
					{@const otherParticipant = getOtherParticipant(selectedChat)}
					<div class="flex items-center gap-3">
						<Button variant="ghost" size="sm" onclick={() => (selectedChat = null)}>← Back</Button>
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<UserIcon class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="font-medium">
								{otherParticipant?.full_name || otherParticipant?.username || 'Unknown User'}
							</h3>
						</div>
					</div>
					<Sheet.Root bind:open={isChatListOpen}>
						<Sheet.Trigger>
							<Button variant="ghost" size="sm">Chats</Button>
						</Sheet.Trigger>
						<Sheet.Content side="left" class="w-4/5 p-0">
							<Sheet.Header class="border-b p-4">
								<Sheet.Title>Messages</Sheet.Title>
							</Sheet.Header>
							<!-- Chat list content here -->
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
												bind:value={newChatUserEmail}
												placeholder="Enter user email..."
												class="flex-1"
											/>
											<Button
												onclick={createNewChat}
												size="sm"
												disabled={!newChatUserEmail.trim() || isCreatingChat}
											>
												Create
											</Button>
										</div>
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
								</div>
							</div>
						</Sheet.Content>
					</Sheet.Root>
				{/if}
			</CardHeader>

			<CardContent class="flex-1 p-0">
				<MessageList
					initialMessages={messages}
					currentUserId={currentUserId || ''}
					currentUserAvatar={currentUserAvatar || ''}
					height="100%"
					class="p-4"
				/>
			</CardContent>

			<div class="border-t p-4">
				<MessageInput
					supabase={data?.supabase}
					conversationId={selectedChat.id}
					currentUserId={currentUserId || ''}
					on:messageSent={handleNewMessage}
				/>
			</div>
		</div>
	{:else}
		<!-- Mobile chat list view with sheet trigger -->
		<Sheet.Root bind:open={isChatListOpen}>
			<Sheet.Trigger>
				<div class="flex flex-1 flex-col">
					<CardHeader class="border-b">
						<div class="flex items-center justify-between">
							<CardTitle>Messages</CardTitle>
							<Button
								size="sm"
								variant="outline"
								onclick={() => (isCreatingChat = !isCreatingChat)}
							>
								<PlusIcon class="h-4 w-4" />
							</Button>
						</div>

						{#if isCreatingChat}
							<div class="mt-4 flex gap-2">
								<Input
									bind:value={newChatUserEmail}
									placeholder="Enter user email..."
									class="flex-1"
								/>
								<Button
									onclick={createNewChat}
									size="sm"
									disabled={!newChatUserEmail.trim() || isCreatingChat}
								>
									Create
								</Button>
							</div>
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
			</Sheet.Trigger>
			<Sheet.Content side="left" class="w-4/5 p-0">
				<Sheet.Header class="border-b p-4">
					<Sheet.Title>Messages</Sheet.Title>
				</Sheet.Header>
				<!-- Chat list content here -->
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
									bind:value={newChatUserEmail}
									placeholder="Enter user email..."
									class="flex-1"
								/>
								<Button
									onclick={createNewChat}
									size="sm"
									disabled={!newChatUserEmail.trim() || isCreatingChat}
								>
									Create
								</Button>
							</div>
						{/if}

						<div class="relative mt-4">
							<SearchIcon
								class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
							/>
							<Input bind:value={searchQuery} placeholder="Search conversations..." class="pl-10" />
						</div>
					</div>

					<div class="flex-1 overflow-y-auto">
						{#if isLoading}
							<div class="p-4 text-center text-muted-foreground">Loading conversations...</div>
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
					</div>
				</div>
			</Sheet.Content>
		</Sheet.Root>
	{/if}
</div>

<!-- Desktop view - show both chat list and chat view side by side -->
<div class="hidden h-full md:flex md:gap-6">
	<!-- Chat List Sidebar -->
	<div class="flex w-full flex-col rounded-lg border md:w-1/3">
		<CardHeader class="border-b">
			<div class="flex items-center justify-between">
				<CardTitle>Messages</CardTitle>
				<Button size="sm" variant="outline" onclick={() => (isCreatingChat = !isCreatingChat)}>
					<PlusIcon class="h-4 w-4" />
				</Button>
			</div>

			{#if isCreatingChat}
				<div class="mt-4 flex gap-2">
					<Input bind:value={newChatUserEmail} placeholder="Enter user email..." class="flex-1" />
					<Button
						onclick={createNewChat}
						size="sm"
						disabled={!newChatUserEmail.trim() || isCreatingChat}
					>
						Create
					</Button>
				</div>
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

	<!-- Chat Area -->
	<div class="flex flex-1 flex-col rounded-lg border">
		{#if selectedChat}
			<CardHeader class="border-b">
				{#if selectedChat}
					{@const otherParticipant = getOtherParticipant(selectedChat)}
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<UserIcon class="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 class="font-medium">
								{otherParticipant?.full_name || otherParticipant?.username || 'Unknown User'}
							</h3>
						</div>
					</div>
				{/if}
			</CardHeader>

			<CardContent class="flex-1 p-0">
				<MessageList
					initialMessages={messages}
					currentUserId={currentUserId || ''}
					currentUserAvatar={currentUserAvatar || ''}
					height="100%"
					class="p-4"
				/>
			</CardContent>

			<div class="border-t p-4">
				<MessageInput
					supabase={data?.supabase}
					conversationId={selectedChat.id}
					currentUserId={currentUserId || ''}
					on:messageSent={handleNewMessage}
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
