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
		.from('posts_tags')
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
		.select('posts_tags(tag_name)')
		.eq('post_id', postId);

	return { data, error };
}

/**
 * Update tags for a post (add new, remove old) using database function
 */
export async function updatePostTags(supabase: SupabaseClient, postId: number, tagNames: string[]) {
	try {
		// Call the database function to update post tags
		const { error } = await supabase.rpc('update_post_tags', {
			post_id_param: postId,
			tag_names: tagNames
		});

		return { error };
	} catch (error) {
		console.error('Error updating post tags:', error);
		return { error };
	}
}
