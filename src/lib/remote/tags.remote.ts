import { query } from '$app/server';
import { z } from 'zod/v4';
import { supabase } from '$lib/server/supabase';
import type { Tables } from '$lib/types/database.types';

export type Tag = Tables<'posts_tags'>;

/**
 * Fetch all tags with optimization
 */
export const getAllTags = query(async () => {
	try {
		const { data: tags, error } = await supabase
			.from('posts_tags')
			.select('id, tag_name')
			.order('tag_name');

		if (error) {
			console.error('Database error in getAllTags:', error);
			return [];
		}

		return tags as Tag[];
	} catch (error) {
		console.error('Unexpected error in getAllTags:', error);
		return [];
	}
});

/**
 * Validate input against a schema
 */
export const validateInput = query(
	z.object({
		value: z.any(),
		schema: z.any()
	}),
	async ({ value, schema }) => {
		try {
			// In a real implementation, this would validate the input against the schema
			// For now, we'll just return true as a placeholder
			void value;
			void schema;
			return true;
		} catch (error) {
			console.error('Error in validateInput:', error);
			return false;
		}
	}
);

/**
 * Paginate results
 */
export const paginateResults = query(
	z.object({
		data: z.array(z.any()),
		page: z.number(),
		limit: z.number()
	}),
	async ({ data, page, limit }) => {
		try {
			const startIndex = (page - 1) * limit;
			const endIndex = startIndex + limit;
			return data.slice(startIndex, endIndex);
		} catch (error) {
			console.error('Error in paginateResults:', error);
			return [];
		}
	}
);

/**
 * Handle database error
 */
export const handleDatabaseError = query(z.any(), async (error) => {
	try {
		console.error('Database error:', error);
		return { success: false, error: 'Database error occurred' };
	} catch (err) {
		console.error('Error in handleDatabaseError:', err);
		return { success: false, error: 'Internal server error' };
	}
});
