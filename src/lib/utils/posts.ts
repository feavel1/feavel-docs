import type { Tables } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { updatePostTags, getTags } from './tags';
import { FileStorage, ImageProcessor } from '$lib/services/storage';
import { validateUUID, type ApiResponse } from './validation';

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
	posts_comments?:
		| {
				id: number;
				created_at: string;
				updated_at: string;
				user_id: string;
				parent_id: number | null;
				content: string;
				is_deleted: boolean;
				users?: {
					username: string | null;
					full_name: string | null;
					avatar_file_id: string | null;
				} | null;
		  }[]
		| null;
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
			post.posts_tags_rel?.some(
				(rel) => rel.posts_tags && filters.selectedTags.includes(rel.posts_tags.tag_name)
			)
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

/**
 * Get the number of likes for a post
 * @param post The post object
 * @returns The number of likes
 */
export function getPostLikes(post: Post): number {
	return post.posts_likes?.length || 0;
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
	cover_file_id?: string | null; // New field for foreign key reference
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
): Promise<ApiResponse<Post>> {
	try {
		const { data: post, error: postError } = await supabase
			.from('posts')
			.insert({
				title: postData.title?.trim() || null,
				content_v2: postData.content || null,
				cover_file_id: postData.cover_file_id || null,
				public_visibility: postData.public_visibility || false,
				user_id: userId
			})
			.select()
			.single();

		if (postError) {
			console.error('Error creating post:', postError);
			return { success: false, error: 'Failed to create post' };
		}

		// Handle tags if provided
		if (postData.tags && postData.tags.length > 0) {
			const { error: tagError } = await updatePostTags(supabase, post.id, postData.tags);
			if (tagError) {
				console.error('Error adding tags:', tagError);
				// Don't fail the entire request if tag addition fails
			}
		}

		return { success: true, data: post };
	} catch (error) {
		console.error('Error in post creation:', error);
		return { success: false, error: 'Failed to create post' };
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
): Promise<ApiResponse<null>> {
	try {
		// Additional validation: ensure cover_file_id is a valid UUID if provided
		const coverIdError = validateUUID(postData.cover_file_id, 'cover file ID');
		if (coverIdError) {
			return { success: false, error: coverIdError };
		}

		const { error: postError } = await supabase
			.from('posts')
			.update({
				title: postData.title?.trim() || null,
				content_v2: postData.content || null,
				cover_file_id: postData.cover_file_id || null,
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

		return { success: true };
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
): Promise<ApiResponse<null>> {
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

		return { success: true };
	} catch (error) {
		console.error('Error in post deletion:', error);
		return { success: false, error: 'Failed to delete post' };
	}
}

/**
 * Handle post cover upload
 * @param supabase Supabase client instance
 * @param coverFile File to upload
 * @param postId Post ID that will be associated with the cover
 * @returns cover_file_id string or null if failed
 */
export async function handlePostCoverUpload(
	supabase: SupabaseClient,
	coverFile: File,
	postId: number
): Promise<string | null> {
	try {
		// Image compression using the new service
		const compressedFile = await ImageProcessor.compressImage(coverFile);

		// Use new FileStorage service
		const storage = new FileStorage(supabase);
		const result = await storage.upload({
			file: compressedFile,
			options: {
				folder: 'posts/covers',
				entity_type: 'post',
				entity_id: postId.toString(), // Ensure entity_id is always a string
				is_public: true,
				upsert: true
			}
		});

		if (!result) return null;

		// Just return the storage ID - let the component handle updating the posts table
		return result.storage_id;
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
	const { data, error } = await getTags(supabase);
	if (error) {
		console.error('Error fetching tags:', error);
		return [];
	}
	return data?.map((tag: any) => tag.tag_name) || [];
}
