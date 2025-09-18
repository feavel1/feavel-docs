import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, parent }) => {
	const { post_id } = params;

	const { session } = await parent();

	if (!post_id) {
		throw error(404, 'Post not found');
	}

	// Handle new post creation
	if (post_id === 'new') {
		if (!session) {
			throw redirect(302, '/auth/login');
		}

		// Create a new post with empty title
		const { data: newPost, error: createError } = await locals.supabase
			.from('posts')
			.insert({
				title: null,
				content_v2: null,
				post_cover: null,
				public_visibility: false,
				user_id: session.user.id
			})
			.select()
			.single();

		if (createError || !newPost) {
			console.error('Error creating new post:', createError);
			throw error(500, 'Failed to create new post');
		}

		// Fetch available tags for editing
		let tags = [];
		const { data: availableTags, error: tagsError } = await locals.supabase
			.from('post_tags')
			.select('tag_name')
			.order('tag_name');

		if (!tagsError) {
			tags = availableTags?.map((tag) => tag.tag_name) || [];
		}

		return {
			post: newPost,
			session,
			tags,
			isNewPost: true
		};
	}

	// First, try to fetch the post without visibility restrictions to check ownership
	const { data: postData, error: initialError } = await locals.supabase
		.from('posts')
		.select('user_id')
		.eq('id', post_id)
		.single();

	// If we can't find the post at all, it doesn't exist
	if (initialError || !postData) {
		throw error(404, 'Post not found');
	}

	// Build the query for fetching the post with all related data
	let postQuery = locals.supabase
		.from('posts')
		.select(
			`
			*,
			users!inner(username, avatar_url),
			posts_tags_rel(
				post_tags!inner(tag_name)
			),
			post_likes(
				id,
				user_id,
				created_at,
				users!inner(username, avatar_url)
			),
			post_comments(
				id,
				created_at,
				updated_at,
				user_id,
				parent_id,
				content,
				is_deleted,
				users!inner(username, avatar_url, full_name)
			)
		`
		)
		.eq('id', post_id);

	// If user is not the author, only show public posts
	if (!session || session.user.id !== postData.user_id) {
		postQuery = postQuery.eq('public_visibility', true);
	}

	// Fetch the post with related data
	const { data: post, error: postError } = await postQuery.single();

	if (postError || !post) {
		throw error(404, 'Post not found');
	}

	// Only increment view count for public posts
	if (post.public_visibility) {
		await locals.supabase
			.from('posts')
			.update({ post_views: (post.post_views || 0) + 1 })
			.eq('id', post_id);
	}

	// Fetch available tags for editing if user is the author
	let tags = [];
	if (session && session.user.id === post.user_id) {
		const { data: availableTags, error: tagsError } = await locals.supabase
			.from('post_tags')
			.select('tag_name')
			.order('tag_name');

		if (!tagsError) {
			tags = availableTags?.map((tag) => tag.tag_name) || [];
		}
	}

	return {
		post,
		session,
		tags
	};
};
