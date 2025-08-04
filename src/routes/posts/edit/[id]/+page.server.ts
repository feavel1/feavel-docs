import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTags, getPostTags } from '$lib/utils/tags';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		throw redirect(302, '/auth/login');
	}

	const { id } = params;

	// Fetch the post with related data
	const { data: post, error: postError } = await locals.supabase
		.from('posts')
		.select(
			`
			*,
			users!inner(username, avatar_url),
			posts_tags_rel(
				post_tags!inner(tag_name)
			)
		`
		)
		.eq('id', id)
		.eq('user_id', session.user.id)
		.single();

	if (postError || !post) {
		throw error(404, 'Post not found');
	}

	// Fetch available tags using utility function
	const { data: tags, error: tagsError } = await getTags(locals.supabase);

	if (tagsError) {
		console.error('Error fetching tags:', tagsError);
	}

	return {
		post,
		tags: tags?.map((tag) => tag.tag_name) || []
	};
};
