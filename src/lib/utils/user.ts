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
 * Returns the stored avatar_url if available, otherwise returns a default avatar
 */
export function getAvatarDisplayUrl(avatarUrl?: string | null, username?: string): string {
	if (avatarUrl) {
		return avatarUrl;
	}

	// Return a default avatar using DiceBear API
	const defaultAvatar = username
		? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
		: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

	return defaultAvatar;
}
