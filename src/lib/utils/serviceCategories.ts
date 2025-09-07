import type { SupabaseClient } from '@supabase/supabase-js';
import {
	getAllItems,
	getItemsForEntity,
	addItemsToEntity,
	removeItemsFromEntity,
	updateEntityItems,
	stringsToObjects,
	cleanItemName,
	isValidItemName,
	extractNamesFromRelations
} from '$lib/utils/relationshipManager';

/**
 * Utility functions for service category handling
 * Wrapper around generic relationship manager
 */

// Configuration for service categories
const categoryConfig = {
	itemsTable: 'services_category',
	relationsTable: 'services_category_rel',
	itemIdColumn: 'category_id',
	itemNameColumn: 'category_name',
	entityIdColumn: 'service_id',
	foreignTableName: 'services_category',
	foreignTableAlias: 'services_category',
	cacheKey: 'all_service_categories'
};

export interface ServiceCategory {
	id: number;
	category_name: string;
}

/**
 * Convert string categories to ServiceCategory objects for MultiCategorySelect component
 */
export function stringCategoriesToObjects(categories: string[]): ServiceCategory[] {
	return stringsToObjects(categories).map(item => ({
		id: item.id,
		category_name: item.name
	}));
}

/**
 * Extract category names from service relationships
 */
export function extractCategoryNamesFromRelations(relations: any[]): string[] {
	return extractNamesFromRelations(relations, 'services_category.category_name');
}

/**
 * Get service tags (categories) from service data
 * Equivalent to getPostTags for posts but for services
 */
export function getServiceTags(service: any): string[] {
	if (!service) return [];
	return (
		service.services_category_rel?.map((rel: any) => rel.services_category.category_name) || []
	);
}

/**
 * Validate and clean category names
 */
export function cleanCategoryName(categoryName: string): string {
	return cleanItemName(categoryName);
}

/**
 * Check if category name is valid
 */
export function isValidCategoryName(categoryName: string): boolean {
	return isValidItemName(categoryName);
}

/**
 * Get all service categories
 */
export async function getServiceCategories(supabase: SupabaseClient) {
	const { data, error } = await supabase
		.from('services_category')
		.select('id, category_name')
		.order('category_name');

	return { data, error };
}

/**
 * Get categories for a specific service
 */
export async function getServiceCategoriesForService(supabase: SupabaseClient, serviceId: number) {
	return getItemsForEntity(supabase, serviceId, categoryConfig);
}

/**
 * Add categories to a service
 */
export async function addCategoriesToService(
	supabase: SupabaseClient,
	serviceId: number,
	categoryNames: string[]
) {
	return addItemsToEntity(supabase, serviceId, categoryNames, categoryConfig);
}

/**
 * Remove all categories from a service
 */
export async function removeCategoriesFromService(supabase: SupabaseClient, serviceId: number) {
	return removeItemsFromEntity(supabase, serviceId, categoryConfig);
}

/**
 * Update categories for a service
 */
export async function updateServiceCategories(
	supabase: SupabaseClient,
	serviceId: number,
	categoryNames: string[]
) {
	return updateEntityItems(supabase, serviceId, categoryNames, categoryConfig);
}

/**
 * Get all service categories with caching
 */
export async function getAllServiceCategories(supabase: SupabaseClient) {
	return getAllItems(supabase, categoryConfig);
}