import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchAllTags, createPost } from '$lib/utils/posts';

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

		// Create a minimal draft post immediately with proper initial content_v2 structure
		const result = await createPost(locals.supabase, session.user.id, {
			title: null,
			content: {
				blocks: [],
				version: '2.27.2' // Editor.js version
			},
			public_visibility: false,
			tags: []
		});
		const newPost = result.data;
		const createError = result.error;

		if (createError || !newPost) {
			throw error(500, 'Failed to create new post');
		}

		// Redirect to the new post
		throw redirect(302, `/posts/${newPost.id}`);
	}

	// Handle existing post loading
	// Convert post_id from string to number for database queries
	const postIdNum = parseInt(post_id, 10);

	const { data: post, error: postError } = await locals.supabase
		.from('posts')
		.select(
			`
			*,
			users!inner(username, avatar_file_id),
			posts_tags_rel(
				posts_tags!inner(id, tag_name)
			),
			posts_likes(
				id,
				user_id,
				created_at,
				users!inner(username, avatar_file_id)
			),
			posts_comments(
				id,
				created_at,
				updated_at,
				user_id,
				parent_id,
				content,
				is_deleted,
				users!inner(username, avatar_file_id, full_name)
			)
		`
		)
		.eq('id', postIdNum)
		.single();

	if (postError || !post) {
		throw error(404, 'Post not found');
	}

	// Check permissions - public posts can be viewed by anyone, private posts only by owner
	const isOwner = session?.user?.id === post.user_id;
	if (!post.public_visibility && !isOwner) {
		throw error(404, 'Post not found');
	}

	// Update view count for public posts
	if (post.public_visibility && !isOwner) {
		await locals.supabase
			.from('posts')
			.update({ post_views: (post.post_views || 0) + 1 })
			.eq('id', postIdNum);
	}

	const tags = isOwner ? await fetchAllTags(locals.supabase) : [];

	return {
		post,
		tags
	};
};
