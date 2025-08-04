import { writable } from 'svelte/store';

export interface Tag {
	id: number;
	tag_name: string;
}

// Create a writable store for available tags
export const availableTags = writable<Tag[]>([]);

// Helper function to add a new tag to the store
export function addNewTag(tagName: string) {
	availableTags.update((tags) => {
		// Check if tag already exists
		const exists = tags.some((tag) => tag.tag_name === tagName);
		if (!exists) {
			// Add new tag with a unique ID
			const newId = Math.max(...tags.map((t) => t.id), -1) + 1;
			return [...tags, { id: newId, tag_name: tagName }];
		}
		return tags;
	});
}

// Helper function to initialize tags from server data
export function initializeTags(tagNames: string[]) {
	const tags = tagNames.map((tagName, index) => ({ id: index, tag_name: tagName }));
	availableTags.set(tags);
}

// Helper function to get tag names as strings
export function getTagNames(tags: Tag[]): string[] {
	return tags.map((tag) => tag.tag_name);
}
