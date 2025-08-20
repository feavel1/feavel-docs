// This file is kept for Supabase client initialization and auth-related functions
// Storage functions have been moved to storage.ts to avoid duplication

export interface StorageFile {
	path: string;
	url: string;
	size?: number;
	mimeType?: string;
}

export interface UploadOptions {
	file: File;
	bucket?: string;
	upsert?: boolean;
}

export interface DownloadOptions {
	path: string;
	bucket?: string;
}

// Real-time subscription helpers (to be implemented)
// export function subscribeToTable(supabase: SupabaseClient, table: string, callback: (payload: any) => void) {
//   return supabase.channel(table).on('postgres_changes', { event: '*', schema: 'public', table }, callback).subscribe();
// }
