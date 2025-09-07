import type { SupabaseClient } from '@supabase/supabase-js';

export interface Tag {
	id: number;
	tag_name: string;
}

/**
 * Get all tags
 */
export async function getTags(supabase: SupabaseClient) {
	const { data, error } = await supabase
		.from('post_tags')
		.select('id, tag_name')
		.order('tag_name');

	return { data, error };
}

/**
 * Get tags for a specific post
 */
export async function getPostTags(supabase: SupabaseClient, postId: number) {
	const { data, error } = await supabase
		.from('posts_tags_rel')
		.select('post_tags(tag_name)')
		.eq('post_id', postId);

	return { data, error };
}

/**
 * Add tags to a post
 */
export async function addTagsToPost(supabase: SupabaseClient, postId: number, tagNames: string[]) {
	try {
		// First, ensure all tags exist in the post_tags table
		for (const tagName of tagNames) {
			await supabase.from('post_tags').upsert(
				{ tag_name: tagName },
				{
					onConflict: 'tag_name'
				}
			);
		}

		// Get tag IDs
		const { data: tagData } = await supabase
			.from('post_tags')
			.select('id')
			.in('tag_name', tagNames);

		if (tagData && tagData.length > 0) {
			// Create relationships
			const relationships = tagData.map((tag: any) => ({
				post_id: postId,
				tag_id: tag.id
			}));

			// Insert relationships (ignore duplicates)
			const { error } = await supabase.from('posts_tags_rel').insert(relationships);

			return { error };
		}

		return { error: null };
	} catch (error) {
		console.error('Error adding tags to post:', error);
		return { error };
	}
}

/**
 * Remove all tags from a post
 */
export async function removeTagsFromPost(supabase: SupabaseClient, postId: number) {
	const { error } = await supabase
		.from('posts_tags_rel')
		.delete()
		.eq('post_id', postId);

	return { error };
}

/**
 * Update tags for a post (add new, remove old)
 */
export async function updatePostTags(supabase: SupabaseClient, postId: number, tagNames: string[]) {
	try {
		// Remove all existing tags first
		await removeTagsFromPost(supabase, postId);
		
		// Add new tags
		if (tagNames.length > 0) {
			return await addTagsToPost(supabase, postId, tagNames);
		}
		
		return { error: null };
	} catch (error) {
		console.error('Error updating post tags:', error);
		return { error };
	}
}