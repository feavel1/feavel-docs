<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { MessageSquare, Loader2, ChevronDown, Eye, EyeOff } from '@lucide/svelte';
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
	let expandedComments = $state(new Set<number>());
	let hasLoaded = $state(false);
	let commentsVisible = $state(true);

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
			if (commentData.parent_id) {
				// This is a reply, add it to the parent comment's replies
				comments = updateCommentReplies(comments, commentData.parent_id, newComment);
				// Expand the parent comment to show the new reply
				expandedComments.add(commentData.parent_id);
			} else {
				// This is a top-level comment, add it to the beginning of the list
				comments = [newComment, ...comments];
			}
		}
		
		// Reply form is handled by CommentItem component
		
		return newComment;
	}

	// Helper function to recursively update replies in nested comments
	function updateCommentReplies(commentsList: PostComment[], parentId: number, newReply: PostComment): PostComment[] {
		return commentsList.map((comment) => {
			if (comment.id === parentId) {
				// Found the parent comment, add the reply
				const updatedReplies = comment.replies ? [...comment.replies, newReply] : [newReply];
				// Update the cache as well
				if (repliesCache.has(comment.id)) {
					repliesCache.set(comment.id, updatedReplies);
				}
				return {
					...comment,
					replies: updatedReplies,
					_reply_count: (comment._reply_count || 0) + 1
				};
			} else if (comment.replies && comment.replies.length > 0) {
				// Check nested replies
				const updatedReplies = updateCommentReplies(comment.replies, parentId, newReply);
				if (updatedReplies !== comment.replies) {
					// Replies were updated, update this comment
					return {
						...comment,
						replies: updatedReplies
					};
				}
			}
			return comment;
		});
	}

	async function handleEditComment(commentId: number, content: string) {
		const updatedComment = await updateComment(supabase, commentId, content);
		if (updatedComment) {
			// Update in main comments list
			comments = comments.map((comment) => {
				// Check if this is a top-level comment
				if (comment.id === commentId) {
					return updatedComment;
				}
				// Check if this is a reply in any comment's replies
				if (comment.replies) {
					const updatedReplies = comment.replies.map((reply) => 
						reply.id === commentId ? updatedComment : reply
					);
					// Update cache if needed
					if (repliesCache.has(comment.id)) {
						repliesCache.set(comment.id, updatedReplies);
					}
					return {
						...comment,
						replies: updatedReplies
					};
				}
				return comment;
			});
		}
	}

	async function handleDeleteComment(commentId: number) {
		const success = await deleteComment(supabase, commentId);
		if (success) {
			// Remove from main comments list and update replies in nested comments
			comments = comments.map((comment) => {
				// If this is a top-level comment being deleted
				if (comment.id === commentId) {
					// Remove from cache if present
					repliesCache.delete(commentId);
					return null; // Will be filtered out
				}
				// If this comment has replies, check if any reply is being deleted
				if (comment.replies) {
					const filteredReplies = comment.replies.filter((reply) => reply.id !== commentId);
					// Update cache if needed
					if (repliesCache.has(comment.id)) {
						repliesCache.set(comment.id, filteredReplies);
					}
					// Update reply count
					return {
						...comment,
						replies: filteredReplies,
						_reply_count: filteredReplies.length
					};
				}
				return comment;
			}).filter((comment) => comment !== null) as PostComment[];
		}
	}

	// Removed unused handleReply function

	function toggleCommentsVisibility() {
		commentsVisible = !commentsVisible;
	}

	// Cache for replies to avoid re-fetching when expanding/collapsing
	let repliesCache = $state(new Map<number, PostComment[]>());

	async function toggleReplies(commentId: number) {
		if (expandedComments.has(commentId)) {
			// Just collapse, keep replies in cache
			expandedComments.delete(commentId);
		} else {
			expandedComments.add(commentId);
			// Load replies if not already loaded or cached
			const comment = comments.find((c) => c.id === commentId);
			if (comment) {
				// Check if we have cached replies
				if (repliesCache.has(commentId)) {
					// Use cached replies
					const cachedReplies = repliesCache.get(commentId);
					comments = comments.map((c) => 
						c.id === commentId ? { ...c, replies: cachedReplies } : c
					);
				} else if (!comment.replies) {
					// Fetch replies if not cached and not already loaded
					const replies = await getCommentReplies(supabase, commentId);
					// Cache the replies
					repliesCache.set(commentId, replies);
					comments = comments.map((c) => (c.id === commentId ? { ...c, replies } : c));
				}
			}
		}
	}
</script>

<Card class="mt-8">
	<CardHeader>
		<div class="flex items-center justify-between">
			<CardTitle class="flex items-center gap-2">
				<MessageSquare class="h-5 w-5" />
				Comments ({comments.length})
			</CardTitle>
			<Button variant="ghost" size="sm" onclick={toggleCommentsVisibility} class="ml-2">
				{#if commentsVisible}
					<EyeOff class="h-4 w-4" />
					<span class="ml-1">Hide</span>
				{:else}
					<Eye class="h-4 w-4" />
					<span class="ml-1">Show</span>
				{/if}
			</Button>
		</div>
	</CardHeader>
	<CardContent class="space-y-6">
		{#if commentsVisible}
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
							{supabase}
							{currentUser}
							onReply={handleSubmitComment}
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
		{/if}
	</CardContent>
</Card>
