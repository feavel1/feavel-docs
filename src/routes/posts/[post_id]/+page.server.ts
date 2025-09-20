import { error, redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fetchAllTags, createPost, updatePost, deletePost } from '$lib/utils/posts';
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

		// Create a minimal draft post immediately
		const { post: newPost, error: createError } = await createPost(locals.supabase, session.user.id, {
			title: null,
			content: null,
			public_visibility: false,
			tags: []
		});

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

	// Prepare form data
	const formData = {
		id: post.id,
		title: post.title,
		content: post.content_v2,
		post_cover: post.post_cover,
		public_visibility: post.public_visibility,
		tags: post.posts_tags_rel ? post.posts_tags_rel.map((rel: { post_tags: { tag_name: string } }) => rel.post_tags.tag_name) : []
	};

	const form = await superValidate(formData, zod(postSchema));
	const tags = isOwner ? await fetchAllTags(locals.supabase) : [];

	return {
		post,
		form,
		session,
		tags
	};
};

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		const { post_id } = params;
		const { session } = await locals.safeGetSession();

		if (!session) {
			throw error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod(postSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Prepare post data
		const postData = {
			title: form.data.title,
			content: form.data.content,
			public_visibility: form.data.public_visibility,
			tags: form.data.tags
		};

		// Update the post (works for both new and existing)
		const { success, error: updateError } = await updatePost(
			locals.supabase,
			session.user.id,
			parseInt(post_id),
			postData
		);

		if (!success) {
			return fail(500, { form, message: updateError });
		}

		return {
			form,
			message: { text: 'Post saved successfully!' }
		};
	},

	delete: async ({ locals, params }) => {
		const { post_id } = params;
		const { session } = await locals.safeGetSession();

		if (!session) {
			throw error(401, 'Unauthorized');
		}

		const { success, error: deleteError } = await deletePost(
			locals.supabase,
			session.user.id,
			parseInt(post_id)
		);

		if (!success) {
			return fail(500, { message: deleteError });
		}

		throw redirect(302, '/posts');
	}
};
