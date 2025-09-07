/**
 * Utility functions for tag handling
 * Wrapper around generic relationship manager
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
	getAllItems,
	getItemsForEntity,
	addItemsToEntity,
	removeItemsFromEntity,
	updateEntityItems,
	updateEntityItemsWithFunction,
	stringsToObjects,
	cleanItemName,
	isValidItemName,
	extractNamesFromRelations
} from '$lib/utils/relationshipManager';

// Configuration for tags
const tagConfig = {
	itemsTable: 'post_tags',
	relationsTable: 'posts_tags_rel',
	itemIdColumn: 'tag_id',
	itemNameColumn: 'tag_name',
	entityIdColumn: 'post_id',
	foreignTableName: 'post_tags',
	foreignTableAlias: 'post_tags',
	cacheKey: 'all_tags'
};

export interface Tag {
	id: number;
	tag_name: string;
}

/**
 * Convert string tags to Tag objects for MultiTagSelect component
 */
export function stringTagsToObjects(tags: string[]): Tag[] {
	return stringsToObjects(tags).map(item => ({
		id: item.id,
		tag_name: item.name
	}));
}

/**
 * Extract tag names from post relationships
 */
export function extractTagNamesFromRelations(relations: any[]): string[] {
	return extractNamesFromRelations(relations, 'post_tags.tag_name');
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
	return getItemsForEntity(supabase, postId, tagConfig);
}

/**
 * Add tags to a post
 */
export async function addTagsToPost(supabase: SupabaseClient, postId: number, tagNames: string[]) {
	return addItemsToEntity(supabase, postId, tagNames, tagConfig);
}

/**
 * Remove all tags from a post
 */
export async function removeTagsFromPost(supabase: SupabaseClient, postId: number) {
	return removeItemsFromEntity(supabase, postId, tagConfig);
}

/**
 * Update tags for a post
 */
export async function updatePostTags(supabase: SupabaseClient, postId: number, tagNames: string[]) {
	return updateEntityItems(supabase, postId, tagNames, tagConfig);
}

/**
 * Update post tags using a database function for atomic operations
 * This function replaces all existing tags with the new set of tags
 */
export async function updatePostTagsWithFunction(
	supabase: SupabaseClient,
	postId: number,
	tagNames: string[]
) {
	return updateEntityItemsWithFunction(
		supabase,
		postId,
		tagNames,
		'update_post_tags',
		'post_id_param',
		'tag_names'
	);
}

/**
 * Get all tags with caching
 */
export async function getAllTags(supabase: SupabaseClient) {
	return getAllItems(supabase, tagConfig);
}

/**
 * Validate and clean tag names
 */
export function cleanTagName(tagName: string): string {
	return cleanItemName(tagName);
}

/**
 * Check if tag name is valid
 */
export function isValidTagName(tagName: string): boolean {
	return isValidItemName(tagName);
}