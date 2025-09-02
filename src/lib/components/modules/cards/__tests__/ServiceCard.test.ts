import { describe, it, expect } from 'vitest';
import { getServiceTags } from '$lib/utils/serviceCategories';

describe('getServiceTags', () => {
	it('should extract category names from service data', () => {
		const service = {
			services_category_rel: [
				{
					services_category: {
						category_name: 'Category 1'
					}
				},
				{
					services_category: {
						category_name: 'Category 2'
					}
				}
			]
		};

		const tags = getServiceTags(service);
		expect(tags).toEqual(['Category 1', 'Category 2']);
	});

	it('should return empty array when no categories exist', () => {
		const service = {};
		const tags = getServiceTags(service);
		expect(tags).toEqual([]);
	});

	it('should handle null or undefined services', () => {
		expect(getServiceTags(null)).toEqual([]);
		expect(getServiceTags(undefined)).toEqual([]);
	});
});