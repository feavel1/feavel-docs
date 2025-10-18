import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, parent }) => {
	const { service_id } = params;
	const { session } = await parent();

	if (!service_id) {
		throw error(404, 'Service not found');
	}

	// Fetch the service with related data including download files
	const { data: service, error: serviceError } = await locals.supabase
		.from('services')
		.select(
			`*,
			studios!services_created_by_fkey(name, description, contact_phone),
			services_category_rel(
				services_category!inner(category_name)
			),
			service_downloads (
				preview_file_id,
				product_file_id
			)
		`
		)
		.eq('id', service_id)
		.eq('enabled', true)
		.single();

	if (serviceError || !service) {
		throw error(404, 'Service not found');
	}

	// Extract file information from the joined data
	let previewFileId: string | null = null;

	if ('service_downloads' in service && Array.isArray(service.service_downloads)) {
		const downloadRecord = service.service_downloads[0];
		if (downloadRecord) {
			previewFileId = downloadRecord.preview_file_id || null;
		}
	}

	// Check if user has purchased the service (for download-type services)
	let canAccessProduct: boolean = false;
	if (service.type === 'download' && session?.user?.id) {
		const { data: purchase, error: purchaseError } = await locals.supabase
			.from('digital_order')
			.select('id')
			.eq('service_id', service_id)
			.eq('user_id', session.user.id)
			.eq('status', 'paid')
			.maybeSingle();

		if (!purchaseError && purchase) {
			canAccessProduct = true;
		}
	}

	return {
		service,
		previewFileId,
		canAccessProduct
	};
};
