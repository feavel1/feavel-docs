<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { MessageSquare, Loader2, Eye, EyeOff } from '@lucide/svelte';
	import {
		getComments,
		createComment,
		updateComment,
		deleteComment,
		getCommentReplies,
		type PostComment,
		type CommentFormData
	} from '$lib/utils/comments';
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
	let repliesCache = $state(new Map<number, PostComment[]>());

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

		return newComment;
	}

	async function handleEditComment(commentId: number, content: string) {
		const updatedComment = await updateComment(supabase, commentId, content, currentUserId);
		if (updatedComment) {
			comments = updateCommentsWithEditedComment(comments, updatedComment);
		}
	}

	async function handleDeleteComment(commentId: number) {
		const success = await deleteComment(supabase, commentId, currentUserId);
		if (success) {
			comments = removeCommentFromList(comments, commentId);
			repliesCache.delete(commentId);
		}
	}

	function toggleCommentsVisibility() {
		commentsVisible = !commentsVisible;
	}

	async function toggleReplies(commentId: number) {
		if (expandedComments.has(commentId)) {
			expandedComments.delete(commentId);
			expandedComments = new Set(expandedComments);
		} else {
			expandedComments.add(commentId);
			expandedComments = new Set(expandedComments);

			const comment = findCommentById(comments, commentId);
			if (comment && !comment.replies?.length) {
				if (repliesCache.has(commentId)) {
					const cachedReplies = repliesCache.get(commentId);
					comments = updateCommentWithReplies(comments, commentId, {
						...comment,
						replies: cachedReplies
					});
				} else {
					const replies = await getCommentReplies(supabase, commentId);
					repliesCache.set(commentId, replies);
					comments = updateCommentWithReplies(comments, commentId, {
						...comment,
						replies
					});
				}
			}
		}
	}

	// Generic tree traversal function
	function traverseComments(
		commentsList: PostComment[],
		operation: (comment: PostComment, parent?: PostComment) => PostComment | null | 'skip' | void
	): PostComment[] {
		return commentsList
			.map((comment) => {
				const result = operation(comment);

				if (result === 'skip') {
					return comment;
				}

				const updatedComment = result === null ? null : result || comment;

				if (updatedComment === null) {
					return null;
				}

				if (updatedComment.replies?.length) {
					const updatedReplies = traverseComments(updatedComment.replies, operation);
					const filteredReplies = updatedReplies.filter((reply) => reply !== null) as PostComment[];
					return {
						...updatedComment,
						replies: filteredReplies
					};
				}

				return updatedComment;
			})
			.filter((comment) => comment !== null) as PostComment[];
	}

	// Helper functions using the generic traversal
	function findCommentById(commentsList: PostComment[], id: number): PostComment | null {
		let foundComment: PostComment | null = null;

		traverseComments(commentsList, (comment) => {
			if (comment.id === id) {
				foundComment = comment;
				return null; // Stop traversal
			}
			return 'skip'; // Continue traversal
		});

		return foundComment;
	}

	function updateCommentReplies(
		commentsList: PostComment[],
		parentId: number,
		newReply: PostComment
	): PostComment[] {
		return traverseComments(commentsList, (comment) => {
			if (comment.id === parentId) {
				const updatedReplies = comment.replies ? [...comment.replies, newReply] : [newReply];
				if (repliesCache.has(comment.id)) {
					repliesCache.set(comment.id, updatedReplies);
				}
				return {
					...comment,
					replies: updatedReplies,
					_reply_count: (comment._reply_count || 0) + 1
				};
			}
			return 'skip'; // Skip processing children in this case since we handle recursion manually
		});
	}

	function updateCommentsWithEditedComment(
		commentsList: PostComment[],
		updatedComment: PostComment
	): PostComment[] {
		return traverseComments(commentsList, (comment) => {
			if (comment.id === updatedComment.id) {
				return updatedComment;
			}
			return 'skip';
		});
	}

	function removeCommentFromList(commentsList: PostComment[], commentId: number): PostComment[] {
		return traverseComments(commentsList, (comment) => {
			if (comment.id === commentId) {
				return null; // Remove this comment
			}

			// Update reply count if this comment has replies that were filtered
			if (comment.replies?.length) {
				const filteredReplies = comment.replies.filter((reply) => reply.id !== commentId);
				if (filteredReplies.length !== comment.replies.length) {
					if (repliesCache.has(comment.id)) {
						repliesCache.set(comment.id, filteredReplies);
					}
					return {
						...comment,
						replies: filteredReplies,
						_reply_count: filteredReplies.length
					};
				}
			}

			return 'skip';
		});
	}

	function updateCommentWithReplies(
		commentsList: PostComment[],
		targetId: number,
		updatedComment: PostComment
	): PostComment[] {
		return traverseComments(commentsList, (comment) => {
			if (comment.id === targetId) {
				return updatedComment;
			}
			return 'skip';
		});
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
				<div class="py-4 text-center text-sm text-muted-foreground">
					<p>Please log in to leave a comment.</p>
				</div>
			{/if}

			{#if loading && comments.length === 0}
				<div class="flex justify-center py-6">
					<Loader2 class="h-5 w-5 animate-spin" />
				</div>
			{:else if comments.length === 0}
				<div class="py-6 text-center text-sm text-muted-foreground">
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
								{expandedComments}
							/>
						</div>
					{/each}

					{#if hasMore}
						<div class="flex justify-center pt-4">
							<Button
								variant="ghost"
								onclick={loadMoreComments}
								disabled={loadingMore}
								class="h-8 text-sm"
							>
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
