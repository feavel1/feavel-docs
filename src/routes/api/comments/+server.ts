import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createComment, updateComment, deleteComment } from '$lib/utils/comments';
import type { CommentFormData } from '$lib/types/comments';

// Validation helpers
const validateId = (id: any): number | null => {
	const num = Number(id);
	return Number.isInteger(num) && num > 0 ? num : null;
};

const validateContent = (content: any): string | null => {
	return typeof content === 'string' && content.trim().length > 0 ? content.trim() : null;
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { post_id, content, parent_id } = await request.json();

		const validPostId = validateId(post_id);
		const validContent = validateContent(content);
		const validParentId = parent_id ? validateId(parent_id) : null;

		if (!validPostId) {
			return json({ error: 'Invalid post ID' }, { status: 400 });
		}

		if (!validContent) {
			return json({ error: 'Content is required' }, { status: 400 });
		}

		const commentData: CommentFormData = {
			content: validContent,
			...(validParentId && { parent_id: validParentId })
		};
		const comment = await createComment(locals.supabase, validPostId, commentData);

		return comment
			? json({ comment })
			: json({ error: 'Failed to create comment' }, { status: 500 });
	} catch (error) {
		console.error('Error creating comment:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { comment_id, content } = await request.json();

		const validCommentId = validateId(comment_id);
		const validContent = validateContent(content);

		if (!validCommentId) {
			return json({ error: 'Invalid comment ID' }, { status: 400 });
		}

		if (!validContent) {
			return json({ error: 'Content is required' }, { status: 400 });
		}

		// Verify comment ownership
		const { data: comment } = await locals.supabase
			.from('post_comments')
			.select('user_id')
			.eq('id', validCommentId)
			.single();

		if (!comment || comment.user_id !== user.id) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const updatedComment = await updateComment(locals.supabase, validCommentId, validContent);

		return updatedComment
			? json({ comment: updatedComment })
			: json({ error: 'Failed to update comment' }, { status: 500 });
	} catch (error) {
		console.error('Error updating comment:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { comment_id } = await request.json();
		const validCommentId = validateId(comment_id);

		if (!validCommentId) {
			return json({ error: 'Invalid comment ID' }, { status: 400 });
		}

		// Verify comment ownership
		const { data: comment } = await locals.supabase
			.from('post_comments')
			.select('user_id')
			.eq('id', validCommentId)
			.single();

		if (!comment || comment.user_id !== user.id) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		const success = await deleteComment(locals.supabase, validCommentId);

		return success
			? json({ success: true })
			: json({ error: 'Failed to delete comment' }, { status: 500 });
	} catch (error) {
		console.error('Error deleting comment:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
