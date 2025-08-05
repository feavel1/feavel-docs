<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Send, Loader2 } from '@lucide/svelte';

	let {
		parentId,
		onSubmit,
		user,
		placeholder = 'Write a comment...',
		buttonText = 'Comment'
	} = $props();

	let content = $state('');
	let isSubmitting = $state(false);

	async function handleSubmit() {
		if (!content.trim() || isSubmitting) return;

		isSubmitting = true;
		try {
			await onSubmit({
				content: content.trim(),
				parent_id: parentId
			});
			content = '';
		} catch (error) {
			console.error('Error submitting comment:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			handleSubmit();
		}
	}
</script>

<div class="flex gap-3">
	<Avatar class="h-8 w-8 flex-shrink-0">
		<AvatarImage src={user?.avatar_url} alt={user?.username} />
		<AvatarFallback>
			{user?.username?.charAt(0)?.toUpperCase() || 'U'}
		</AvatarFallback>
	</Avatar>

	<div class="flex-1 space-y-2">
		<Textarea
			bind:value={content}
			{placeholder}
			class="min-h-[80px] resize-none"
			onkeydown={handleKeyDown}
			disabled={isSubmitting}
		/>
		<div class="flex items-center justify-between">
			<p class="text-xs text-muted-foreground">Press Cmd+Enter to submit</p>
			<Button onclick={handleSubmit} disabled={!content.trim() || isSubmitting} size="sm">
				{#if isSubmitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{:else}
					<Send class="mr-2 h-4 w-4" />
				{/if}
				{buttonText}
			</Button>
		</div>
	</div>
</div>
