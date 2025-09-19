import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchAllTags } from '$lib/utils/posts';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { postSchema } from './+page.svelte';

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

		const initialData = {
			title: null,
			content: null,
			post_cover: null,
			public_visibility: false,
			tags: []
		};

		const form = await superValidate(initialData, zod(postSchema));
		const tags = await fetchAllTags(locals.supabase);

		return {
			form,
			session,
			tags,
			isNewPost: true
		};
	}

	// Handle existing post loading
	try {
		// First, check if post exists and get user_id for permission check
		const { data: postData, error: postError } = await locals.supabase
			.from('posts')
			.select('user_id, public_visibility, post_views')
			.eq('id', post_id)
			.single();

		if (postError || !postData) {
			throw error(404, 'Post not found');
		}

		// Check permissions - public posts can be viewed by anyone, private posts only by owner
		const isOwner = session?.user?.id === postData.user_id;
		if (!postData.public_visibility && !isOwner) {
			throw error(404, 'Post not found');
		}

		// Fetch full post data with related information
		const { data: post, error: fullPostError } = await locals.supabase
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

		if (fullPostError || !post) {
			throw error(404, 'Post not found');
		}

		// Update view count for public posts
		if (post.public_visibility && !isOwner) {
			await locals.supabase
				.from('posts')
				.update({ post_views: (post.post_views || 0) + 1 })
				.eq('id', post_id);
		}

		// Prepare form data
		const formData = {
			id: post.id,
			title: post.title,
			content: post.content_v2,
			post_cover: post.post_cover,
			public_visibility: post.public_visibility,
			tags: post.posts_tags_rel ? post.posts_tags_rel.map((rel: any) => rel.post_tags.tag_name) : []
		};

		const form = await superValidate(formData, zod(postSchema));

		// Fetch tags only for post owner
		let tags: string[] = [];
		if (isOwner) {
			tags = await fetchAllTags(locals.supabase);
		}

		return {
			post,
			form,
			session,
			tags
		};
	} catch (err) {
		console.error('Error loading post:', err);
		throw error(404, 'Post not found');
	}
};
