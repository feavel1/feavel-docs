<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Reply, Edit, Trash2, Calendar, MoreHorizontal } from '@lucide/svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { getAvatarUrl } from '$lib/utils/user';
	import Self from './CommentItem.svelte';
	import CommentForm from './CommentForm.svelte';
	import type { CommentFormData } from '$lib/utils/comments';

	let {
		comment,
		currentUserId,
		postAuthorId,
		onReply,
		onEdit,
		onDelete,
		onToggleReplies,
		showReplies = false,
		expandedComments,
		supabase,
		currentUser
	} = $props();

	let isEditing = $state(false);
	let editContent = $state(comment.content);
	let isSubmitting = $state(false);
	let isReplying = $state(false); // Track if we're replying to this specific comment

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

	function handleReplyClick() {
		isReplying = true;
	}

	function handleCancelReply() {
		isReplying = false;
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

<div class="flex gap-3 py-2">
	<div class="flex-shrink-0">
		<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
			<img
				class="h-8 w-8 rounded-full object-cover"
				src={getAvatarUrl(comment.users?.avatar_url, comment.users?.username, supabase)}
				alt={comment.users?.full_name || comment.users?.username}
				onerror={(e) => {
					const target = e.target as HTMLImageElement;
					target.style.display = 'none';
					const fallback = target.nextElementSibling as HTMLElement;
					if (fallback) {
						fallback.style.display = 'flex';
					} else {
						// If no fallback element, show the parent container
						target.parentElement!.style.backgroundColor = '#d1d5db'; // gray-300
					}
				}}
			/>
			<span class="text-sm font-medium text-gray-700" style="display: none;">
				{(comment.users?.full_name ?? comment.users?.username ?? '').charAt(0).toUpperCase()}
			</span>
		</div>
	</div>

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

			<div class="flex items-center gap-1">
				{#if canReply}
					<Button
						variant="ghost"
						size="sm"
						onclick={handleReplyClick}
						class="h-6 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
					>
						<Reply class="mr-1 h-3 w-3" />
						Reply
					</Button>
				{/if}

				{#if comment._reply_count && comment._reply_count > 0}
					<Button
						variant="ghost"
						size="sm"
						onclick={() => onToggleReplies(comment.id)}
						class="h-6 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
					>
						{expandedComments?.has(comment.id) ? 'Hide Replies' : 'Show Replies'} ({comment._reply_count})
					</Button>
				{/if}

				{#if (canEdit || canDelete) && !isEditing}
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button variant="ghost" size="icon" class="h-6 w-6 p-0">
								<MoreHorizontal class="h-3 w-3" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{#if canEdit}
								<DropdownMenuItem onclick={() => (isEditing = true)} class="text-xs">
									<Edit class="mr-2 h-3 w-3" />
									Edit
								</DropdownMenuItem>
							{/if}
							{#if canDelete}
								<DropdownMenuItem onclick={handleDelete} class="text-xs text-destructive">
									<Trash2 class="mr-2 h-3 w-3" />
									Delete
								</DropdownMenuItem>
							{/if}
						</DropdownMenuContent>
					</DropdownMenu>
				{/if}
			</div>
		</div>

		{#if isEditing}
			<div class="space-y-2">
				<textarea
					bind:value={editContent}
					class="min-h-[60px] w-full resize-none rounded-md border p-2 text-sm"
					placeholder="Edit your comment..."
					disabled={isSubmitting}
				></textarea>
				<div class="flex gap-2">
					<Button
						size="sm"
						onclick={handleEdit}
						disabled={!editContent.trim() || isSubmitting}
						class="h-7 text-xs"
					>
						Save
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onclick={handleCancelEdit}
						disabled={isSubmitting}
						class="h-7 text-xs"
					>
						Cancel
					</Button>
				</div>
			</div>
		{:else}
			<div class="text-sm">
				<p class="whitespace-pre-wrap">{comment.content}</p>
			</div>
		{/if}

		{#if isReplying}
			<div class="mt-3 ml-6 border-l-2 border-muted pl-4">
				<CommentForm
					parentId={comment.id}
					onSubmit={async (data: CommentFormData) => {
						// Call the parent's onSubmit handler with the proper data
						const result = await onReply(data);
						// Close the reply form after successful submission
						isReplying = false;
						return result;
					}}
					user={currentUser}
					placeholder="Write a reply..."
					buttonText="Reply"
				/>
				<Button variant="ghost" size="sm" onclick={handleCancelReply} class="mt-2 text-xs"
					>Cancel</Button
				>
			</div>
		{/if}

		{#if showReplies && comment.replies && comment.replies.length > 0}
			<div class="mt-3 ml-6 space-y-4 border-l-2 border-muted pl-4">
				{#each comment.replies as reply (reply.id)}
					<Self
						comment={reply}
						{currentUserId}
						{postAuthorId}
						{supabase}
						{currentUser}
						{onReply}
						{onEdit}
						{onDelete}
						{onToggleReplies}
						showReplies={expandedComments.has(reply.id)}
						{expandedComments}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>
