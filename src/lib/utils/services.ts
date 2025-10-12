import type { SupabaseClient } from '@supabase/supabase-js';
import type { Json } from '$lib/types/database.types';
import { uploadServiceCover } from './storage';

// Simplified service type
export interface Service {
	id: string;
	name: string;
	price: number;
	description: Json | null;
	cover_url: string | null;
	highlights: Json;
	type: string;
	status: string;
	created_at: string;
	created_by: number;
	studios?: {
		name: string;
		description: string;
		contact_phone: number;
	} | null;
	services_category_rel?: {
		services_category: {
			category_name: string;
		};
	}[];
}

interface ServiceFilters {
	selectedCategories: string[];
	searchQuery: string;
}

export function filterServices(services: Service[], filters: ServiceFilters): Service[] {
	let filtered = services;

	// Filter by search query
	if (filters.searchQuery) {
		const query = filters.searchQuery.toLowerCase();
		filtered = filtered.filter(
			(service) =>
				service.name?.toLowerCase().includes(query) || service.type?.toLowerCase().includes(query)
		);
	}

	return filtered;
}

export function getServiceCategories(_service: Service): string[] {
	return [];
}

export function formatServicePrice(price: number): string {
	return `$${price.toFixed(2)}`;
}

export function isServiceOwner(service: Service, studioId?: number): boolean {
	return service.created_by === studioId;
}

/**
 * Get the number of categories for a service
 * @param service The service object
 * @returns The number of categories
 */
export function getServiceCategoryCount(_service: Service): number {
	return 0;
}

// Service cover upload handler
export async function handleServiceCoverUpload(
	supabase: SupabaseClient,
	file: File
): Promise<string | null> {
	return await uploadServiceCover(supabase, file);
}

// Valid service types according to database enum
const VALID_SERVICE_TYPES = ['video', 'download', 'event', 'subscription'] as const;
type ServiceType = (typeof VALID_SERVICE_TYPES)[number];

// Create a new service
export async function createService(
	supabase: SupabaseClient,
	studioId: number,
	serviceData: {
		name: string;
		price: number;
		description: string | null;
		type: string;
		highlights: string[];
		cover_url: string | null;
	}
): Promise<{ service: Service | null; error: string | null }> {
	try {
		// Validate service type
		if (!VALID_SERVICE_TYPES.includes(serviceData.type as ServiceType)) {
			return {
				service: null,
				error: `Invalid service type: ${serviceData.type}. Must be one of: ${VALID_SERVICE_TYPES.join(', ')}`
			};
		}

		const { data, error } = await supabase
			.from('services')
			.insert([
				{
					name: serviceData.name,
					price: serviceData.price,
					description: serviceData.description,
					type: serviceData.type,
					highlights: serviceData.highlights,
					cover_url: serviceData.cover_url,
					created_by: studioId,
					enabled: true,
					status: 'approved' // Default status for new services
				}
			])
			.select()
			.single();

		if (error) {
			console.error('Error creating service:', error);
			return { service: null, error: error.message };
		}

		return { service: data as Service, error: null };
	} catch (error: any) {
		console.error('Error creating service:', error);
		return { service: null, error: error.message || 'Failed to create service' };
	}
}

// Update an existing service
export async function updateService(
	supabase: SupabaseClient,
	studioId: number,
	serviceId: string,
	serviceData: {
		name: string;
		price: number;
		description: string | null;
		type: string;
		highlights: string[];
		cover_url: string | null;
	}
): Promise<{ success: boolean; error: string | null }> {
	try {
		// Validate service type
		if (!VALID_SERVICE_TYPES.includes(serviceData.type as ServiceType)) {
			return {
				success: false,
				error: `Invalid service type: ${serviceData.type}. Must be one of: ${VALID_SERVICE_TYPES.join(', ')}`
			};
		}

		// First check if the service belongs to this studio
		const { data: service, error: fetchError } = await supabase
			.from('services')
			.select('id, created_by')
			.eq('id', serviceId)
			.eq('created_by', studioId)
			.single();

		if (fetchError || !service) {
			return { success: false, error: 'Service not found or access denied' };
		}

		// Update the service
		const { error } = await supabase
			.from('services')
			.update({
				name: serviceData.name,
				price: serviceData.price,
				description: serviceData.description,
				type: serviceData.type,
				highlights: serviceData.highlights,
				cover_url: serviceData.cover_url
			})
			.eq('id', serviceId);

		if (error) {
			console.error('Error updating service:', error);
			return { success: false, error: error.message };
		}

		return { success: true, error: null };
	} catch (error: any) {
		console.error('Error updating service:', error);
		return { success: false, error: error.message || 'Failed to update service' };
	}
}

// Delete a service
export async function deleteService(
	supabase: SupabaseClient,
	studioId: number,
	serviceId: string
): Promise<{ success: boolean; error: string | null }> {
	try {
		// First check if the service belongs to this studio
		const { data: service, error: fetchError } = await supabase
			.from('services')
			.select('id, created_by')
			.eq('id', serviceId)
			.eq('created_by', studioId)
			.single();

		if (fetchError || !service) {
			return { success: false, error: 'Service not found or access denied' };
		}

		// Delete the service
		const { error } = await supabase.from('services').delete().eq('id', serviceId);

		if (error) {
			console.error('Error deleting service:', error);
			return { success: false, error: error.message };
		}

		return { success: true, error: null };
	} catch (error: any) {
		console.error('Error deleting service:', error);
		return { success: false, error: error.message || 'Failed to delete service' };
	}
}
