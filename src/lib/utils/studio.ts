import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

export type Studio = Database['public']['Tables']['studios']['Row'];
export type StudioInsert = Database['public']['Tables']['studios']['Insert'];
export type StudioUpdate = Database['public']['Tables']['studios']['Update'];
export type StudioStatus = Database['public']['Enums']['status'];

/**
 * Get all approved studios for public display
 * @param supabase Supabase client
 * @returns Array of approved studios with basic information
 */
export async function getApprovedStudios(supabase: SupabaseClient<Database>) {
	const { data, error } = await supabase
		.from('studios')
		.select('id, name, description')
		.eq('status', 'approved')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching approved studios:', error);
		throw new Error('Failed to fetch studios. Please try again later.');
	}

	return data;
}

/**
 * Get studio information for a specific user
 * @param supabase Supabase client
 * @param userId User ID
 * @returns Studio information or null if user is not a studio
 */
export async function getUserStudio(supabase: SupabaseClient<Database>, userId: string) {
	const { data, error } = await supabase
		.from('studios')
		.select('id, name, description, status, contact_phone, salary_expectation')
		.eq('user_id', userId)
		.maybeSingle();

	if (error) {
		console.error('Error fetching user studio:', error);
		throw new Error('Failed to fetch studio information. Please try again later.');
	}

	return data;
}

/**
 * Check if a user has already applied to become a studio
 * @param supabase Supabase client
 * @param userId User ID
 * @returns Boolean indicating if user has applied
 */
export async function hasUserAppliedToStudio(supabase: SupabaseClient<Database>, userId: string) {
	const { data, error } = await supabase
		.from('studios')
		.select('id')
		.eq('user_id', userId)
		.maybeSingle();

	if (error) {
		console.error('Error checking studio application status:', error);
		throw new Error('Failed to check application status. Please try again later.');
	}

	return !!data;
}

/**
 * Create a new studio application
 * @param supabase Supabase client
 * @param userId User ID
 * @param studioData Studio application data
 * @returns Created studio or null if failed
 */
export async function createStudioApplication(
	supabase: SupabaseClient<Database>,
	userId: string,
	studioData: Omit<StudioInsert, 'user_id' | 'status'>
) {
	// Check if user has already applied
	const hasApplied = await hasUserAppliedToStudio(supabase, userId);
	if (hasApplied) {
		throw new Error('User has already applied to become a studio');
	}

	const { data, error } = await supabase
		.from('studios')
		.insert({
			...studioData,
			user_id: userId,
			status: 'applied'
		})
		.select()
		.single();

	if (error) {
		console.error('Error creating studio application:', error);
		throw new Error('Failed to submit studio application. Please try again later.');
	}

	return data;
}

/**
 * Update studio status
 * @param supabase Supabase client
 * @param studioId Studio ID
 * @param status New status
 * @returns Updated studio or null if failed
 */
export async function updateStudioStatus(
	supabase: SupabaseClient<Database>,
	studioId: number,
	status: StudioStatus
) {
	const { data, error } = await supabase
		.from('studios')
		.update({ status })
		.eq('id', studioId)
		.select()
		.single();

	if (error) {
		console.error('Error updating studio status:', error);
		throw new Error('Failed to update studio status. Please try again later.');
	}

	return data;
}

/**
 * Check if user has access to studio dashboard
 * @param supabase Supabase client
 * @param userId User ID
 * @returns Object with access information
 */
export async function checkStudioDashboardAccess(
	supabase: SupabaseClient<Database>,
	userId: string
) {
	const { data: studio, error } = await supabase
		.from('studios')
		.select('id, name, description, status, contact_phone, salary_expectation')
		.eq('user_id', userId)
		.maybeSingle();

	if (error) {
		console.error('Error checking studio dashboard access:', error);
		throw new Error('Failed to check dashboard access. Please try again later.');
	}

	if (!studio) {
		return { hasAccess: false, isApproved: false, studio: null };
	}

	// Users with 'applied' or 'approved' status have access
	const hasAccess = studio.status === 'applied' || studio.status === 'approved';
	const isApproved = studio.status === 'approved';

	return { hasAccess, isApproved, studio };
}
