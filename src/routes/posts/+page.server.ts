import type { Post } from '$lib/remote/posts.remote';
import type { PageServerLoad } from './$types';
import { getDrafts } from '$lib/remote/posts.remote';

export const load: PageServerLoad = async ({ parent }) => {
	const { session } = await parent();

	// Fetch drafts for logged-in users using remote function
	let drafts: Post[] = [];
	if (session) {
		drafts = await getDrafts(session.user.id);
	}

	return {
		drafts
	};
};
