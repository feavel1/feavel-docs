import type { Tables } from '$lib/types/database.types';

// Simplified types using the new Tables<> syntax for the base structures
// Before: Complex manual type definitions
// After: Clean, simplified types using Tables<'table_name'>
export type PostCommentRow = Tables<'post_comments'>;
export type PostLikeRow = Tables<'post_likes'>;

// Extended interfaces that include relationships and computed properties
// This maintains backward compatibility while leveraging the new type system
export interface PostComment extends PostCommentRow {
	users?: {
		username: string;
		avatar_url?: string;
		full_name?: string;
	};
	replies?: PostComment[];
	_reply_count?: number;
}

export interface PostLike extends PostLikeRow {
	users?: {
		username: string;
		avatar_url?: string;
	};
}

export interface CommentFormData {
	content: string;
	parent_id?: number;
}

export interface CommentResponse {
	comment: PostComment;
	like_count: number;
	is_liked: boolean;
}
