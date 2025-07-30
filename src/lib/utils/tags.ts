import type { SupabaseClient } from '@supabase/supabase-js';

export async function getTags(supabase: SupabaseClient) {
	const { data, error } = await supabase
		.from('post_tags')
		.select('id, tag_name')
		.order('tag_name');
	
	return { data, error };
}

export async function getPostTags(supabase: SupabaseClient, postId: number) {
	const { data, error } = await supabase
		.from('posts_tags_rel')
		.select(
			`
			tag_id,
			post_tags!inner(id, tag_name)
		`
		)
		.eq('post_id', postId);
	
	return { data, error };
}

export async function addTagsToPost(supabase: SupabaseClient, postId: number, tagNames: string[]) {
	try {
		// First, ensure all tags exist in the post_tags table
		for (const tagName of tagNames) {
			// Try to insert the tag (will fail if it already exists, which is fine)
			await supabase
				.from('post_tags')
				.insert({ tag_name: tagName })
				.select()
				.single();
		}

		// Get tag IDs
		const { data: tagData } = await supabase
			.from('post_tags')
			.select('id, tag_name')
			.in('tag_name', tagNames);

		if (tagData) {
			// Create relationships
			const relationships = tagData.map(tag => ({
				post_id: postId,
				tag_id: tag.id
			}));

			const { error } = await supabase
				.from('posts_tags_rel')
				.insert(relationships);

			return { error };
		}

		return { error: null };
	} catch (error) {
		return { error };
	}
}

export async function removeTagsFromPost(supabase: SupabaseClient, postId: number) {
	const { error } = await supabase
		.from('posts_tags_rel')
		.delete()
		.eq('post_id', postId);
	
	return { error };
}

export async function updatePostTags(supabase: SupabaseClient, postId: number, tagNames: string[]) {
	try {
		// First remove all existing relationships
		await removeTagsFromPost(supabase, postId);

		// Then add new relationships
		if (tagNames.length > 0) {
			return await addTagsToPost(supabase, postId, tagNames);
		}

		return { error: null };
	} catch (error) {
		return { error };
	}
} 