import { getApprovedStudios } from '$lib/utils/studio';
import type { Studio } from '$lib/utils/studio';

type PublicStudio = Pick<Studio, 'id' | 'name' | 'description'>;

export const load = async ({ locals: { supabase }, parent }) => {
	const { session, userStudio } = await parent();

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
	// Use userStudio data from parent instead of refetching
	const hasApplied = !!userStudio;

	return {
		studios,
		session,
		hasApplied
	};
};
