<script lang="ts">
	import { CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import type { Tables } from '$lib/types/database.types';

	export let conversations: Tables<'chat_conversations'>[] = [];
	export let currentConversationId: string | null = null;
	export let onConversationSelect: (conversationId: string) => void;
	export let onCreateNewConversation: () => void;
</script>

<div class="flex h-[500px] flex-col">
	<div class="flex items-center justify-between border-b p-2">
		<h2 class="px-2 text-sm font-semibold">Conversations</h2>
		<Button onclick={onCreateNewConversation} variant="outline" size="sm" class="h-6 px-2 text-xs">
			New
		</Button>
	</div>

	<div class="">
		{#if conversations.length === 0}
			<div class="p-3 text-center text-xs text-gray-500">
				No conversations yet. Start a new chat!
			</div>
		{:else}
			<div class="flex flex-col gap-2">
				{#each conversations as conversation}
					<button
						class="w-full cursor-pointer rounded-sm text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 {currentConversationId ===
						conversation.id
							? 'border-blue-500 bg-gray-100 dark:bg-gray-800'
							: ''}"
						onclick={() => onConversationSelect(conversation.id)}
					>
						<CardContent class="flex items-center p-2">
							<Avatar class="h-6 w-6">
								<AvatarFallback class="text-xs">
									{conversation.id?.slice(0, 2).toUpperCase() || 'C'}
								</AvatarFallback>
							</Avatar>
							<div class="ml-2 flex-1 overflow-hidden">
								<div class="flex items-center justify-between">
									<h3 class="truncate text-xs font-medium">Conversation</h3>
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
