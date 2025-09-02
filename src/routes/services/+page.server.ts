import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();

	// Fetch services with related data including categories
	const { data: services, error: servicesError } = await locals.supabase
		.from('services_v2')
		.select(
			`
			id,
			name,
			price,
			cover_url,
			highlights,
			service_type,
			status,
			created_at,
			created_by,
			studios!services_v2_created_by_fkey(name),
			services_category_rel(
				services_category!inner(category_name)
			)
		`
		)
		.eq('enabled', true)
		.order('created_at', { ascending: false });

	// Fetch categories for filtering
	const { data: categories, error: categoriesError } = await locals.supabase
		.from('services_category')
		.select('id, category_name')
		.order('category_name');

	if (servicesError) {
		console.error('Error fetching services:', servicesError);
	}

	if (categoriesError) {
		console.error('Error fetching categories:', categoriesError);
	}

	return {
		session,
		services: services || [],
		categories: categories || []
	};
};
