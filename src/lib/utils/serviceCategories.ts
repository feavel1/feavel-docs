import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Utility functions for service category handling
 */

export interface ServiceCategory {
	id: number;
	category_name: string;
}

/**
 * Convert string categories to ServiceCategory objects for MultiCategorySelect component
 */
export function stringCategoriesToObjects(categories: string[]): ServiceCategory[] {
	return categories.map((category, index) => ({ id: index, category_name: category }));
}

/**
 * Extract category names from service relationships
 */
export function extractCategoryNamesFromRelations(relations: any[]): string[] {
	return relations?.map((rel) => rel.services_category.category_name) || [];
}

/**
 * Get service tags (categories) from service data
 * Equivalent to getPostTags for posts but for services
 */
export function getServiceTags(service: any): string[] {
	if (!service) return [];
	return service.services_category_rel?.map((rel: any) => rel.services_category.category_name) || [];
}

/**
 * Validate and clean category names
 */
export function cleanCategoryName(categoryName: string): string {
	return categoryName.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Check if category name is valid
 */
export function isValidCategoryName(categoryName: string): boolean {
	return categoryName.trim().length > 0 && categoryName.trim().length <= 50;
}

export async function getServiceCategories(supabase: SupabaseClient) {
	const { data, error } = await supabase
		.from('services_category')
		.select('id, category_name')
		.order('category_name');

	return { data, error };
}

export async function getServiceCategoriesForService(supabase: SupabaseClient, serviceId: number) {
	const { data, error } = await supabase
		.from('services_category_rel')
		.select(
			`
			category_id,
			services_category!inner(id, category_name)
		`
		)
		.eq('service_id', serviceId);

	return { data, error };
}

export async function addCategoriesToService(
	supabase: SupabaseClient,
	serviceId: number,
	categoryNames: string[]
) {
	try {
		// First, ensure all categories exist in the services_category table
		for (const categoryName of categoryNames) {
			// Try to insert the category (will fail if it already exists, which is fine)
			await supabase.from('services_category').upsert(
				{ category_name: categoryName },
				{
					onConflict: 'category_name'
				}
			);
		}

		// Get category IDs
		const { data: categoryData } = await supabase
			.from('services_category')
			.select('id, category_name')
			.in('category_name', categoryNames);

		if (categoryData && categoryData.length > 0) {
			// Create relationships
			const relationships = categoryData.map((category) => ({
				service_id: serviceId,
				category_id: category.id
			}));

			// Insert relationships (ignore duplicates)
			const { error } = await supabase.from('services_category_rel').insert(relationships);

			return { error };
		}

		return { error: null };
	} catch (error) {
		console.error('Error adding categories to service:', error);
		return { error };
	}
}

export async function removeCategoriesFromService(supabase: SupabaseClient, serviceId: number) {
	const { error } = await supabase
		.from('services_category_rel')
		.delete()
		.eq('service_id', serviceId);

	return { error };
}

export async function updateServiceCategories(
	supabase: SupabaseClient,
	serviceId: number,
	categoryNames: string[]
) {
	try {
		// Get existing category relationships for this service
		const { data: existingRelations, error: fetchError } = await supabase
			.from('services_category_rel')
			.select('category_id, services_category(category_name)')
			.eq('service_id', serviceId);

		if (fetchError) {
			console.error('Error fetching existing category relationships:', fetchError);
			return { error: fetchError };
		}

		// Extract existing category names
		const existingCategoryNames =
			existingRelations
				?.map((rel) => (rel as any).services_category?.category_name)
				.filter(Boolean) || [];

		// Find categories to add (in new list but not in existing)
		const categoriesToAdd = categoryNames.filter(
			(categoryName) => !existingCategoryNames.includes(categoryName)
		);

		// Find categories to remove (in existing but not in new list)
		const categoriesToRemove = existingCategoryNames.filter(
			(categoryName) => !categoryNames.includes(categoryName)
		);

		// Remove categories that are no longer needed
		if (categoriesToRemove.length > 0) {
			// Get category IDs for categories to remove
			const { data: categoriesToRemoveData } = await supabase
				.from('services_category')
				.select('id')
				.in('category_name', categoriesToRemove);

			if (categoriesToRemoveData && categoriesToRemoveData.length > 0) {
				const categoryIdsToRemove = categoriesToRemoveData.map((category) => category.id);

				// Remove relationships for these categories
				const { error: removeError } = await supabase
					.from('services_category_rel')
					.delete()
					.eq('service_id', serviceId)
					.in('category_id', categoryIdsToRemove);

				if (removeError) {
					console.error('Error removing category relationships:', removeError);
					// Don't return here, continue with adding categories
				}
			}
		}

		// Add new categories
		if (categoriesToAdd.length > 0) {
			const result = await addCategoriesToService(supabase, serviceId, categoriesToAdd);
			if (result.error) {
				return result;
			}
		}

		return { error: null };
	} catch (error) {
		console.error('Error updating service categories:', error);
		return { error };
	}
}

// Cache for service categories
let serviceCategoriesCache: { data: string[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get all service categories
 * Implements caching to improve performance
 */
export async function getAllServiceCategories(supabase: SupabaseClient) {
	// Check if we have valid cached data
	const now = Date.now();
	if (serviceCategoriesCache && now - serviceCategoriesCache.timestamp < CACHE_DURATION) {
		return { data: serviceCategoriesCache.data, error: null };
	}

	const { data, error } = await supabase
		.from('services_category')
		.select('category_name')
		.order('category_name');

	if (error) {
		console.error('Error fetching service categories:', error);
		return { data: [], error };
	}

	// Extract category names
	const categoryNames = data.map((item) => item.category_name).filter(Boolean);

	// Update cache
	serviceCategoriesCache = { data: categoryNames, timestamp: now };

	return { data: categoryNames, error: null };
}

// Cache for most used categories
let mostUsedCategoriesCache: { data: string[]; timestamp: number } | null = null;

/**
 * Get the most used categories based on their frequency in services
 * Returns the top 5 most used categories ordered by frequency
 * Implements caching to improve performance
 */
export async function getMostUsedCategories(supabase: SupabaseClient, limit: number = 5) {
	// Check if we have valid cached data
	const now = Date.now();
	if (mostUsedCategoriesCache && now - mostUsedCategoriesCache.timestamp < CACHE_DURATION) {
		return { data: mostUsedCategoriesCache.data, error: null };
	}

	// Get all categories with their usage counts
	const { data, error } = await supabase
		.from('services_category_rel')
		.select(
			`
			category_id,
			services_category(category_name)
		`
		)
		.order('category_id');

	if (error) {
		console.error('Error fetching most used categories:', error);
		return { data: [], error };
	}

	// Process the data to count occurrences and get top categories
	const categoryCounts: { [key: string]: { name: string; count: number } } = {};

	// Count occurrences of each category
	data.forEach((item: any) => {
		const categoryName = item.services_category?.category_name;
		if (categoryName) {
			if (categoryCounts[categoryName]) {
				categoryCounts[categoryName].count++;
			} else {
				categoryCounts[categoryName] = { name: categoryName, count: 1 };
			}
		}
	});

	// Sort by count and take the top N
	const sortedCategories = Object.values(categoryCounts)
		.sort((a, b) => b.count - a.count)
		.slice(0, limit)
		.map((category) => category.name);

	// Update cache
	mostUsedCategoriesCache = { data: sortedCategories, timestamp: now };

	return { data: sortedCategories, error: null };
}
