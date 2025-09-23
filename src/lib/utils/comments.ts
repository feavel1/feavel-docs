import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tables } from '$lib/types/database.types';

export interface CommentFormData {
	content: string;
	parent_id?: number;
}

export interface PostComment extends Tables<'post_comments'> {
	replies?: PostComment[];
	_reply_count?: number;
}

const COMMENT_FIELDS = `
	*,
	users!inner(username, avatar_url, full_name)
`;

// Helper function to get reply counts for multiple comments in a single query
async function getReplyCounts(
	supabase: SupabaseClient,
	commentIds: number[]
): Promise<Record<number, number>> {
	if (commentIds.length === 0) return {};

	const { data, error } = await supabase
		.from('post_comments')
		.select('parent_id')
		.in('parent_id', commentIds)
		.is('is_deleted', false);

	if (error) {
		console.error('Error fetching reply counts:', error);
		return {};
	}

	// Count replies for each comment
	const counts: Record<number, number> = {};
	data.forEach((row) => {
		const parentId = row.parent_id;
		if (parentId !== null) {
			counts[parentId] = (counts[parentId] || 0) + 1;
		}
	});

	return counts;
}

export async function getComments(
	supabase: SupabaseClient,
	postId: number,
	page: number = 1,
	limit: number = 10
): Promise<PostComment[]> {
	if (postId <= 0 || page < 1 || limit < 1) return [];

	const offset = (page - 1) * limit;

	const { data, error } = await supabase
		.from('post_comments')
		.select(COMMENT_FIELDS)
		.eq('post_id', postId)
		.is('parent_id', null)
		.is('is_deleted', false)
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) {
		console.error('Error fetching comments:', error);
		return [];
	}

	// Get reply counts for all comments in a single query
	const commentIds = data.map((comment) => comment.id);
	const replyCounts = await getReplyCounts(supabase, commentIds);

	// Attach reply counts to comments
	const commentsWithReplies = data.map((comment) => ({
		...comment,
		_reply_count: replyCounts[comment.id] || 0
	}));

	return commentsWithReplies;
}

export async function getCommentReplies(
	supabase: SupabaseClient,
	commentId: number
): Promise<PostComment[]> {
	if (commentId <= 0) return [];

	// First get all replies for this comment
	const { data: replies, error } = await supabase
		.from('post_comments')
		.select(COMMENT_FIELDS)
		.eq('parent_id', commentId)
		.is('is_deleted', false)
		.order('created_at', { ascending: true });

	if (error) {
		console.error('Error fetching replies:', error);
		return [];
	}

	// Get reply counts for all replies in a single query
	const replyIds = replies.map((reply) => reply.id);
	const replyCounts = await getReplyCounts(supabase, replyIds);

	// Attach reply counts to replies
	const repliesWithCounts = replies.map((reply) => ({
		...reply,
		_reply_count: replyCounts[reply.id] || 0
	}));

	return repliesWithCounts;
}

export async function createComment(
	supabase: SupabaseClient,
	postId: number,
	userId: string,
	commentData: CommentFormData
): Promise<PostComment | null> {
	// Validate inputs
	if (postId <= 0 || !userId || !commentData.content?.trim()) return null;

	const { data, error } = await supabase
		.from('post_comments')
		.insert({
			post_id: postId,
			user_id: userId,
			content: commentData.content.trim(),
			parent_id: commentData.parent_id || null
		})
		.select(COMMENT_FIELDS)
		.single();

	if (error) {
		console.error('Error creating comment:', error);
		return null;
	}

	return data;
}

export async function deleteComment(
	supabase: SupabaseClient,
	commentId: number,
	userId: string
): Promise<boolean> {
	// Validate inputs
	if (commentId <= 0 || !userId) return false;

	// Verify comment ownership and get post_id to check if user is post author
	const { data: comment, error: fetchError } = await supabase
		.from('post_comments')
		.select('user_id, post_id')
		.eq('id', commentId)
		.single();

	if (fetchError || !comment) {
		console.error('Error fetching comment:', fetchError);
		return false;
	}

	// Check if user is authorized to delete (comment owner)
	if (comment.user_id !== userId) {
		// Check if user is post author
		const { data: post, error: postError } = await supabase
			.from('posts')
			.select('user_id')
			.eq('id', comment.post_id)
			.single();

		if (postError || !post || post.user_id !== userId) {
			console.error('Unauthorized: User does not own this comment or the post');
			return false;
		}
	}

	const { error } = await supabase
		.from('post_comments')
		.update({ is_deleted: true })
		.eq('id', commentId);

	if (error) {
		console.error('Error deleting comment:', error);
		return false;
	}

	return true;
}

export async function updateComment(
	supabase: SupabaseClient,
	commentId: number,
	content: string,
	userId: string
): Promise<PostComment | null> {
	// Validate inputs
	if (commentId <= 0 || !content?.trim() || !userId) return null;

	// Verify comment ownership
	const { data: comment, error: fetchError } = await supabase
		.from('post_comments')
		.select('user_id')
		.eq('id', commentId)
		.single();

	if (fetchError || !comment) {
		console.error('Error fetching comment:', fetchError);
		return null;
	}

	// Check if user is authorized to update (comment owner)
	if (comment.user_id !== userId) {
		console.error('Unauthorized: User does not own this comment');
		return null;
	}

	const { data, error } = await supabase
		.from('post_comments')
		.update({
			content: content.trim(),
			updated_at: new Date().toISOString()
		})
		.eq('id', commentId)
		.select(COMMENT_FIELDS)
		.single();

	if (error) {
		console.error('Error updating comment:', error);
		return null;
	}

	return data;
}

// Format comment date for display
export function formatCommentDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

	if (diffInHours < 1) return 'Just now';
	if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
	if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
	return date.toLocaleDateString();
}
