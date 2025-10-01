import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { redirect } from '@sveltejs/kit';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) return { session: null, user: null };
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) return { session: null, user: null };
		return { session, user };
	};

	// Authentication checks for protected routes
	if (event.url.pathname.startsWith('/member/dashboard')) {
		const { session, user } = await event.locals.safeGetSession();
		if (!session || !user) {
			throw redirect(303, '/auth/login');
		}
	}

	if (event.url.pathname.startsWith('/studios/dashboard')) {
		const { session, user } = await event.locals.safeGetSession();
		if (!session || !user) {
			throw redirect(303, '/auth/login');
		}

		// Check if user is a studio
		const { data: studio } = await event.locals.supabase
			.from('studios')
			.select('id')
			.eq('user_id', user.id)
			.maybeSingle();

		if (!studio) {
			throw redirect(303, '/member/dashboard');
		}
	}

	return handleParaglide({ event, resolve });
};
