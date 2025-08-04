import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { post_id } = params;

	const { session } = await locals.safeGetSession();

	if (!post_id) {
		throw error(404, 'Post not found');
	}

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
		.eq('id', post_id)
		.eq('public_visibility', true)
		.single();

	if (postError || !post) {
		throw error(404, 'Post not found');
	}

	// Increment view count
	await locals.supabase
		.from('posts')
		.update({ post_views: (post.post_views || 0) + 1 })
		.eq('id', post_id);

	return {
		post,
		session
	};
};
