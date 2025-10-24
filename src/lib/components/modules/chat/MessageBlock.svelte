<!-- Message.svelte -->
<script lang="ts">
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { CardContent } from '$lib/components/ui/card';

	export let message: any;
	export let isCurrentUser: boolean;
	export let avatarUrl: string;
</script>

<div class="flex gap-1 {isCurrentUser ? 'justify-end' : 'justify-start'}">
	{#if !isCurrentUser}
		<Avatar class="h-6 w-6 shrink-0">
			{#if avatarUrl}
				<AvatarImage src={avatarUrl} alt="User avatar" />
			{/if}
			<AvatarFallback class="text-xs">
				{message.sent_from?.username?.charAt(0) || 'U'}
			</AvatarFallback>
		</Avatar>
	{/if}

	<div
		class="flex flex-col {isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%] sm:max-w-[80%]"
	>
		<div class="mb-0.5 flex items-center gap-1 text-[10px]">
			<span class="font-medium">{message.sent_from?.username || 'Unknown User'}</span>
			<span class="text-[8px] text-gray-500">
				{new Date(message.created_at).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit'
				})}
			</span>
		</div>

		<div
			class={isCurrentUser
				? 'rounded-br-none rounded-bl-sm border-blue-600 bg-blue-600 text-xs text-white'
				: 'rounded-br-sm rounded-bl-none border bg-white/50 text-xs'}
		>
			<CardContent class="p-1.5">
				<!-- SANITIZATION: Sanitize message content to prevent XSS -->
				<p class="whitespace-pre-wrap">{message.message}</p>
			</CardContent>
		</div>
	</div>

	{#if isCurrentUser}
		<Avatar class="h-6 w-6 shrink-0">
			{#if avatarUrl}
				<AvatarImage src={avatarUrl} alt="User avatar" />
			{/if}
			<AvatarFallback class="text-xs">
				{message.sent_from?.username?.charAt(0) || 'U'}
			</AvatarFallback>
		</Avatar>
	{/if}
</div>
