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
			await supabase.from('post_tags').insert({ tag_name: tagName }).select().single();
		}

		// Get tag IDs
		const { data: tagData } = await supabase
			.from('post_tags')
			.select('id, tag_name')
			.in('tag_name', tagNames);

		if (tagData) {
			// Create relationships
			const relationships = tagData.map((tag) => ({
				post_id: postId,
				tag_id: tag.id
			}));

			const { error } = await supabase.from('posts_tags_rel').insert(relationships);

			return { error };
		}

		return { error: null };
	} catch (error) {
		return { error };
	}
}

export async function removeTagsFromPost(supabase: SupabaseClient, postId: number) {
	const { error } = await supabase.from('posts_tags_rel').delete().eq('post_id', postId);

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
