import { writable } from 'svelte/store';

export interface MostUsedTags {
	tags: string[];
}

// Create a writable store for most used tags
export const mostUsedTags = writable<MostUsedTags>({ tags: [] });

// Helper function to update most used tags
export function updateMostUsedTags(tags: string[]) {
	mostUsedTags.set({ tags });
}
