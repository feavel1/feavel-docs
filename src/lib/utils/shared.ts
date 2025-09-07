import type { SupabaseClient } from '@supabase/supabase-js';

// Generic cache interface
interface GenericCache<T> {
	data: T;
	timestamp: number;
}

// Generic cache map
const genericCache = new Map<string, GenericCache<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Generic function to get cached data or fetch new data
 * @param cacheKey Unique key for caching
 * @param fetchFn Function to fetch data if not cached
 * @returns Cached or fresh data
 */
export async function getCachedData<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
	const cached = genericCache.get(cacheKey);
	const now = Date.now();

	// Check if we have valid cached data
	if (cached && now - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}

	// Fetch fresh data
	const data = await fetchFn();

	// Update cache
	genericCache.set(cacheKey, { data, timestamp: now });

	return data;
}

/**
 * Clear cache for a specific key
 * @param cacheKey The cache key to clear
 */
export function clearCache(cacheKey: string): void {
	genericCache.delete(cacheKey);
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
	genericCache.clear();
}

/**
 * Generic function to get most used items based on their frequency in relationships
 * @param supabase Supabase client instance
 * @param options Configuration options for the query
 * @returns Array of most used item names
 */
export async function getMostUsedItems(
	supabase: SupabaseClient,
	options: {
		relationshipTable: string;
		foreignKey: string;
		nameField: string;
		limit?: number;
		cacheKey: string;
	}
): Promise<string[]> {
	const { relationshipTable, foreignKey, nameField, limit = 5, cacheKey } = options;

	return getCachedData<string[]>(cacheKey, async () => {
		// Get all items with their usage counts
		// Using proper Supabase relationship syntax with !inner join
		const { data, error } = await supabase
			.from(relationshipTable)
			.select(`${foreignKey}!inner(${nameField})`);

		if (error) {
			console.error(`Error fetching most used items from ${relationshipTable}:`, error);
			return [];
		}

		// Process the data to count occurrences and get top items
		const itemCounts: { [key: string]: { name: string; count: number } } = {};

		// Count occurrences of each item
		data.forEach((item: any) => {
			const itemName = item[foreignKey]?.[nameField];
			if (itemName) {
				if (itemCounts[itemName]) {
					itemCounts[itemName].count++;
				} else {
					itemCounts[itemName] = { name: itemName, count: 1 };
				}
			}
		});

		// Sort by count and take the top N
		return Object.values(itemCounts)
			.sort((a, b) => b.count - a.count)
			.slice(0, limit)
			.map((item) => item.name);
	});
}
