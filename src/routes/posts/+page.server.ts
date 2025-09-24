export const load = async ({ locals, parent }) => {
	const { session } = await parent();

	// Fetch drafts for logged-in users
	let drafts = [];
	if (session) {
		const { data: userDrafts, error: draftsError } = await locals.supabase
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
			.eq('user_id', session.user.id)
			.eq('public_visibility', false)
			.order('created_at', { ascending: false });

		if (draftsError) {
			console.error('Error fetching drafts:', draftsError);
		} else {
			drafts = userDrafts || [];
		}
	}

	return {
		drafts
	};
};
