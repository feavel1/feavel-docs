import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addTagsToPost, updatePostTags } from '$lib/utils/tags';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Check if this is a multipart form request (for file uploads)
		const contentType = request.headers.get('content-type') || '';
		let title, content, cover, public_visibility, tags;

		if (contentType.includes('multipart/form-data')) {
			// Handle multipart form data (file upload)
			const formData = await request.formData();
			const jsonData = formData.get('data') as string;
			const coverFile = formData.get('cover') as File | null;

			if (!jsonData) {
				return json({ error: 'Missing data' }, { status: 400 });
			}

			const parsedData = JSON.parse(jsonData);
			title = parsedData.title;
			content = parsedData.content;
			cover = parsedData.cover;
			public_visibility = parsedData.public_visibility;
			tags = parsedData.tags;

			// If we have a cover file, use the generated filename from the client
			if (coverFile && cover) {
				// cover already contains the generated filename from the client
				// so we don't need to do anything here
			}
		} else {
			// Handle regular JSON request
			const body = await request.json();
			({ title, content, cover, public_visibility, tags } = body);
		}

		// For new posts, title can be null initially
		// For updates, title is required
		if (request.method === 'PUT' && !title?.trim()) {
			return json({ error: 'Title is required' }, { status: 400 });
		}

		// Create the post
		const { data: post, error: postError } = await locals.supabase
			.from('posts')
			.insert({
				title: title?.trim() || null,
				content_v2: content || null,
				post_cover: cover?.trim() || null,
				public_visibility: public_visibility || false,
				user_id: session.user.id
			})
			.select()
			.single();

		if (postError) {
			console.error('Error creating post:', postError);
			return json({ error: 'Failed to create post' }, { status: 500 });
		}

		// Handle tags if provided
		if (tags && tags.length > 0) {
			const { error: tagError } = await addTagsToPost(locals.supabase, post.id, tags);
			if (tagError) {
				console.error('Error adding tags:', tagError);
				// Don't fail the entire request if tag addition fails
			}
		}

		return json({ success: true, postId: post.id });
	} catch (error) {
		console.error('Error in post creation:', error);
		return json({ error: 'Failed to create post' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Check if this is a multipart form request (for file uploads)
		const contentType = request.headers.get('content-type') || '';
		let id, title, content, cover, public_visibility, tags;

		if (contentType.includes('multipart/form-data')) {
			// Handle multipart form data (file upload)
			const formData = await request.formData();
			const jsonData = formData.get('data') as string;
			const coverFile = formData.get('cover') as File | null;

			if (!jsonData) {
				return json({ error: 'Missing data' }, { status: 400 });
			}

			const parsedData = JSON.parse(jsonData);
			id = parsedData.id;
			title = parsedData.title;
			content = parsedData.content;
			cover = parsedData.cover;
			public_visibility = parsedData.public_visibility;
			tags = parsedData.tags;

			// If we have a cover file, use the generated filename from the client
			if (coverFile && cover) {
				// cover already contains the generated filename from the client
				// so we don't need to do anything here
			}
		} else {
			// Handle regular JSON request
			const body = await request.json();
			({ id, title, content, cover, public_visibility, tags } = body);
		}

		if (!id) {
			return json({ error: 'Post ID is required' }, { status: 400 });
		}

		// Update the post
		const { error: postError } = await locals.supabase
			.from('posts')
			.update({
				title: title?.trim() || null,
				content_v2: content || null,
				post_cover: cover?.trim() || null,
				public_visibility: public_visibility || false
			})
			.eq('id', id)
			.eq('user_id', session.user.id);

		if (postError) {
			console.error('Error updating post:', postError);
			return json({ error: 'Failed to update post' }, { status: 500 });
		}

		// Handle tags using the updated function
		const { error: tagError } = await updatePostTags(locals.supabase, id, tags || []);
		if (tagError) {
			console.error('Error updating tags:', tagError);
			// Don't fail the entire request if tag update fails
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error in post update:', error);
		return json({ error: 'Failed to update post' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { id } = body;

		if (!id) {
			return json({ error: 'Post ID is required' }, { status: 400 });
		}

		// Remove tags using the updated function (pass empty array)
		await updatePostTags(locals.supabase, id, []);

		// Delete the post
		const { error: deleteError } = await locals.supabase
			.from('posts')
			.delete()
			.eq('id', id)
			.eq('user_id', session.user.id);

		if (deleteError) {
			console.error('Error deleting post:', deleteError);
			return json({ error: 'Failed to delete post' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error in post deletion:', error);
		return json({ error: 'Failed to delete post' }, { status: 500 });
	}
};
