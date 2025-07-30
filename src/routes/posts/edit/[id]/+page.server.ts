import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		throw redirect(302, '/auth/login');
	}

	const { id } = params;

	// Fetch the post with related data
	const { data: post, error: postError } = await locals.supabase
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
		.eq('id', id)
		.eq('user_id', session.user.id)
		.single();

	if (postError || !post) {
		throw error(404, 'Post not found');
	}

	// Fetch available tags
	const { data: tags, error: tagsError } = await locals.supabase
		.from('post_tags')
		.select('tag_name')
		.order('tag_name');

	if (tagsError) {
		console.error('Error fetching tags:', tagsError);
	}

	return {
		post,
		tags: tags?.map((tag) => tag.tag_name) || []
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session) {
			throw error(401, 'Unauthorized');
		}

		const { id } = params;
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const content = formData.get('content') as string;
		const cover = formData.get('cover') as string;
		const publicVisibility = formData.get('public_visibility') === 'true';
		const tags = JSON.parse((formData.get('tags') as string) || '[]');

		if (!title?.trim()) {
			throw error(400, 'Title is required');
		}

		try {
			// Update the post
			const { error: postError } = await locals.supabase
				.from('posts')
				.update({
					title: title.trim(),
					content_v2: content ? JSON.parse(content) : null,
					post_cover: cover?.trim() || null,
					public_visibility: publicVisibility
				})
				.eq('id', id)
				.eq('user_id', session.user.id);

			if (postError) {
				console.error('Error updating post:', postError);
				throw error(500, 'Failed to update post');
			}

			// Handle tags - first remove all existing relationships
			await locals.supabase.from('posts_tags_rel').delete().eq('post_id', id);

			// Then add new relationships
			if (tags.length > 0) {
				// First, ensure all tags exist in the post_tags table
				for (const tagName of tags) {
					// Try to insert the tag (will fail if it already exists, which is fine)
					await locals.supabase.from('post_tags').insert({ tag_name: tagName }).select().single();
				}

				// Get tag IDs
				const { data: tagData } = await locals.supabase
					.from('post_tags')
					.select('id, tag_name')
					.in('tag_name', tags);

				if (tagData) {
					// Create relationships
					const relationships = tagData.map((tag) => ({
						post_id: id,
						tag_id: tag.id
					}));

					await locals.supabase.from('posts_tags_rel').insert(relationships);
				}
			}

			return { success: true };
		} catch (err) {
			console.error('Error in post update:', err);
			throw error(500, 'Failed to update post');
		}
	},

	delete: async ({ params, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session) {
			throw error(401, 'Unauthorized');
		}

		const { id } = params;

		try {
			// Delete tag relationships first
			await locals.supabase.from('posts_tags_rel').delete().eq('post_id', id);

			// Delete the post
			const { error: deleteError } = await locals.supabase
				.from('posts')
				.delete()
				.eq('id', id)
				.eq('user_id', session.user.id);

			if (deleteError) {
				console.error('Error deleting post:', deleteError);
				throw error(500, 'Failed to delete post');
			}

			return { success: true };
		} catch (err) {
			console.error('Error in post deletion:', err);
			throw error(500, 'Failed to delete post');
		}
	}
};
