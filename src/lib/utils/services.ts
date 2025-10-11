import type { SupabaseClient } from '@supabase/supabase-js';
import { uploadServiceCover } from './storage';

// Service type that matches what's actually returned from the server queries
// Using a more flexible type to avoid type conflicts
export interface Service {
	id: number;
	name: string;
	price: number;
	description: any;
	cover_url: string | null;
	highlights: any;
	service_type: string;
	status: any;
	created_at: string | null;
	created_by: number;
	studios?: any;
	services_category_rel?: any[];
}

interface ServiceFilters {
	selectedCategories: string[];
	searchQuery: string;
}

export function filterServices(services: Service[], filters: ServiceFilters): Service[] {
	let filtered = services;

	// Filter by categories
	if (filters.selectedCategories.length > 0) {
		filtered = filtered.filter((service) =>
			service.services_category_rel?.some((rel: any) =>
				filters.selectedCategories.includes(rel.services_category?.category_name)
			)
		);
	}

	// Filter by search query
	if (filters.searchQuery) {
		const query = filters.searchQuery.toLowerCase();
		filtered = filtered.filter(
			(service) =>
				service.name?.toLowerCase().includes(query) ||
				service.service_type?.toLowerCase().includes(query) ||
				(service.studios &&
					(Array.isArray(service.studios)
						? service.studios[0]?.name?.toLowerCase().includes(query)
						: service.studios.name?.toLowerCase().includes(query)))
		);
	}

	return filtered;
}

export function getServiceCategories(service: Service): string[] {
	return (
		service.services_category_rel
			?.map((rel: any) => rel.services_category?.category_name)
			.filter(Boolean) || []
	);
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
export function getServiceCategoryCount(service: Service): number {
	return service.services_category_rel?.length || 0;
}

// Service cover upload handler
export async function handleServiceCoverUpload(
	supabase: SupabaseClient,
	file: File
): Promise<string | null> {
	return await uploadServiceCover(supabase, file);
}

// Create a new service
export async function createService(
	supabase: SupabaseClient,
	studioId: number,
	serviceData: {
		name: string;
		price: number;
		description: string | null;
		service_type: string;
		highlights: string[];
		cover_url: string | null;
	}
): Promise<{ service: Service | null; error: string | null }> {
	try {
		const { data, error } = await supabase
			.from('services')
			.insert([
				{
					name: serviceData.name,
					price: serviceData.price,
					description: serviceData.description,
					service_type: serviceData.service_type,
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
	serviceId: number,
	serviceData: {
		name: string;
		price: number;
		description: string | null;
		service_type: string;
		highlights: string[];
		cover_url: string | null;
	}
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

		// Update the service
		const { error } = await supabase
			.from('services')
			.update({
				name: serviceData.name,
				price: serviceData.price,
				description: serviceData.description,
				service_type: serviceData.service_type,
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
	serviceId: number
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
