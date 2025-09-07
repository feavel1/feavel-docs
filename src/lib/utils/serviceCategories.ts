import type { SupabaseClient } from '@supabase/supabase-js';
import type { Service } from '$lib/utils/services';

export interface ServiceCategory {
	id: number;
	category_name: string;
}

/**
 * Get service categories from service data
 * This function is used by ServiceCard and service detail page
 */
export function getServiceTags(service: Service): string[] {
	if (!service) return [];
	return (
		service.services_category_rel?.map((rel: any) => rel.services_category?.category_name).filter(Boolean) || []
	);
}

/**
 * Get all service categories
 */
export async function getServiceCategories(supabase: SupabaseClient) {
	const { data, error } = await supabase
		.from('services_category')
		.select('id, category_name')
		.order('category_name');

	return { data, error };
}