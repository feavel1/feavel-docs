<!-- Message.svelte -->
<script lang="ts">
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Card, CardContent } from '$lib/components/ui/card';

	export let message: any;
	export let isCurrentUser: boolean;
	export let avatarUrl: string;
</script>

<div class="flex gap-3 {isCurrentUser ? 'justify-end' : 'justify-start'}">
	{#if !isCurrentUser}
		<Avatar class="h-8 w-8">
			{#if avatarUrl}
				<AvatarImage src={avatarUrl} alt="User avatar" />
			{/if}
			<AvatarFallback>
				{message.sent_from?.username?.charAt(0) || 'U'}
			</AvatarFallback>
		</Avatar>
	{/if}

	<div class="flex flex-col {isCurrentUser ? 'items-end' : 'items-start'} max-w-2xl">
		<div class="mb-1 flex items-center gap-2 text-sm">
			<span class="font-medium">{message.sent_from?.username || 'Unknown User'}</span>
			<span class="text-xs text-gray-500">
				{new Date(message.created_at).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit'
				})}
			</span>
		</div>

		<Card
			class={isCurrentUser
				? 'rounded-br-none border-blue-600 bg-blue-600 text-white'
				: 'rounded-bl-none border bg-white/50'}
		>
			<CardContent class="p-3">
				<p class="whitespace-pre-wrap">{message.message}</p>
			</CardContent>
		</Card>
	</div>

	{#if isCurrentUser}
		<Avatar class="h-8 w-8">
			{#if avatarUrl}
				<AvatarImage src={avatarUrl} alt="User avatar" />
			{/if}
			<AvatarFallback>
				{message.sent_from?.username?.charAt(0) || 'U'}
			</AvatarFallback>
		</Avatar>
	{/if}
</div>
