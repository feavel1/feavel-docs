<script lang="ts">
	import { CardContent } from '$lib/components/ui/card';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import PlusIcon from '@lucide/svelte/icons/plus';

	// RLS POLICY: chat_conversations table needs appropriate access controls
	let {
		conversations = [],
		currentConversationId = null,
		onConversationSelect,
		onCreateNewConversation
	} = $props();

	// Get display name for conversation (simplified for 1-on-1 chats)
	function getConversationName() {
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
					{@const name = getConversationName()}

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
									{conversation.id?.slice(0, 2).toUpperCase() || 'C'}
								</AvatarFallback>
							</Avatar>
							<div class="ml-2 flex-1 overflow-hidden">
								<div class="flex items-center justify-between">
									<h3 class="truncate text-sm font-medium">
										{name}
									</h3>
									<span class="text-[10px] text-gray-500">
										{new Date(conversation.created_at).toLocaleDateString()}
									</span>
								</div>
								<p class="truncate text-[10px] text-gray-500">
									{conversation.id}
								</p>
							</div>
						</CardContent>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
