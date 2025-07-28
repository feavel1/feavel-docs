import type { SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
	id: string;
	username: string;
	full_name?: string;
	avatar_url?: string;
	birthday?: string;
	description?: string;
}

/**
 * Fetch user profile from the users table
 */
export async function getUserProfile(
	supabase: SupabaseClient,
	userId: string
): Promise<UserProfile | null> {
	const { data, error } = await supabase
		.from('users')
		.select('id, username, full_name, avatar_url, birthday, description')
		.eq('id', userId)
		.single();

	if (error || !data) {
		return null;
	}

	return data;
}

/**
 * Fetch user profile by username
 */
export async function getUserProfileByUsername(
	supabase: SupabaseClient,
	username: string
): Promise<UserProfile | null> {
	const { data, error } = await supabase
		.from('users')
		.select('id, username, full_name, avatar_url, birthday, description')
		.eq('username', username)
		.single();

	if (error || !data) {
		return null;
	}

	return data;
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(
	supabase: SupabaseClient,
	username: string
): Promise<boolean> {
	const { data, error } = await supabase
		.from('users')
		.select('username')
		.eq('username', username)
		.single();

	return !data && !error;
}

/**
 * Get avatar URL for display
 * Handles all avatar URL scenarios: full URLs, filenames, and default avatars
 */
export function getAvatarUrl(
	avatarUrl?: string | null,
	username?: string,
	supabase?: SupabaseClient
): string {
	if (avatarUrl) {
		// If it's already a full URL, return it as is
		if (avatarUrl.startsWith('http')) {
			return avatarUrl;
		}

		// If it's a filename and we have supabase client, construct the storage URL
		if (supabase) {
			const { data } = supabase.storage.from('storage').getPublicUrl(`avatars/${avatarUrl}`);
			return data.publicUrl;
		}

		// Fallback: return the filename as is if no supabase client
		return avatarUrl;
	}

	// Return a default avatar using DiceBear API
	const defaultAvatar = username
		? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
		: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

	return defaultAvatar;
}
