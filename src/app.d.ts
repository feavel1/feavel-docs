// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

// src/app.d.ts

import type { Database } from '$lib/types/database.types';
import { SupabaseClient, Session, User } from '@supabase/supabase-js';

declare module '*.svelte' {
	export { SvelteComponent as default } from 'svelte';
}

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession(): Promise<{ session: Session | null; user: User | null }>;
		}
		interface PageData {
			session: Session | null;
			user: User | null;
			userProfile?: {
				id: string;
				username: string | null;
				full_name: string | null;
				avatar_url: string | null;
				birthday: string | null;
				description: string | null;
			} | null;
		}
		// interface Error {}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				type: 'error' | 'success';
				text: string;
			};
		}
	}
}
