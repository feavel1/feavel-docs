<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { MessageSquare, Loader2, Eye, EyeOff } from '@lucide/svelte';
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

	// Helper function to recursively find a comment by ID
	function findCommentById(commentsList: PostComment[], id: number): PostComment | null {
		for (const comment of commentsList) {
			if (comment.id === id) {
				return comment;
			}
			if (comment.replies && comment.replies.length > 0) {
				const found = findCommentById(comment.replies, id);
				if (found) {
					return found;
				}
			}
		}
		return null;
	}

	// Helper function to recursively update a specific comment with new replies
	function updateCommentWithReplies(commentsList: PostComment[], targetId: number, updatedComment: PostComment): PostComment[] {
		return commentsList.map((comment) => {
			if (comment.id === targetId) {
				// Found the target comment, update it
				return updatedComment;
			} else if (comment.replies && comment.replies.length > 0) {
				// Check nested replies
				const updatedReplies = updateCommentWithReplies(comment.replies, targetId, updatedComment);
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
			// Force reactivity by creating a new Set
			expandedComments = new Set(expandedComments);
		} else {
			expandedComments.add(commentId);
			// Force reactivity by creating a new Set
			expandedComments = new Set(expandedComments);
			// Load replies if not already loaded or cached
			const comment = findCommentById(comments, commentId);
			if (comment) {
				// Check if we have cached replies
				if (repliesCache.has(commentId)) {
					// Use cached replies
					const cachedReplies = repliesCache.get(commentId);
					// Update the comment with cached replies
					comments = updateCommentWithReplies(comments, commentId, {
						...comment,
						replies: cachedReplies
					});
				} else if (!comment.replies || comment.replies.length === 0) {
					// Fetch replies if not cached and not already loaded
					const replies = await getCommentReplies(supabase, commentId);
					// Cache the replies
					repliesCache.set(commentId, replies);
					// Update the comment with fetched replies
					comments = updateCommentWithReplies(comments, commentId, {
						...comment,
						replies
					});
				}
			}
		}
	}
</script>

<Card class="mt-6 border-0 border-t border-border bg-transparent p-0 shadow-none">
	<CardHeader class="p-0 pb-4">
		<div class="flex items-center justify-between">
			<CardTitle class="flex items-center gap-2 text-base font-medium">
				<MessageSquare class="h-4 w-4" />
				Comments ({comments.length})
			</CardTitle>
			<Button variant="ghost" size="sm" onclick={toggleCommentsVisibility} class="ml-2 h-7 w-7 p-0">
				{#if commentsVisible}
					<EyeOff class="h-3 w-3" />
				{:else}
					<Eye class="h-3 w-3" />
				{/if}
			</Button>
		</div>
	</CardHeader>
	<CardContent class="p-0">
		{#if commentsVisible}
		{#if currentUserId}
			<CommentForm
				parentId={undefined}
				onSubmit={handleSubmitComment}
				user={currentUser}
				placeholder="Share your thoughts..."
			/>
		{:else}
			<div class="py-4 text-center text-muted-foreground text-sm">
				<p>Please log in to leave a comment.</p>
			</div>
		{/if}

		{#if loading && comments.length === 0}
			<div class="flex justify-center py-6">
				<Loader2 class="h-5 w-5 animate-spin" />
			</div>
		{:else if comments.length === 0}
			<div class="py-6 text-center text-muted-foreground text-sm">
				<MessageSquare class="mx-auto mb-3 h-8 w-8 opacity-50" />
				<p>No comments yet. Be the first to share your thoughts!</p>
			</div>
		{:else}
			<div class="space-y-4 pt-4">
				{#each comments as comment (comment.id)}
					<div class="border-0 border-b border-border pb-4 last:border-0 last:pb-0">
						<CommentItem
							{comment}
							{currentUserId}
							{postAuthorId}
							{supabase}
							{currentUser}
							onReply={handleSubmitComment}
							onEdit={handleEditComment}
							onDelete={handleDeleteComment}
							onToggleReplies={toggleReplies}
							showReplies={expandedComments.has(comment.id)}
							expandedComments={expandedComments}
						/>
					</div>
				{/each}

				{#if hasMore}
					<div class="flex justify-center pt-4">
						<Button variant="ghost" onclick={loadMoreComments} disabled={loadingMore} class="h-8 text-sm">
							{#if loadingMore}
								<Loader2 class="mr-2 h-3 w-3 animate-spin" />
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
