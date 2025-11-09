import type { PageServerLoad } from './$types';
import { getServiceCategories } from '$lib/remote/services.remote';

export const load: PageServerLoad = async ({ parent }) => {
	// Get parent data
	const parentData = await parent();

	// Fetch categories for filtering using remote function
	const categories = await getServiceCategories();

	return {
		...parentData,
		categories
	};
};
