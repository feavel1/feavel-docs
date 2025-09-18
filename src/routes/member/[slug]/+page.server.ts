import { error } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';
import { getUserProfileByUsername, getUserStats } from '$lib/utils/user';
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

	// Get user statistics using the consolidated utility function
	const stats = await getUserStats(locals.supabase, viewedUserProfile.id);

	if (postsError) {
		console.error('Error fetching user posts:', postsError);
	}

	return {
		viewedUserProfile,
		isOwnProfile,
		session,
		posts: posts || [],
		stats: {
			posts: stats.posts,
			comments: stats.comments,
			likes: stats.likes
		}
	};
};
