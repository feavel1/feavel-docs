import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { session } = await parent();

	// Fetch posts with related data
	const { data: posts, error: postsError } = await locals.supabase
		.from('posts')
		.select(
			`
			*,
			users!inner(username, avatar_url),
			posts_tags_rel(
				post_tags!inner(tag_name)
			),
			post_likes(id),
			post_comments(id)
		`
		)
		.eq('public_visibility', true)
		.order('created_at', { ascending: false });

	// Fetch tags for filtering
	const { data: tags, error: tagsError } = await locals.supabase
		.from('post_tags')
		.select('id, tag_name')
		.order('tag_name');

	if (postsError) {
		console.error('Error fetching posts:', postsError);
	}

	if (tagsError) {
		console.error('Error fetching tags:', tagsError);
	}

	return {
		session,
		posts: posts || [],
		tags: tags || []
	};
};
