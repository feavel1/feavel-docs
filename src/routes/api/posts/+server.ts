import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * This API endpoint is kept for backward compatibility but is no longer used
 * by the main post editing interface. All post operations are now handled
 * through the utility functions in $lib/utils/posts.ts
 */

export const POST: RequestHandler = async () => {
	return json({ error: 'This endpoint is deprecated. Use the client-side post operations instead.' }, { status: 410 });
};

export const PUT: RequestHandler = async () => {
	return json({ error: 'This endpoint is deprecated. Use the client-side post operations instead.' }, { status: 410 });
};

export const DELETE: RequestHandler = async () => {
	return json({ error: 'This endpoint is deprecated. Use the client-side post operations instead.' }, { status: 410 });
};