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
	return service.services_category_rel?.map((rel: any) => rel.services_category?.category_name).filter(Boolean) || [];
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
