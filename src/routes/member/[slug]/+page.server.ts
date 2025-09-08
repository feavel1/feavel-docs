import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { getUserProfileByUsername } from '$lib/utils/user';
import type { UserProfile } from '$lib/utils/user';

export const load: ServerLoad = async ({ params, locals, parent }) => {
	const { session, userProfile: parentUserProfile } = await parent();

	const slug = params.slug as string;

	// If we're viewing the current user's profile, use the parent's userProfile
	// Otherwise, fetch the specific user's profile
	let viewedUserProfile: UserProfile;
	if (parentUserProfile?.username === slug) {
		viewedUserProfile = parentUserProfile;
	} else {
		// Fetch user by username
		const userProfile = await getUserProfileByUsername(locals.supabase, slug);

		if (!userProfile) {
			throw error(404, 'User not found');
		}
		
		viewedUserProfile = userProfile;
	}

	// Check if this is the current user's profile (only if logged in)
	const isOwnProfile = session?.user?.id === viewedUserProfile.id;

	// Fetch user's posts with related data
	const { data: posts, error: postsError } = await locals.supabase
		.from('posts')
		.select(
			`
			*,
			users!inner(username, avatar_url),
			posts_tags_rel(
				post_tags!inner(tag_name)
			),
			post_likes(id),
			post_comments(id)
		`
		)
		.eq('user_id', viewedUserProfile.id)
		.eq('public_visibility', true)
		.order('created_at', { ascending: false });

	// Get user statistics
	const { count: postsCount, error: postsCountError } = await locals.supabase
		.from('posts')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', viewedUserProfile.id)
		.eq('public_visibility', true);

	const { count: commentsCount, error: commentsCountError } = await locals.supabase
		.from('post_comments')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', viewedUserProfile.id)
		.is('is_deleted', false);

	const { count: likesReceivedCount, error: likesReceivedError } = await locals.supabase
		.from('post_likes')
		.select(
			`
			id,
			posts!inner (
				id,
				user_id,
				public_visibility
			)
		`,
			{ count: 'exact', head: true }
		)
		.eq('posts.user_id', viewedUserProfile.id)
		.eq('posts.public_visibility', true);

	if (postsError) {
		console.error('Error fetching user posts:', postsError);
	}

	if (postsCountError) {
		console.error('Error fetching posts count:', postsCountError);
	}

	if (commentsCountError) {
		console.error('Error fetching comments count:', commentsCountError);
	}

	if (likesReceivedError) {
		console.error('Error fetching likes received count:', likesReceivedError);
	}

	return {
		viewedUserProfile,
		isOwnProfile,
		session,
		posts: posts || [],
		stats: {
			posts: postsCount || 0,
			comments: commentsCount || 0,
			likesReceived: likesReceivedCount || 0
		}
	};
};
