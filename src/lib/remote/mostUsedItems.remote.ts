import { prerender } from '$app/server';
import { supabase } from '$lib/server/supabase';

interface TagCount {
	name: string;
	count: number;
}

/**
 * Fetch most used tags for navigation
 * This function runs at build time only
 */
export const getMostUsedTags = prerender(async () => {
	// Get all tags with their usage counts
	const { data, error } = await supabase
		.from('posts_tags_rel')
		.select('posts_tags!inner(tag_name)');

	if (error) {
		console.error('Error fetching most used tags:', error);
		return [];
	}

	const tagCounts: Record<string, TagCount> = {};

	// Count occurrences of each tag
	data.forEach((item) => {
		// @ts-ignore - Supabase typing issue with nested relationships
		const tagName = item.posts_tags?.tag_name;
		if (tagName) {
			if (tagCounts[tagName]) {
				tagCounts[tagName].count++;
			} else {
				tagCounts[tagName] = { name: tagName, count: 1 };
			}
		}
	});

	// Sort by count and take the top 5
	return Object.values(tagCounts)
		.sort((a, b) => (b as TagCount).count - (a as TagCount).count)
		.slice(0, 5)
		.map((item) => (item as TagCount).name);
});

/**
 * Fetch most used categories for navigation
 * This function runs at build time only
 */
export const getMostUsedCategories = prerender(async () => {
	// Get all categories with their usage counts
	const { data, error } = await supabase
		.from('services_category_rel')
		.select('services_category!inner(category_name)');
	if (error) {
		console.error('Error fetching most used categories:', error);
		return [];
	}

	const categoryCounts: Record<string, TagCount> = {};
	data.forEach((item) => {
		// @ts-ignore - Supabase typing issue with nested relationships
		const categoryName = item.services_category?.category_name;
		if (categoryName) {
			if (categoryCounts[categoryName]) {
				categoryCounts[categoryName].count++;
			} else {
				categoryCounts[categoryName] = { name: categoryName, count: 1 };
			}
		}
	});
	// Sort by count and take the top 5
	return Object.values(categoryCounts)
		.sort((a, b) => (b as TagCount).count - (a as TagCount).count)
		.slice(0, 5)
		.map((item) => (item as TagCount).name);
});
