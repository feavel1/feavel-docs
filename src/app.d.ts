// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

// src/app.d.ts

import { SupabaseClient, Session } from '@supabase/supabase-js';

declare module '*.svelte' {
	export { SvelteComponent as default } from 'svelte';
}

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession(): Promise<{ session: Session | null; user: User | null }>;
		}
		interface PageData {
			session: Session | null;
			user: User | null;
			userProfile?: {
				id: string;
				username: string;
				full_name?: string;
				avatar_url?: string;
				birthday?: string;
				description?: string;
			} | null;
		}
		// interface Error {}
		// interface Platform {}
	}
}
