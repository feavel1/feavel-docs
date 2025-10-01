// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { getUserProfile } from '$lib/utils/user';
import { getMostUsedItems } from '$lib/utils/shared';
import { getUserStudio } from '$lib/utils/studio';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, cookies }) => {
	const { session, user } = await safeGetSession();

	// If user is logged in, fetch their profile
	let userProfile = null;
	let userStudio = null;
	if (session?.user) {
		userProfile = await getUserProfile(supabase, session.user.id);
		// Fetch user's studio information if they are a studio
		userStudio = await getUserStudio(supabase, session.user.id);
	}

	// Fetch the most used tags for navigation
	const mostUsedTags = await getMostUsedItems(supabase, {
		relationshipTable: 'posts_tags_rel',
		foreignKey: 'post_tags',
		nameField: 'tag_name',
		limit: 5,
		cacheKey: 'mostUsedTags'
	});

	// Fetch the most used categories for navigation
	const mostUsedCategories = await getMostUsedItems(supabase, {
		relationshipTable: 'services_category_rel',
		foreignKey: 'services_category',
		nameField: 'category_name',
		limit: 5,
		cacheKey: 'mostUsedCategories'
	});

	return {
		session,
		user,
		userProfile,
		userStudio,
		mostUsedTags: mostUsedTags || [],
		mostUsedCategories: mostUsedCategories || [],
		cookies: cookies.getAll()
	};
};
