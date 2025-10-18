import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createService } from '$lib/utils/services';

export const load: PageServerLoad = async ({ params, locals, parent }) => {
	const { service_id } = params;
	const { session, studio } = await parent();

	if (!session) {
		throw redirect(302, '/auth/login');
	}

	if (!studio || (studio.status !== 'applied' && studio.status !== 'approved')) {
		throw error(403, 'Access denied. You must be a studio to manage services.');
	}

	// Handle new service creation
	if (service_id === 'new') {
		// Create a minimal draft service immediately
		const result = await createService(
			locals.supabase,
			studio.id,
			{
				name: 'New Service',
				price: 0,
				description: '',
				type: 'video', // Default to 'video' instead of empty string
				highlights: [],
				cover_file_id: null
			}
		);
		const newService = result.data;
		const createError = result.error;

		if (createError || !newService) {
			throw error(500, 'Failed to create new service');
		}

		// Redirect to the new service
		throw redirect(302, `/studios/dashboard/services/${newService.id}`);
	}

	// Handle existing service loading
	const { data: service, error: serviceError } = await locals.supabase
		.from('services')
		.select('*')
		.eq('id', service_id)
		.eq('created_by', studio.id)
		.single();

	if (serviceError || !service) {
		throw error(404, 'Service not found or access denied');
	}

	return {
		service,
		studio
	};
};
