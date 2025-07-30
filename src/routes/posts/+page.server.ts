import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const tag = url.searchParams.get('tag');

	let query = locals.supabase
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
		.eq('public_visibility', true)
		.order('created_at', { ascending: false });

	if (tag) {
		query = query.eq('posts_tags_rel.post_tags.tag_name', tag);
	}

	const { data: posts, error } = await query;

	if (error) {
		console.error('Error fetching posts:', error);
		return {
			posts: [],
			currentTag: tag
		};
	}

	return {
		posts: posts || [],
		currentTag: tag
	};
}; 