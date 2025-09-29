import { getApprovedStudios, hasUserAppliedToStudio } from '$lib/utils/studio';
import type { Studio } from '$lib/utils/studio';

type PublicStudio = Pick<Studio, 'id' | 'name' | 'description'>;

export const load = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	let studios: PublicStudio[] = [];
	try {
		// Get approved studios for public display
		studios = await getApprovedStudios(supabase);
	} catch (error) {
		console.error('Error fetching studios:', error);
		// Return empty array if we can't fetch studios
		studios = [];
	}

	// Check if user has applied to become a studio (for showing/hiding apply button)
	let hasApplied = false;
	if (session) {
		try {
			hasApplied = await hasUserAppliedToStudio(supabase, session.user.id);
		} catch (error) {
			console.error('Error checking application status:', error);
			// Assume user hasn't applied if we can't check
			hasApplied = false;
		}
	}

	return {
		studios,
		session,
		hasApplied
	};
};
