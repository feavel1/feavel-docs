<script lang="ts">
	import MessageList from '$lib/components/modules/chat/MessageList.svelte';
	import MessageInput from '$lib/components/modules/chat/MessageInput.svelte';
	import ConversationList from '$lib/components/modules/chat/ConversationList.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import type { Tables } from '$lib/types/database.types';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import XIcon from '@lucide/svelte/icons/x';

	// Props from parent layout
	let { data } = $props();
	let { session, supabase } = data;

	// Ensure session exists
	if (!session) {
		throw new Error('User must be logged in to view messages');
	}

	// State management
	let conversations = $state<Tables<'chat_conversations'>[]>([
		{
			id: 'dummy-conversation-1',
			created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
		},
		{
			id: 'dummy-conversation-2',
			created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
		}
	]);

	let currentConversationId = $state<string | null>('dummy-conversation-1');
	let initialMessages = $state([
		{
			id: 1,
			message: 'Hello there! How are you doing today?',
			created_at: new Date(Date.now() - 3600000).toISOString(),
			sent_from: 'user2',
			sent_from_avatar_url: null,
			sent_from_username: 'John Doe'
		},
		{
			id: 41,
			message: 'Hello there! How are you doing today?',
			created_at: new Date(Date.now() - 3600000).toISOString(),
			sent_from: 'user2',
			sent_from_avatar_url: null,
			sent_from_username: 'John Doe'
		},
		{
			id: 12,
			message: 'Hello there! How are you doing today?',
			created_at: new Date(Date.now() - 3600000).toISOString(),
			sent_from: 'user2',
			sent_from_avatar_url: null,
			sent_from_username: 'John Doe'
		},
		{
			id: 124,
			message: 'Hello there! How are you doing today?',
			created_at: new Date(Date.now() - 3600000).toISOString(),
			sent_from: 'user2',
			sent_from_avatar_url: null,
			sent_from_username: 'John Doe'
		},
		{
			id: 2,
			message: "I'm doing great! Just working on some new features for our app.",
			created_at: new Date(Date.now() - 3500000).toISOString(),
			sent_from: session.user.id,
			sent_from_avatar_url: null,
			sent_from_username: 'You'
		},
		{
			id: 3,
			message: 'That sounds exciting! What kind of features?',
			created_at: new Date(Date.now() - 3400000).toISOString(),
			sent_from: 'user2',
			sent_from_avatar_url: null,
			sent_from_username: 'John Doe'
		},
		{
			id: 4,
			message:
				"I'm working on a responsive chat UI component. It needs to work well on both mobile and desktop.",
			created_at: new Date(Date.now() - 3300000).toISOString(),
			sent_from: session.user.id,
			sent_from_avatar_url: null,
			sent_from_username: 'You'
		},
		{
			id: 124,
			message: 'Hello there! How are you doing today?',
			created_at: new Date(Date.now() - 3600000).toISOString(),
			sent_from: 'user2',
			sent_from_avatar_url: null,
			sent_from_username: 'John Doe'
		},
		{
			id: 2,
			message: "I'm doing great! Just working on some new features for our app.",
			created_at: new Date(Date.now() - 3500000).toISOString(),
			sent_from: session.user.id,
			sent_from_avatar_url: null,
			sent_from_username: 'You'
		},
		{
			id: 3,
			message: 'That sounds exciting! What kind of features?',
			created_at: new Date(Date.now() - 3400000).toISOString(),
			sent_from: 'user2',
			sent_from_avatar_url: null,
			sent_from_username: 'John Doe'
		},
		{
			id: 4,
			message:
				"I'm working on a responsive chat UI component. It needs to work well on both mobile and desktop.",
			created_at: new Date(Date.now() - 3300000).toISOString(),
			sent_from: session.user.id,
			sent_from_avatar_url: null,
			sent_from_username: 'You'
		}
	]);

	let currentUserId = $state(session.user.id);
	let currentUserAvatar = $state<string | null>(null);
	let showConversationList = $state(false);

	const handleNewMessage = (event: CustomEvent<any>) => {
		const newMessage = event.detail;
		initialMessages = [
			...initialMessages,
			{
				...newMessage,
				sent_from_username: 'You'
			}
		];
	};

	const selectConversation = (conversationId: string) => {
		currentConversationId = conversationId;
		// In a real implementation, you would fetch messages for this conversation
		// For this demo, we'll just use the same messages
		showConversationList = false; // Hide conversation list on mobile after selection
	};

	const createNewConversation = () => {
		const newConversationId = `dummy-conversation-${Date.now()}`;
		const newConversation = {
			id: newConversationId,
			created_at: new Date().toISOString()
		};

		conversations = [newConversation, ...conversations];
		currentConversationId = newConversationId;
		initialMessages = [];
		showConversationList = false; // Hide conversation list on mobile after creation
	};

	onMount(() => {
		// Scroll to bottom of message list
		const scrollArea = document.querySelector('[data-scroll-area]');
		if (scrollArea) {
			scrollArea.scrollTop = scrollArea.scrollHeight;
		}
	});
</script>

<div class="flex flex-row items-center justify-between border-b">
	<Button
		variant="ghost"
		size="icon"
		onclick={() => (showConversationList = !showConversationList)}
		class="md:hidden"
	>
		{#if showConversationList}
			<XIcon class="h-4 w-4" />
		{:else}
			<MenuIcon class="h-4 w-4" />
		{/if}
	</Button>
	<div class="text-lg">Messages</div>
</div>

<div class="flex h-[500px] w-full flex-row">
	<!-- Conversation List (toggle visibility on mobile) -->
	<div
		class="absolute z-10 w-full border-r bg-background md:relative md:z-auto md:block md:w-1/3 lg:w-1/4 {showConversationList
			? 'block'
			: 'hidden'}"
	>
		<ConversationList
			{conversations}
			{currentConversationId}
			onConversationSelect={selectConversation}
			onCreateNewConversation={createNewConversation}
		/>
	</div>

	<!-- Main Chat Area -->
	<div class="flex w-full flex-col">
		{#if currentConversationId}
			<MessageList
				{initialMessages}
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
					<Button onclick={createNewConversation} class="mt-4">Start New Conversation</Button>
				</div>
			</div>
		{/if}
	</div>
</div>
