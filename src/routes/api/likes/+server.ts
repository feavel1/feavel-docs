import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleLike, getLikeCount, isPostLiked } from '$lib/utils/likes';

// Validation helper
const validateId = (id: any): number | null => {
	const num = Number(id);
	return Number.isInteger(num) && num > 0 ? num : null;
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { post_id } = await request.json();
		const validPostId = validateId(post_id);

		if (!validPostId) {
			return json({ error: 'Invalid post ID' }, { status: 400 });
		}

		const result = await toggleLike(locals.supabase, validPostId, user.id);

		if (!result.success) {
			return json({ error: 'Failed to toggle like' }, { status: 500 });
		}

		const likeCount = await getLikeCount(locals.supabase, validPostId);

		return json({
			success: true,
			isLiked: result.isLiked,
			likeCount
		});
	} catch (error) {
		console.error('Error toggling like:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ url, locals }) => {
	const post_id = url.searchParams.get('post_id');
	const user_id = url.searchParams.get('user_id');

	const validPostId = validateId(post_id);

	if (!validPostId) {
		return json({ error: 'Valid post ID is required' }, { status: 400 });
	}

	try {
		const [likeCount, isLiked] = await Promise.all([
			getLikeCount(locals.supabase, validPostId),
			user_id ? isPostLiked(locals.supabase, validPostId, user_id) : Promise.resolve(false)
		]);

		return json({ likeCount, isLiked });
	} catch (error) {
		console.error('Error fetching like data:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
