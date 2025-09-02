import { writable } from 'svelte/store';

export interface Tag {
	id: number;
	tag_name: string;
}

// Validation functions
function isValidTagName(tagName: string): boolean {
	if (!tagName || typeof tagName !== 'string') return false;
	// Trim whitespace and check length
	const trimmed = tagName.trim();
	return trimmed.length > 0 && trimmed.length <= 50;
}

function sanitizeTagName(tagName: string): string {
	return tagName.trim().replace(/\s+/g, ' ');
}

// Create a writable store for available tags
export const availableTags = writable<Tag[]>([]);

// Helper function to add a new tag to the store with validation
export function addNewTag(tagName: string): boolean {
	// Validate tag name
	if (!isValidTagName(tagName)) {
		console.warn('Invalid tag name:', tagName);
		return false;
	}

	const sanitizedTagName = sanitizeTagName(tagName);

	availableTags.update((tags) => {
		// Check if tag already exists (case insensitive)
		const exists = tags.some(
			(tag) => tag.tag_name.toLowerCase() === sanitizedTagName.toLowerCase()
		);

		if (!exists) {
			// Add new tag with a unique ID
			const newId = tags.length > 0 ? Math.max(...tags.map((t) => t.id)) + 1 : 1;
			return [...tags, { id: newId, tag_name: sanitizedTagName }];
		}

		return tags;
	});

	return true;
}

// Helper function to initialize tags from server data with validation
export function initializeTags(tagNames: string[]): void {
	if (!Array.isArray(tagNames)) {
		console.warn('Invalid tag names array provided to initializeTags');
		availableTags.set([]);
		return;
	}

	const validTags = tagNames
		.filter(isValidTagName)
		.map(sanitizeTagName)
		.filter(
			(tagName, index, arr) =>
				arr.findIndex((t) => t.toLowerCase() === tagName.toLowerCase()) === index
		);

	const tags = validTags.map((tagName, index) => ({
		id: index + 1,
		tag_name: tagName
	}));

	availableTags.set(tags);
}

// Helper function to get tag names as strings
export function getTagNames(tags: Tag[]): string[] {
	if (!Array.isArray(tags)) return [];
	return tags.map((tag) => tag.tag_name);
}

// Helper function to check if a tag exists
export function tagExists(tagName: string): boolean {
	if (!isValidTagName(tagName)) return false;

	let exists = false;
	const sanitizedTagName = sanitizeTagName(tagName);

	availableTags.subscribe((tags) => {
		exists = tags.some((tag) => tag.tag_name.toLowerCase() === sanitizedTagName.toLowerCase());
	})();

	return exists;
}
