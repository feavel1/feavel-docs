import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createService, updateService, updateServiceCategories } from '$lib/utils/services';
import { fail } from '@sveltejs/kit';
import { setError, superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { serviceSchema } from './+page.svelte';

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
		const result = await createService(locals.supabase, studio.id, {
			name: 'New Service',
			price: 0,
			description: '',
			type: 'video', // Default to 'video' instead of empty string
			highlights: [],
			cover_file_id: null
		});
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
		.select(
			`
			*,
			services_category_rel(
				services_category!inner(category_name)
			)
		`
		)
		.eq('id', service_id)
		.eq('created_by', studio.id)
		.single();

	if (serviceError || !service) {
		throw error(404, 'Service not found or access denied');
	}

	// Fetch all available categories for the MultiSelect component
	const { data: categories } = await locals.supabase
		.from('services_category')
		.select('id, category_name')
		.order('category_name');

	// Prepare initial form data from service
	// Ensure highlights is always an array of strings
	const serviceHighlights = Array.isArray(service?.highlights)
		? service.highlights
		: typeof service?.highlights === 'string'
			? JSON.parse(service.highlights)
			: [];

	// Handle description which might be Json type from database
	const serviceDescription = service?.description
		? typeof service.description === 'string'
			? service.description
			: JSON.stringify(service.description)
		: '';

	// Use the actual service type if it exists, otherwise default to 'video' for new services
	const serviceType = service?.type || 'video';

	// Extract categories from service data
	const serviceCategories = service?.services_category_rel
		? service.services_category_rel.map((rel: any) => rel.services_category.category_name)
		: [];

	const initialFormData = {
		id: service?.id,
		name: service?.name || '',
		price: service?.price || 0,
		description: serviceDescription,
		type: serviceType,
		highlights: serviceHighlights || [],
		categories: serviceCategories || [],
		cover_file_id: service?.cover_file_id || null
	};

	return {
		service,
		studio,
		categories: categories || [],
		form: await superValidate(initialFormData, zod4(serviceSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { locals, params } = event;
		const { session } = await locals.safeGetSession();
		const service_id = params.service_id;

		// Check if user is logged in
		if (!session) {
			throw redirect(303, '/auth/login');
		}

		// Load studio data (similar to how it's done in the load function)
		const { data: studio } = await locals.supabase
			.from('studios')
			.select('id, status')
			.eq('user_id', session.user.id)
			.maybeSingle();

		// Check if user is a studio
		if (!studio || (studio.status !== 'applied' && studio.status !== 'approved')) {
			return fail(403, { error: 'Access denied. You must be a studio to manage services.' });
		}

		// Validate form data
		const form = await superValidate(event, zod4(serviceSchema));

		// Check if form is valid
		if (!form.valid) {
			return fail(400, { form });
		}

		// Check for duplicate service name (example of field-specific error)
		const { data: existingService, error: existingServiceError } = await locals.supabase
			.from('services')
			.select('id')
			.eq('name', form.data.name)
			.eq('created_by', studio.id)
			.neq('id', service_id) // Exclude current service from check
			.maybeSingle();

		if (existingService && !existingServiceError) {
			return setError(form, 'name', 'A service with this name already exists');
		}

		// Update service
		const result = await updateService(locals.supabase, studio.id, service_id, {
			name: form.data.name,
			price: form.data.price,
			description: form.data.description || null,
			type: form.data.type,
			highlights: form.data.highlights,
			cover_file_id: form.data.cover_file_id || null
		});

		if (!result.success) {
			// Set a general form error for display
			return setError(form, '', result.error || 'Failed to update service');
		}

		// Update service categories
		const categoryResult = await updateServiceCategories(
			locals.supabase,
			service_id,
			form.data.categories || []
		);

		if (categoryResult.error) {
			// Set a general form error for display
			return setError(form, '', 'Service saved but failed to update categories');
		}

		// Return success message
		return message(form, { type: 'success', text: 'Service saved successfully!' });
	}
};
