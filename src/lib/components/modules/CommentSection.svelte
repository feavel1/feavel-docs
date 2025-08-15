<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { MessageSquare, Loader2, ChevronDown } from '@lucide/svelte';
	import {
		getComments,
		createComment,
		updateComment,
		deleteComment,
		getCommentReplies
	} from '$lib/utils/comments';
	import type { PostComment, CommentFormData } from '$lib/types/comments';
	import CommentForm from './CommentForm.svelte';
	import CommentItem from './CommentItem.svelte';

	let { postId, postAuthorId, currentUserId, currentUser, supabase } = $props();

	const COMMENT_LIMIT = 10;
	
	let comments = $state<PostComment[]>([]);
	let loading = $state(false);
	let loadingMore = $state(false);
	let hasMore = $state(true);
	let currentPage = $state(1);
	let replyingTo = $state<number | null>(null);
	let expandedComments = $state(new Set<number>());
	let hasLoaded = $state(false);

	// Load initial comments
	$effect(() => {
		if (postId && !hasLoaded) {
			hasLoaded = true;
			loadComments();
		}
	});

	async function loadComments(page = 1) {
		if (loading || !postId) return;

		loading = true;
		try {
			const newComments = await getComments(supabase, postId, page);

			if (page === 1) {
				comments = newComments;
			} else {
				comments = [...comments, ...newComments];
			}

			hasMore = newComments.length === COMMENT_LIMIT;
			currentPage = page;
		} catch (error) {
			console.error('Error loading comments:', error);
		} finally {
			loading = false;
		}
	}

	async function loadMoreComments() {
		if (loadingMore || !hasMore) return;

		loadingMore = true;
		try {
			const newComments = await getComments(supabase, postId, currentPage + 1);
			comments = [...comments, ...newComments];
			hasMore = newComments.length === COMMENT_LIMIT;
			currentPage++;
		} catch (error) {
			console.error('Error loading more comments:', error);
		} finally {
			loadingMore = false;
		}
	}

	async function handleSubmitComment(commentData: CommentFormData) {
		if (!currentUserId) return;

		const newComment = await createComment(supabase, postId, currentUserId, commentData);
		if (newComment) {
			// Add to the beginning of the list
			comments = [newComment, ...comments];

			// If this is a reply, expand the parent comment
			if (commentData.parent_id) {
				expandedComments.add(commentData.parent_id);
			}
		}
	}

	async function handleEditComment(commentId: number, content: string) {
		const updatedComment = await updateComment(supabase, commentId, content);
		if (updatedComment) {
			comments = comments.map((comment) => (comment.id === commentId ? updatedComment : comment));
		}
	}

	async function handleDeleteComment(commentId: number) {
		const success = await deleteComment(supabase, commentId);
		if (success) {
			comments = comments.filter((comment) => comment.id !== commentId);
		}
	}

	function handleReply(commentId: number) {
		replyingTo = commentId;
		expandedComments.add(commentId);
	}

	async function toggleReplies(commentId: number) {
		if (expandedComments.has(commentId)) {
			expandedComments.delete(commentId);
		} else {
			expandedComments.add(commentId);
			// Load replies if not already loaded
			const comment = comments.find((c) => c.id === commentId);
			if (comment && !comment.replies) {
				const replies = await getCommentReplies(supabase, commentId);
				comments = comments.map((c) => (c.id === commentId ? { ...c, replies } : c));
			}
		}
	}
</script>

<Card class="mt-8">
	<CardHeader>
		<CardTitle class="flex items-center gap-2">
			<MessageSquare class="h-5 w-5" />
			Comments ({comments.length})
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-6">
		{#if currentUserId}
			<CommentForm
				parentId={undefined}
				onSubmit={handleSubmitComment}
				user={currentUser}
				placeholder="Share your thoughts..."
			/>
		{:else}
			<div class="py-4 text-center text-muted-foreground">
				<p>Please log in to leave a comment.</p>
			</div>
		{/if}

		{#if loading && comments.length === 0}
			<div class="flex justify-center py-8">
				<Loader2 class="h-6 w-6 animate-spin" />
			</div>
		{:else if comments.length === 0}
			<div class="py-8 text-center text-muted-foreground">
				<MessageSquare class="mx-auto mb-4 h-12 w-12 opacity-50" />
				<p>No comments yet. Be the first to share your thoughts!</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each comments as comment (comment.id)}
					<div class="space-y-4">
						<CommentItem
							{comment}
							{currentUserId}
							{postAuthorId}
							onReply={handleReply}
							onEdit={handleEditComment}
							onDelete={handleDeleteComment}
							showReplies={expandedComments.has(comment.id)}
						/>

						{#if comment._reply_count && comment._reply_count > 0}
							<Button
								variant="ghost"
								size="sm"
								onclick={() => toggleReplies(comment.id)}
								class="ml-11 text-xs"
							>
								<ChevronDown class="mr-1 h-3 w-3" />
								{expandedComments.has(comment.id) ? 'Hide' : 'Show'}
								{comment._reply_count}
								{comment._reply_count === 1 ? 'reply' : 'replies'}
							</Button>
						{/if}

						{#if replyingTo === comment.id}
							<div class="ml-11">
								<CommentForm
									parentId={comment.id}
									onSubmit={handleSubmitComment}
									user={currentUser}
									placeholder="Write a reply..."
									buttonText="Reply"
								/>
							</div>
						{/if}
					</div>
				{/each}

				{#if hasMore}
					<div class="flex justify-center pt-4">
						<Button variant="outline" onclick={loadMoreComments} disabled={loadingMore}>
							{#if loadingMore}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							{/if}
							Load More Comments
						</Button>
					</div>
				{/if}
			</div>
		{/if}
	</CardContent>
</Card>
