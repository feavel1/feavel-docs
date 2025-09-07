import type { SupabaseClient } from '@supabase/supabase-js';
import { getCachedData } from '$lib/utils/shared';

/**
 * Generic utility functions for managing many-to-many relationships
 */

export interface RelationshipItem {
	id: number;
	name: string;
}

export interface RelationshipConfig {
	// Table names
	itemsTable: string;        // e.g., 'post_tags' or 'services_category'
	relationsTable: string;    // e.g., 'posts_tags_rel' or 'services_category_rel'
	
	// Column names
	itemIdColumn: string;      // e.g., 'tag_id' or 'category_id'
	itemNameColumn: string;    // e.g., 'tag_name' or 'category_name'
	entityIdColumn: string;    // e.g., 'post_id' or 'service_id'
	
	// Foreign key relationship
	foreignTableName: string;  // e.g., 'post_tags' or 'services_category'
	foreignTableAlias: string; // e.g., 'post_tags' or 'services_category'
	
	// Cache key for getAllItems
	cacheKey: string;
}

/**
 * Convert string items to RelationshipItem objects
 */
export function stringsToObjects(items: string[]): RelationshipItem[] {
	return items.map((item, index) => ({ id: index, name: item }));
}

/**
 * Extract item names from relationships
 */
export function extractNamesFromRelations(relations: any[], itemNameField: string): string[] {
	return relations?.map((rel) => rel[itemNameField]) || [];
}

/**
 * Validate and clean item names
 */
export function cleanItemName(itemName: string): string {
	return itemName.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Check if item name is valid
 */
export function isValidItemName(itemName: string): boolean {
	return itemName.trim().length > 0 && itemName.trim().length <= 50;
}

/**
 * Get all items with caching
 */
export async function getAllItems(
	supabase: SupabaseClient,
	config: RelationshipConfig
) {
	return getCachedData<string[]>(config.cacheKey, async () => {
		const { data, error } = await supabase
			.from(config.itemsTable)
			.select(config.itemNameColumn)
			.order(config.itemNameColumn);

		if (error) {
			console.error(`Error fetching ${config.itemsTable}:`, error);
			return [];
		}

		// Extract item names
		return data.map((item: any) => item[config.itemNameColumn]).filter(Boolean);
	});
}

/**
 * Get items for a specific entity
 */
export async function getItemsForEntity(
	supabase: SupabaseClient,
	entityId: number,
	config: RelationshipConfig
) {
	const { data, error } = await supabase
		.from(config.relationsTable)
		.select(
			`
			${config.itemIdColumn},
			${config.foreignTableAlias}!inner(id, ${config.itemNameColumn})
			`
		)
		.eq(config.entityIdColumn, entityId);

	return { data, error };
}

/**
 * Add items to an entity
 */
export async function addItemsToEntity(
	supabase: SupabaseClient,
	entityId: number,
	itemNames: string[],
	config: RelationshipConfig
) {
	try {
		// First, ensure all items exist in the items table
		for (const itemName of itemNames) {
			// Try to insert the item (will fail if it already exists, which is fine)
			await supabase.from(config.itemsTable).upsert(
				{ [config.itemNameColumn]: itemName },
				{
					onConflict: config.itemNameColumn
				}
			);
		}

				// Get item IDs
		const { data: itemData } = await supabase
			.from(config.itemsTable)
			.select(`id, ${config.itemNameColumn}`)
			.in(config.itemNameColumn, itemNames);

		if (itemData && itemData.length > 0) {
			// Create relationships
			const relationships = itemData.map((item: any) => ({
				[config.entityIdColumn]: entityId,
				[config.itemIdColumn]: item.id
			}));

			// Insert relationships (ignore duplicates)
			const { error } = await supabase.from(config.relationsTable).insert(relationships);

			return { error };
		}

		return { error: null };
	} catch (error) {
		console.error(`Error adding items to entity:`, error);
		return { error };
	}
}

/**
 * Remove all items from an entity
 */
export async function removeItemsFromEntity(
	supabase: SupabaseClient,
	entityId: number,
	config: RelationshipConfig
) {
	const { error } = await supabase
		.from(config.relationsTable)
		.delete()
		.eq(config.entityIdColumn, entityId);

	return { error };
}

/**
 * Update items for an entity (add new, remove old)
 */
export async function updateEntityItems(
	supabase: SupabaseClient,
	entityId: number,
	itemNames: string[],
	config: RelationshipConfig
) {
	try {
		// Get existing relationships for this entity
		const { data: existingRelations, error: fetchError } = await supabase
			.from(config.relationsTable)
			.select(`${config.itemIdColumn}, ${config.foreignTableAlias}(${config.itemNameColumn})`)
			.eq(config.entityIdColumn, entityId);

		if (fetchError) {
			console.error('Error fetching existing relationships:', fetchError);
			return { error: fetchError };
		}

		// Extract existing item names
		const existingItemNames =
			existingRelations
				?.map((rel) => (rel as any)[config.foreignTableAlias]?.[config.itemNameColumn])
				.filter(Boolean) || [];

		// Find items to add (in new list but not in existing)
		const itemsToAdd = itemNames.filter(
			(itemName) => !existingItemNames.includes(itemName)
		);

		// Find items to remove (in existing but not in new list)
		const itemsToRemove = existingItemNames.filter(
			(itemName) => !itemNames.includes(itemName)
		);

		// Remove items that are no longer needed
		if (itemsToRemove.length > 0) {
			// Get item IDs for items to remove
			const { data: itemsToRemoveData } = await supabase
				.from(config.itemsTable)
				.select('id')
				.in(config.itemNameColumn, itemsToRemove);

			if (itemsToRemoveData && itemsToRemoveData.length > 0) {
				const itemIdsToRemove = itemsToRemoveData.map((item: any) => item.id);

				// Remove relationships for these items
				const { error: removeError } = await supabase
					.from(config.relationsTable)
					.delete()
					.eq(config.entityIdColumn, entityId)
					.in(config.itemIdColumn, itemIdsToRemove);

				if (removeError) {
					console.error('Error removing relationships:', removeError);
					// Don't return here, continue with adding items
				}
			}
		}

		// Add new items
		if (itemsToAdd.length > 0) {
			const result = await addItemsToEntity(supabase, entityId, itemsToAdd, config);
			if (result.error) {
				return result;
			}
		}

		return { error: null };
	} catch (error) {
		console.error('Error updating entity items:', error);
		return { error };
	}
}

/**
 * Update entity items using a database function for atomic operations
 */
export async function updateEntityItemsWithFunction(
	supabase: SupabaseClient,
	entityId: number,
	itemNames: string[],
	functionName: string,
	entityIdParam: string,
	itemNamesParam: string
) {
	try {
		const { error } = await supabase.rpc(functionName, {
			[entityIdParam]: entityId,
			[itemNamesParam]: itemNames
		});

		return { error };
	} catch (error) {
		console.error('Error updating entity items via function:', error);
		return { error };
	}
}