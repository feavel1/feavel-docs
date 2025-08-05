<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Reply, Edit, Trash2, Calendar, MoreHorizontal, MessageSquare } from '@lucide/svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import Self from './CommentItem.svelte';

	let {
		comment,
		currentUserId,
		postAuthorId,
		onReply,
		onEdit,
		onDelete,
		showReplies = false
	} = $props();

	let isEditing = $state(false);
	let editContent = $state(comment.content);
	let isSubmitting = $state(false);

	const canEdit = $derived(currentUserId === comment.user_id);
	const canDelete = $derived(currentUserId === comment.user_id || currentUserId === postAuthorId);
	const canReply = $derived(!!currentUserId);

	async function handleEdit() {
		if (!editContent.trim() || isSubmitting) return;

		isSubmitting = true;
		try {
			await onEdit(comment.id, editContent.trim());
			isEditing = false;
		} catch (error) {
			console.error('Error editing comment:', error);
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDelete() {
		if (isSubmitting) return;

		isSubmitting = true;
		try {
			await onDelete(comment.id);
		} catch (error) {
			console.error('Error deleting comment:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancelEdit() {
		isEditing = false;
		editContent = comment.content;
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			return 'Just now';
		} else if (diffInHours < 24) {
			const hours = Math.floor(diffInHours);
			return `${hours}h ago`;
		} else if (diffInHours < 168) {
			const days = Math.floor(diffInHours / 24);
			return `${days}d ago`;
		} else {
			return date.toLocaleDateString();
		}
	}
</script>

<div class="flex gap-3">
	<Avatar class="h-8 w-8 flex-shrink-0">
		<AvatarImage src={comment.users?.avatar_url} alt={comment.users?.username} />
		<AvatarFallback>
			{comment.users?.username?.charAt(0)?.toUpperCase() || 'U'}
		</AvatarFallback>
	</Avatar>

	<div class="flex-1 space-y-2">
		<div class="flex items-start justify-between">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium">
					{comment.users?.username || 'Unknown'}
				</span>
				{#if comment.user_id === postAuthorId}
					<span class="text-xs text-muted-foreground">Author</span>
				{/if}
				<span class="flex items-center gap-1 text-xs text-muted-foreground">
					<Calendar class="h-3 w-3" />
					{formatDate(comment.created_at)}
				</span>
			</div>

			{#if (canEdit || canDelete) && !isEditing}
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button variant="ghost" size="sm" class="h-6 w-6 p-0">
							<MoreHorizontal class="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{#if canEdit}
							<DropdownMenuItem onclick={() => (isEditing = true)}>
								<Edit class="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
						{/if}
						{#if canDelete}
							<DropdownMenuItem onclick={handleDelete} class="text-destructive">
								<Trash2 class="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						{/if}
					</DropdownMenuContent>
				</DropdownMenu>
			{/if}
		</div>

		{#if isEditing}
			<div class="space-y-2">
				<textarea
					bind:value={editContent}
					class="min-h-[80px] w-full resize-none rounded-md border p-2"
					placeholder="Edit your comment..."
					disabled={isSubmitting}
				></textarea>
				<div class="flex gap-2">
					<Button size="sm" onclick={handleEdit} disabled={!editContent.trim() || isSubmitting}>
						Save
					</Button>
					<Button variant="ghost" size="sm" onclick={handleCancelEdit} disabled={isSubmitting}>
						Cancel
					</Button>
				</div>
			</div>
		{:else}
			<div class="prose prose-sm max-w-none">
				<p class="whitespace-pre-wrap">{comment.content}</p>
			</div>
		{/if}

		<div class="flex items-center gap-4 text-xs text-muted-foreground">
			{#if canReply}
				<Button
					variant="ghost"
					size="sm"
					onclick={() => onReply(comment.id)}
					class="h-auto p-0 text-xs"
				>
					<Reply class="mr-1 h-3 w-3" />
					Reply
				</Button>
			{/if}

			{#if comment._reply_count && comment._reply_count > 0}
				<div class="flex items-center gap-1">
					<MessageSquare class="h-3 w-3" />
					{comment._reply_count}
					{comment._reply_count === 1 ? 'reply' : 'replies'}
				</div>
			{/if}
		</div>

		{#if showReplies && comment.replies && comment.replies.length > 0}
			<div class="mt-4 ml-6 space-y-4 border-l-2 border-muted pl-4">
				{#each comment.replies as reply (reply.id)}
					<Self comment={reply} {currentUserId} {postAuthorId} {onReply} {onEdit} {onDelete} />
				{/each}
			</div>
		{/if}
	</div>
</div>
