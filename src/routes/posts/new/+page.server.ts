import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTags } from '$lib/utils/tags';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		throw redirect(302, '/auth/login');
	}

	// Fetch available tags using utility function
	const { data: tags, error: tagsError } = await getTags(locals.supabase);

	if (tagsError) {
		console.error('Error fetching tags:', tagsError);
	}

	return {
		tags: tags?.map((tag) => tag.tag_name) || []
	};
};
