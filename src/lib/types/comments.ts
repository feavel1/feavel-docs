export interface PostComment {
	id: number;
	created_at: string;
	updated_at: string;
	post_id: number;
	user_id: string;
	parent_id?: number;
	content: string;
	is_deleted: boolean;
	users?: {
		username: string;
		avatar_url?: string;
		full_name?: string;
	};
	replies?: PostComment[];
	_reply_count?: number;
}

export interface PostLike {
	id: number;
	created_at: string;
	post_id: number;
	user_id: string;
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
