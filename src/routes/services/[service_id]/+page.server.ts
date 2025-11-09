import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getService, checkServiceAccess } from '$lib/remote/services.remote';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { service_id } = params;
	const { session } = await parent();

	if (!service_id) {
		throw error(404, 'Service not found');
	}

	// Fetch the service with related data including download files using remote function
	const service = await getService(service_id);

	if (!service) {
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

	// Check if user has purchased the service (for download-type services) using remote function
	let canAccessProduct: boolean = false;
	if (service.type === 'download' && session?.user?.id) {
		canAccessProduct = await checkServiceAccess({
			serviceId: service_id,
			userId: session.user.id
		});
	}

	return {
		service,
		previewFileId,
		canAccessProduct
	};
};
