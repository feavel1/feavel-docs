import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	// Get parent data (including Supabase client)
	const parentData = await parent();

	// Fetch categories for filtering
	const { data: categories, error: categoriesError } = await locals.supabase
		.from('services_category')
		.select('id, category_name')
		.order('category_name');

	if (categoriesError) {
		console.error('Error fetching categories:', categoriesError);
	}

	return {
		...parentData,
		categories: categories || []
	};
};
