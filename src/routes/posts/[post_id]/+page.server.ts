import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
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

	const { data: postData, error: initialError } = await locals.supabase
		.from('posts')
		.select('user_id')
		.eq('id', post_id)
		.single();

	if (initialError || !postData) {
		throw error(404, 'Post not found');
	}

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

	if (!session || session.user.id !== postData.user_id) {
		postQuery = postQuery.eq('public_visibility', true);
	}

	const { data: post, error: postError } = await postQuery.single();

	if (postError || !post) {
		throw error(404, 'Post not found');
	}

	if (post.public_visibility) {
		await locals.supabase
			.from('posts')
			.update({ post_views: (post.post_views || 0) + 1 })
			.eq('id', post_id);
	}

	const formData = {
		id: post.id,
		title: post.title,
		content: post.content_v2,
		post_cover: post.post_cover,
		public_visibility: post.public_visibility,
		tags: post.posts_tags_rel ? post.posts_tags_rel.map((rel: any) => rel.post_tags.tag_name) : []
	};

	const form = await superValidate(formData, zod(postSchema));

	let tags: string[] = [];
	if (session && session.user.id === post.user_id) {
		tags = await fetchAllTags(locals.supabase);
	}

	return {
		post,
		form,
		session,
		tags
	};
};

import { createPost, updatePost } from '$lib/utils/posts';
import { uploadPostCover } from '$lib/utils/storage';

export const actions: Actions = {
	save: async ({ request, locals, params }) => {
		const { post_id } = params;
		const { session } = await locals.safeGetSession();

		if (!session) {
			return fail(401, { message: 'You must be logged in to save a post' });
		}

		const form = await superValidate(request, zod(postSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			if (post_id === 'new') {
				const { post: createdPost, error } = await createPost(locals.supabase, session.user.id, {
					title: form.data.title,
					content: form.data.content,
					cover: form.data.post_cover,
					public_visibility: form.data.public_visibility,
					tags: form.data.tags
				});

				if (error) {
					return fail(500, { form, message: error });
				}

				if (createdPost) {
					throw redirect(302, `/posts/${createdPost.id}`);
				}

				return fail(500, { form, message: 'Failed to create post' });
			} else {
				const postId = parseInt(post_id);
				if (isNaN(postId)) {
					return fail(400, { form, message: 'Invalid post ID' });
				}

				const { success, error } = await updatePost(
					locals.supabase,
					session.user.id,
					postId,
					{
						title: form.data.title,
						content: form.data.content,
						cover: form.data.post_cover,
						public_visibility: form.data.public_visibility,
						tags: form.data.tags
					}
				);

				if (!success) {
					return fail(500, { form, message: error || 'Failed to update post' });
				}

				return { form, message: 'Post updated successfully!' };
			}
		} catch (error) {
			console.error(`Error ${post_id === 'new' ? 'creating' : 'updating'} post:`, error);
			return fail(500, { form, message: `Failed to ${post_id === 'new' ? 'create' : 'update'} post` });
		}
	},

	uploadCover: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();

		if (!session) {
			return fail(401, { message: 'You must be logged in to upload a cover image' });
		}

		try {
			const formData = await request.formData();
			const coverFile = formData.get('cover') as File;

			if (!coverFile || !(coverFile instanceof File) || !coverFile.name) {
				return fail(400, { message: 'No file provided' });
			}

			if (!coverFile.type.startsWith('image/')) {
				return fail(400, { message: 'Please select an image file' });
			}

			if (coverFile.size > 5 * 1024 * 1024) {
				return fail(400, { message: 'File size must be less than 5MB' });
			}

			const filename = await uploadPostCover(locals.supabase, coverFile);
			if (!filename) {
				return fail(500, { message: 'Failed to upload cover image' });
			}

			return { coverFilename: filename };
		} catch (error) {
			console.error('Error uploading cover image:', error);
			return fail(500, { message: 'Failed to upload cover image' });
		}
	}
};