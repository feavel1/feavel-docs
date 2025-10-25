<script lang="ts">
	import { CardContent } from '$lib/components/ui/card';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { ChatConversation, ChatGroup } from '$lib/utils/chatUtils';

	// RLS POLICY: chat_conversations table needs appropriate access controls
	let {
		conversations = [],
		currentConversationId = null,
		onConversationSelect,
		onCreateNewConversation,
		onJoinGroup
	} = $props();

	// Get group info for a conversation
	function getGroupInfo(conversation: ChatConversation & { chat_groups?: ChatGroup[] }) {
		return conversation.chat_groups && conversation.chat_groups.length > 0
			? conversation.chat_groups[0]
			: null;
	}

	// Check if conversation is a group chat
	function isGroupChat(conversation: ChatConversation & { chat_groups?: ChatGroup[] }) {
		return getGroupInfo(conversation) !== null;
	}

	// Get display name for conversation
	function getConversationName(conversation: ChatConversation & { chat_groups?: ChatGroup[] }) {
		const group = getGroupInfo(conversation);
		if (group) {
			return group.name || 'Group Chat';
		}
		return 'Conversation';
	}
</script>

<div class="flex h-full flex-col">
	<div class="p-2">
		<Button onclick={onCreateNewConversation} variant="outline" size="sm" class="w-full">
			<PlusIcon class="mr-2 h-4 w-4" />
			New Chat
		</Button>
	</div>

	<div class="flex-1 overflow-y-auto">
		{#if conversations.length === 0}
			<div class="p-3 text-center text-xs text-gray-500">
				No conversations yet. Start a new chat!
			</div>
		{:else}
			<div class="flex flex-col gap-1 px-2">
				{#each conversations as conversation}
					{@const group = getGroupInfo(conversation)}
					{@const isGroup = isGroupChat(conversation)}
					{@const name = getConversationName(conversation)}

					<button
						class="w-full cursor-pointer rounded-sm text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 {currentConversationId ===
						conversation.id
							? 'border-blue-500 bg-gray-100 dark:bg-gray-800'
							: ''}"
						onclick={() => onConversationSelect(conversation.id)}
					>
						<CardContent class="flex items-center p-2">
							<Avatar class="h-8 w-8">
								<AvatarFallback class="text-xs">
									{isGroup
										? group?.name?.slice(0, 2).toUpperCase() || 'GC'
										: conversation.id?.slice(0, 2).toUpperCase() || 'C'}
								</AvatarFallback>
							</Avatar>
							<div class="ml-2 flex-1 overflow-hidden">
								<div class="flex items-center justify-between">
									<h3 class="truncate text-sm font-medium">
										{name}
										{#if isGroup && group?.is_public}
											<span class="ml-1 rounded bg-blue-100 px-1 py-0.5 text-[8px] text-blue-800"
												>Public</span
											>
										{/if}
									</h3>
									<span class="text-[10px] text-gray-500">
										{new Date(conversation.created_at).toLocaleDateString()}
									</span>
								</div>
								{#if isGroup && group?.description}
									<p class="truncate text-[10px] text-gray-500">
										{group.description}
									</p>
								{:else}
									<p class="truncate text-[10px] text-gray-500">
										{conversation.id}
									</p>
								{/if}
							</div>

							{#if isGroup && group && !group.is_public && onJoinGroup}
								<Button
									onclick={(e) => {
										e.stopPropagation();
										onJoinGroup(conversation.id);
									}}
									variant="outline"
									size="sm"
									class="ml-2 h-6 px-2 text-xs"
								>
									Join
								</Button>
							{/if}
						</CardContent>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
