import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		throw redirect(302, '/auth/login');
	}

	// Fetch available tags directly from Supabase
	const { data: tags, error: tagsError } = await locals.supabase
		.from('post_tags')
		.select('tag_name')
		.order('tag_name');

	if (tagsError) {
		console.error('Error fetching tags:', tagsError);
	}

	return {
		tags: tags?.map((tag) => tag.tag_name) || []
	};
};
