import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Utility functions for tag handling
 */

export interface Tag {
	id: number;
	tag_name: string;
}

/**
 * Convert string tags to Tag objects for MultiTagSelect component
 */
export function stringTagsToObjects(tags: string[]): Tag[] {
	return tags.map((tag, index) => ({ id: index, tag_name: tag }));
}

/**
 * Extract tag names from post relationships
 */
export function extractTagNamesFromRelations(relations: any[]): string[] {
	return relations?.map((rel) => rel.post_tags.tag_name) || [];
}

/**
 * Validate and clean tag names
 */
export function cleanTagName(tagName: string): string {
	return tagName.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Check if tag name is valid
 */
export function isValidTagName(tagName: string): boolean {
	return tagName.trim().length > 0 && tagName.trim().length <= 50;
}

export async function getTags(supabase: SupabaseClient) {
	const { data, error } = await supabase.from('post_tags').select('id, tag_name').order('tag_name');

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
			.select('id, tag_name')
			.in('tag_name', tagNames);

		if (tagData && tagData.length > 0) {
			// Create relationships
			const relationships = tagData.map((tag) => ({
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

export async function removeTagsFromPost(supabase: SupabaseClient, postId: number) {
	const { error } = await supabase.from('posts_tags_rel').delete().eq('post_id', postId);

	return { error };
}

export async function updatePostTags(supabase: SupabaseClient, postId: number, tagNames: string[]) {
	try {
		// Get existing tag relationships for this post
		const { data: existingRelations, error: fetchError } = await supabase
			.from('posts_tags_rel')
			.select('tag_id, post_tags(tag_name)')
			.eq('post_id', postId);

		if (fetchError) {
			console.error('Error fetching existing tag relationships:', fetchError);
			return { error: fetchError };
		}

		// Extract existing tag names
		const existingTagNames =
			existingRelations?.map((rel) => (rel as any).post_tags?.tag_name).filter(Boolean) || [];

		// Find tags to add (in new list but not in existing)
		const tagsToAdd = tagNames.filter((tagName) => !existingTagNames.includes(tagName));

		// Find tags to remove (in existing but not in new list)
		const tagsToRemove = existingTagNames.filter((tagName) => !tagNames.includes(tagName));

		// Remove tags that are no longer needed
		if (tagsToRemove.length > 0) {
			// Get tag IDs for tags to remove
			const { data: tagsToRemoveData } = await supabase
				.from('post_tags')
				.select('id')
				.in('tag_name', tagsToRemove);

			if (tagsToRemoveData && tagsToRemoveData.length > 0) {
				const tagIdsToRemove = tagsToRemoveData.map((tag) => tag.id);

				// Remove relationships for these tags
				const { error: removeError } = await supabase
					.from('posts_tags_rel')
					.delete()
					.eq('post_id', postId)
					.in('tag_id', tagIdsToRemove);

				if (removeError) {
					console.error('Error removing tag relationships:', removeError);
					// Don't return here, continue with adding tags
				}
			}
		}

		// Add new tags
		if (tagsToAdd.length > 0) {
			const result = await addTagsToPost(supabase, postId, tagsToAdd);
			if (result.error) {
				return result;
			}
		}

		return { error: null };
	} catch (error) {
		console.error('Error updating post tags:', error);
		return { error };
	}
}

// Cache for most used tags
let mostUsedTagsCache: { data: string[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get the most used tags based on their frequency in posts
 * Returns the top 5 most used tags ordered by frequency
 * Implements caching to improve performance
 */
export async function getMostUsedTags(supabase: SupabaseClient, limit: number = 5) {
	// Check if we have valid cached data
	const now = Date.now();
	if (mostUsedTagsCache && now - mostUsedTagsCache.timestamp < CACHE_DURATION) {
		return { data: mostUsedTagsCache.data, error: null };
	}

	// More efficient approach: Use a simpler query that should work
	// Get all tags with their usage counts
	const { data, error } = await supabase
		.from('posts_tags_rel')
		.select(
			`
			tag_id,
			post_tags(tag_name)
		`
		)
		.order('tag_id');

	if (error) {
		console.error('Error fetching most used tags:', error);
		return { data: [], error };
	}

	// Process the data to count occurrences and get top tags
	const tagCounts: { [key: string]: { name: string; count: number } } = {};

	// Count occurrences of each tag
	data.forEach((item: any) => {
		const tagName = item.post_tags?.tag_name;
		if (tagName) {
			if (tagCounts[tagName]) {
				tagCounts[tagName].count++;
			} else {
				tagCounts[tagName] = { name: tagName, count: 1 };
			}
		}
	});

	// Sort by count and take the top N
	const sortedTags = Object.values(tagCounts)
		.sort((a, b) => b.count - a.count)
		.slice(0, limit)
		.map((tag) => tag.name);

	// Update cache
	mostUsedTagsCache = { data: sortedTags, timestamp: now };

	return { data: sortedTags, error: null };
}

/**
 * Update post tags using a database function for atomic operations
 * This function replaces all existing tags with the new set of tags
 * @param supabase Supabase client instance
 * @param postId The ID of the post to update tags for
 * @param tagNames Array of tag names to set for the post
 * @returns Object with error property (null if successful)
 */
export async function updatePostTagsWithFunction(
	supabase: SupabaseClient,
	postId: number,
	tagNames: string[]
) {
	try {
		const { error } = await supabase.rpc('update_post_tags', {
			post_id_param: postId,
			tag_names: tagNames
		});

		return { error };
	} catch (error) {
		console.error('Error updating post tags via function:', error);
		return { error };
	}
}
