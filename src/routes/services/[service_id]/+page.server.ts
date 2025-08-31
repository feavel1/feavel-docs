import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { service_id } = params;

	const { session } = await locals.safeGetSession();

	if (!service_id) {
		throw error(404, 'Service not found');
	}

	// Fetch the service with related data
	const { data: service, error: serviceError } = await locals.supabase
		.from('services_v2')
		.select(`
			id,
			name,
			price,
			description,
			cover_url,
			highlights,
			service_type,
			status,
			created_at,
			created_by,
			studios!inner(name, description, contact_phone)
		`)
		.eq('id', service_id)
		.eq('enabled', true)
		.single();

	if (serviceError || !service) {
		throw error(404, 'Service not found');
	}

	return {
		service,
		session
	};
};