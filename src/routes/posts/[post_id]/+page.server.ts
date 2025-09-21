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
		const { post: newPost, error: createError } = await createPost(
			locals.supabase,
			session.user.id,
			{
				title: null,
				content: {
					blocks: [],
					version: '2.27.2' // Editor.js version
				},
				public_visibility: false,
				tags: []
			}
		);

		if (createError || !newPost) {
			throw error(500, 'Failed to create new post');
		}

		// Redirect to the new post
		throw redirect(302, `/posts/${newPost.id}`);
	}

	// Handle existing post loading
	const { data: post, error: postError } = await locals.supabase
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
		.eq('id', post_id)
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
			.eq('id', post_id);
	}

	const tags = isOwner ? await fetchAllTags(locals.supabase) : [];

	return {
		post,
		tags
	};
};
