import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		throw redirect(302, '/auth/login');
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
		tags: tags?.map((tag) => tag.tag_name) || []
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { session } = await locals.safeGetSession();
		if (!session) {
			throw error(401, 'Unauthorized');
		}

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
			// Create the post
			const { data: post, error: postError } = await locals.supabase
				.from('posts')
				.insert({
					title: title.trim(),
					content_v2: content ? JSON.parse(content) : null,
					post_cover: cover?.trim() || null,
					public_visibility: publicVisibility,
					user_id: session.user.id
				})
				.select()
				.single();

			if (postError) {
				console.error('Error creating post:', postError);
				throw error(500, 'Failed to create post');
			}

			// Handle tags
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
						post_id: post.id,
						tag_id: tag.id
					}));

					await locals.supabase.from('posts_tags_rel').insert(relationships);
				}
			}

			return { success: true, postId: post.id };
		} catch (err) {
			console.error('Error in post creation:', err);
			throw error(500, 'Failed to create post');
		}
	}
};
