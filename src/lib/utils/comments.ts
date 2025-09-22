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

	// Get reply counts for each comment
	const commentsWithReplies = await Promise.all(
		data.map(async (comment) => {
			const { count } = await supabase
				.from('post_comments')
				.select('*', { count: 'exact', head: true })
				.eq('parent_id', comment.id)
				.is('is_deleted', false);

			return {
				...comment,
				_reply_count: count || 0
			};
		})
	);

	return commentsWithReplies;
}

export async function getCommentReplies(
	supabase: SupabaseClient,
	commentId: number
): Promise<PostComment[]> {
	if (commentId <= 0) return [];

	const { data, error } = await supabase
		.from('post_comments')
		.select(COMMENT_FIELDS)
		.eq('parent_id', commentId)
		.is('is_deleted', false)
		.order('created_at', { ascending: true });

	if (error) {
		console.error('Error fetching replies:', error);
		return [];
	}

	// Get reply counts for each reply recursively
	const repliesWithCounts = await Promise.all(
		data.map(async (reply) => {
			const { count } = await supabase
				.from('post_comments')
				.select('*', { count: 'exact', head: true })
				.eq('parent_id', reply.id)
				.is('is_deleted', false);

			// If this reply has replies, recursively fetch them with counts
			let nestedReplies: PostComment[] = [];
			if (count && count > 0) {
				nestedReplies = await getCommentReplies(supabase, reply.id);
			}

			return {
				...reply,
				_reply_count: count || 0,
				replies: nestedReplies
			};
		})
	);

	return repliesWithCounts;
}

export async function createComment(
	supabase: SupabaseClient,
	postId: number,
	userId: string,
	commentData: CommentFormData
): Promise<PostComment | null> {
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
	if (commentId <= 0 || !userId) return false;

	// Verify comment ownership
	const { data: comment, error: fetchError } = await supabase
		.from('post_comments')
		.select('user_id')
		.eq('id', commentId)
		.single();

	if (fetchError || !comment) {
		console.error('Error fetching comment:', fetchError);
		return false;
	}

	// Check if user is authorized to delete (comment owner or post author)
	if (comment.user_id !== userId) {
		console.error('Unauthorized: User does not own this comment');
		return false;
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
		.update({ content: content.trim() })
		.eq('id', commentId)
		.select(COMMENT_FIELDS)
		.single();

	if (error) {
		console.error('Error updating comment:', error);
		return null;
	}

	return data;
}
