import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const { data: tags, error } = await locals.supabase
			.from('post_tags')
			.select('id, tag_name')
			.order('tag_name');

		if (error) {
			console.error('Error fetching tags:', error);
			return json({ tags: [] }, { status: 500 });
		}

		return json({ tags: tags || [] });
	} catch (error) {
		console.error('Error in tags API:', error);
		return json({ tags: [] }, { status: 500 });
	}
};
