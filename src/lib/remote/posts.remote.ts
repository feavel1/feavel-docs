import { query } from '$app/server';
import { z } from 'zod/v4';
import { supabase } from '$lib/server/supabase';
import type { Tables } from '$lib/types/database.types';

// Define types based on the data model
export type Post = Tables<'posts'> & {
	users?: {
		username: string | null;
		avatar_file_id: string | null;
	} | null;
	posts_tags_rel?:
		| {
				posts_tags: {
					id: number;
					tag_name: string;
				} | null;
		  }[]
		| null;
	posts_likes?:
		| {
				id: number;
				user_id: string;
				created_at: string;
				users?: {
					username: string | null;
					avatar_file_id: string | null;
				} | null;
		  }[]
		| null;
};

export type PostWithComments = Post & {
	posts_comments?:
		| {
				id: number;
				created_at: string;
				updated_at: string;
				user_id: string;
				parent_id: number | null;
				content: string;
				is_deleted: boolean;
				post_id: number;
				users?: {
					username: string | null;
					full_name: string | null;
					avatar_file_id: string | null;
				} | null;
		  }[]
		| null;
};

export type Comment = Tables<'posts_comments'> & {
	users?: {
		username: string | null;
		full_name: string | null;
		avatar_file_id: string | null;
	} | null;
};

/**
 * Fetch a single post with all related data (excluding comments which are paginated)
 */
export const getPost = query(z.number(), async (postId) => {
	try {
		const { data: post, error } = await supabase
			.from('posts')
			.select(
				`
				*,
				users!inner(username, avatar_file_id),
				posts_tags_rel(
					posts_tags!inner(id, tag_name)
				),
				posts_likes(
					id,
					user_id,
					created_at,
					users!inner(username, avatar_file_id)
				)
			`
			)
			.eq('id', postId)
			.single();

		if (error) {
			console.error('Database error in getPost:', error);
			return null;
		}

		return post as PostWithComments;
	} catch (error) {
		console.error('Unexpected error in getPost:', error);
		return null;
	}
});

/**
 * Fetch public posts with related data (excluding comments which are paginated)
 */
export const getPublicPosts = query(
	z.object({
		limit: z.number().optional(),
		offset: z.number().optional()
	}),
	async ({ limit = 10, offset = 0 }) => {
		try {
			const { data: posts, error } = await supabase
				.from('posts')
				.select(
					`
					*,
					users!inner(username, avatar_file_id),
					posts_tags_rel(
						posts_tags!inner(id, tag_name)
					)
				`
				)
				.eq('public_visibility', true)
				.order('created_at', { ascending: false })
				.range(offset, offset + limit - 1);

			if (error) {
				console.error('Database error in getPublicPosts:', error);
				return [];
			}

			return posts as Post[];
		} catch (error) {
			console.error('Unexpected error in getPublicPosts:', error);
			return [];
		}
	}
);

/**
 * Fetch user's draft posts with related data (excluding comments which are paginated)
 */
export const getDrafts = query(z.string(), async (userId) => {
	try {
		const { data: drafts, error } = await supabase
			.from('posts')
			.select(
				`
				*,
				users!inner(username, avatar_file_id),
				posts_tags_rel(
					posts_tags!inner(id, tag_name)
				)
			`
			)
			.eq('user_id', userId)
			.eq('public_visibility', false)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Database error in getDrafts:', error);
			return [];
		}

		return drafts as Post[];
	} catch (error) {
		console.error('Unexpected error in getDrafts:', error);
		return [];
	}
});

/**
 * Fetch posts by tag with related data (excluding comments which are paginated)
 */
export const getPostsByTag = query(z.string(), async (tagName) => {
	try {
		const { data: posts, error } = await supabase
			.from('posts')
			.select(
				`
				posts!inner(*,
					users!inner(username, avatar_file_id),
					posts_tags_rel(
						posts_tags!inner(id, tag_name)
					)
				)
			`
			)
			.eq('posts.public_visibility', true)
			.eq('posts_tags_rel.posts_tags.tag_name', tagName);

		if (error) {
			console.error('Database error in getPostsByTag:', error);
			return [];
		}

		// Extract posts from the joined data
		const extractedPosts = posts.map((item: any) => item.posts);

		return extractedPosts as Post[];
	} catch (error) {
		console.error('Unexpected error in getPostsByTag:', error);
		return [];
	}
});

/**
 * Fetch paginated comments for a post
 */
export const getPostComments = query(
	z.object({
		postId: z.number(),
		limit: z.number().optional(),
		offset: z.number().optional()
	}),
	async ({ postId, limit = 10, offset = 0 }) => {
		try {
			const { data: comments, error } = await supabase
				.from('posts_comments')
				.select(
					`
					id,
					created_at,
					updated_at,
					user_id,
					parent_id,
					content,
					is_deleted,
					post_id,
					users!inner(username, avatar_file_id, full_name)
				`
				)
				.eq('post_id', postId)
				.eq('is_deleted', false)
				.order('created_at', { ascending: true })
				.range(offset, offset + limit - 1);

			if (error) {
				console.error('Database error in getPostComments:', error);
				return [];
			}

			return comments as unknown as Comment[];
		} catch (error) {
			console.error('Unexpected error in getPostComments:', error);
			return [];
		}
	}
);
