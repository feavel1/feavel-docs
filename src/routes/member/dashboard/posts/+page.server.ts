import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals: { supabase }, parent }) => {
	const { session } = await parent();

	if (!session?.user) {
		return {
			posts: []
		};
	}

	// Fetch user's posts with related data
	const { data: posts, error: postsError } = await supabase
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
		.eq('user_id', session.user.id)
		.order('created_at', { ascending: false });

	if (postsError) {
		console.error('Error fetching user posts:', postsError);
	}

	return {
		posts: posts || []
	};
};
