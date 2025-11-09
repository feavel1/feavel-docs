import { query } from '$app/server';
import { z } from 'zod/v4';
import { supabase } from '$lib/server/supabase';
import type { Tables } from '$lib/types/database.types';

// Define types based on the data model
export type Service = Tables<'services'> & {
	studios?: {
		name: string | null;
		description: string | null;
		contact_phone: string | null;
	} | null;
	services_category_rel?:
		| {
				services_category: {
					category_name: string;
				} | null;
		  }[]
		| null;
	service_downloads?:
		| {
				preview_file_id: string | null;
				product_file_id: string | null;
		  }[]
		| null;
};

export type Category = Tables<'services_category'>;

/**
 * Fetch a service with all related data
 */
export const getService = query(z.string(), async (serviceId) => {
	try {
		const { data: service, error } = await supabase
			.from('services')
			.select(
				`
				*,
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
			.eq('id', serviceId)
			.eq('enabled', true)
			.single();

		if (error) {
			console.error('Database error in getService:', error);
			return null;
		}

		return service as Service;
	} catch (error) {
		console.error('Unexpected error in getService:', error);
		return null;
	}
});

/**
 * Fetch all service categories with related data
 */
export const getServiceCategories = query(async () => {
	try {
		const { data: categories, error } = await supabase
			.from('services_category')
			.select('id, category_name')
			.order('category_name');

		if (error) {
			console.error('Database error in getServiceCategories:', error);
			return [];
		}

		return categories as Category[];
	} catch (error) {
		console.error('Unexpected error in getServiceCategories:', error);
		return [];
	}
});

/**
 * Fetch service with file download information
 */
export const getServiceFiles = query(z.string(), async (serviceId) => {
	try {
		const { data: service, error } = await supabase
			.from('services')
			.select(
				`
				id,
				type,
				service_downloads (
					preview_file_id,
					product_file_id
				)
			`
			)
			.eq('id', serviceId)
			.eq('enabled', true)
			.single();

		if (error) {
			console.error('Database error in getServiceFiles:', error);
			return null;
		}

		return service as Service;
	} catch (error) {
		console.error('Unexpected error in getServiceFiles:', error);
		return null;
	}
});

/**
 * Check if user has access to a service
 */
export const checkServiceAccess = query(
	z.object({
		serviceId: z.string(),
		userId: z.string()
	}),
	async ({ serviceId, userId }) => {
		try {
			// Check if user has purchased the service
			const { data: purchase, error: purchaseError } = await supabase
				.from('digital_order')
				.select('id')
				.eq('service_id', serviceId)
				.eq('user_id', userId)
				.eq('status', 'paid')
				.maybeSingle();

			if (purchaseError) {
				console.error('Database error in checkServiceAccess:', purchaseError);
				return false;
			}

			return !!purchase;
		} catch (error) {
			console.error('Unexpected error in checkServiceAccess:', error);
			return false;
		}
	}
);
