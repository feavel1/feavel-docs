import type { Tables } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { updatePostTags } from './tags';
import { uploadPostCover } from './storage';

export type Post = Tables<'posts'> & {
	users?: {
		username: string;
		avatar_url: string | null;
	} | null;
	posts_tags_rel?: {
		post_tags: {
			tag_name: string;
		};
	}[];
	post_likes?: {
		id: number;
	}[];
	post_comments?: {
		id: number;
	}[];
};

interface PostFilters {
	selectedTags: string[];
	searchQuery: string;
}

export function filterPosts(posts: Post[], filters: PostFilters): Post[] {
	let filtered = posts;

	// Filter by tags
	if (filters.selectedTags.length > 0) {
		filtered = filtered.filter((post) =>
			post.posts_tags_rel?.some((rel) => filters.selectedTags.includes(rel.post_tags.tag_name))
		);
	}

	// Filter by search query
	if (filters.searchQuery) {
		const query = filters.searchQuery.toLowerCase();
		filtered = filtered.filter(
			(post) =>
				post.title?.toLowerCase().includes(query) ||
				post.users?.username?.toLowerCase().includes(query)
		);
	}

	return filtered;
}

export function getPostTags(post: Post): string[] {
	return post.posts_tags_rel?.map((rel) => rel.post_tags.tag_name) || [];
}

export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString();
}

export function getPostViews(post: Post): number {
	return post.post_views || 0;
}

export function isPostOwner(post: Post, userId?: string): boolean {
	return post.user_id === userId;
}

/**
 * Get the number of likes for a post
 * @param post The post object
 * @returns The number of likes
 */
export function getPostLikes(post: Post): number {
	return post.post_likes?.length || 0;
}

/**
 * Get the number of comments for a post
 * @param post The post object
 * @returns The number of comments
 */
export function getPostComments(post: Post): number {
	return post.post_comments?.length || 0;
}

/**
 * Calculate estimated reading time for a post
 * @param content The post content
 * @returns Estimated reading time in minutes
 */
export function getReadingTime(content: string | any): number {
	if (!content) return 1;

	// Handle Editor.js content structure
	let text = '';
	if (typeof content === 'object' && content.blocks) {
		text = content.blocks
			.map((block: any) => {
				if (block.type === 'paragraph' && block.data?.text) {
					return block.data.text;
				}
				return '';
			})
			.join(' ');
	} else if (typeof content === 'string') {
		text = content;
	} else {
		return 1;
	}

	// Average reading speed: 200 words per minute
	const wordsPerMinute = 200;
	const wordCount = text.trim().split(/\s+/).length;
	return Math.ceil(wordCount / wordsPerMinute) || 1;
}

// Post CRUD operations

interface PostData {
	id?: number;
	title: string | null;
	content: any;
	cover?: string | null;
	public_visibility: boolean;
	tags: string[];
}

/**
 * Create a new post
 * @param supabase Supabase client instance
 * @param userId ID of the user creating the post
 * @param postData Data for the new post
 * @returns Created post or null if failed
 */
export async function createPost(
	supabase: SupabaseClient,
	userId: string,
	postData: PostData
): Promise<{ post: Post | null; error: string | null }> {
	try {
		const { data: post, error: postError } = await supabase
			.from('posts')
			.insert({
				title: postData.title?.trim() || null,
				content_v2: postData.content || null,
				post_cover: postData.cover?.trim() || null,
				public_visibility: postData.public_visibility || false,
				user_id: userId
			})
			.select()
			.single();

		if (postError) {
			console.error('Error creating post:', postError);
			return { post: null, error: 'Failed to create post' };
		}

		// Handle tags if provided
		if (postData.tags && postData.tags.length > 0) {
			const { error: tagError } = await updatePostTags(supabase, post.id, postData.tags);
			if (tagError) {
				console.error('Error adding tags:', tagError);
				// Don't fail the entire request if tag addition fails
			}
		}

		return { post, error: null };
	} catch (error) {
		console.error('Error in post creation:', error);
		return { post: null, error: 'Failed to create post' };
	}
}

/**
 * Update an existing post
 * @param supabase Supabase client instance
 * @param userId ID of the user updating the post
 * @param postId ID of the post to update
 * @param postData Updated data for the post
 * @returns Success status and error message if any
 */
export async function updatePost(
	supabase: SupabaseClient,
	userId: string,
	postId: number,
	postData: Partial<PostData>
): Promise<{ success: boolean; error: string | null }> {
	try {
		const { error: postError } = await supabase
			.from('posts')
			.update({
				title: postData.title?.trim() || null,
				content_v2: postData.content || null,
				post_cover: postData.cover?.trim() || null,
				public_visibility: postData.public_visibility || false
			})
			.eq('id', postId)
			.eq('user_id', userId);

		if (postError) {
			console.error('Error updating post:', postError);
			return { success: false, error: 'Failed to update post' };
		}

		// Handle tags if provided
		if (postData.tags) {
			const { error: tagError } = await updatePostTags(supabase, postId, postData.tags);
			if (tagError) {
				console.error('Error updating tags:', tagError);
				// Don't fail the entire request if tag update fails
			}
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error in post update:', error);
		return { success: false, error: 'Failed to update post' };
	}
}

/**
 * Delete a post
 * @param supabase Supabase client instance
 * @param userId ID of the user deleting the post
 * @param postId ID of the post to delete
 * @returns Success status and error message if any
 */
export async function deletePost(
	supabase: SupabaseClient,
	userId: string,
	postId: number
): Promise<{ success: boolean; error: string | null }> {
	try {
		// Remove tags first
		await updatePostTags(supabase, postId, []);

		// Delete the post
		const { error: deleteError } = await supabase
			.from('posts')
			.delete()
			.eq('id', postId)
			.eq('user_id', userId);

		if (deleteError) {
			console.error('Error deleting post:', deleteError);
			return { success: false, error: 'Failed to delete post' };
		}

		return { success: true, error: null };
	} catch (error) {
		console.error('Error in post deletion:', error);
		return { success: false, error: 'Failed to delete post' };
	}
}

/**
 * Handle post cover upload
 * @param supabase Supabase client instance
 * @param coverFile File to upload
 * @returns Filename of uploaded file or null if failed
 */
export async function handlePostCoverUpload(
	supabase: SupabaseClient,
	coverFile: File
): Promise<string | null> {
	try {
		const filename = await uploadPostCover(supabase, coverFile);
		return filename;
	} catch (error) {
		console.error('Error uploading cover:', error);
		return null;
	}
}

/**
 * Fetch all available tags
 * @param supabase Supabase client instance
 * @returns Array of tag names
 */
export async function fetchAllTags(supabase: SupabaseClient): Promise<string[]> {
	try {
		const { data: availableTags, error: tagsError } = await supabase
			.from('post_tags')
			.select('tag_name')
			.order('tag_name');

		if (tagsError) {
			console.error('Error fetching tags:', tagsError);
			return [];
		}

		return availableTags?.map((tag) => tag.tag_name) || [];
	} catch (error) {
		console.error('Error fetching tags:', error);
		return [];
	}
}
