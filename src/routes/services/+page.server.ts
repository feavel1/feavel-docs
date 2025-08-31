import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();

	// Fetch services with related data
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
			created_at
		`
		)
		.eq('enabled', true)
		.order('created_at', { ascending: false });

	if (servicesError) {
		console.error('Error fetching services:', servicesError);
	}

	return {
		session,
		services: services || []
	};
};
