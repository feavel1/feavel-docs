import { writable } from 'svelte/store';

export interface MostUsedCategories {
	categories: string[];
}

// Create a writable store for most used categories
export const mostUsedCategories = writable<MostUsedCategories>({ categories: [] });

// Helper function to update most used categories
export function updateMostUsedCategories(categories: string[]) {
	mostUsedCategories.set({ categories });
}
