import type { SupabaseClient } from '@supabase/supabase-js';
import { FileStorage } from '$lib/services/storage/file-storage';

/**
 * Upload a file for use with Editor.js attaches tool
 * @param supabase Supabase client instance
 * @param file File to upload
 * @param postId Post ID to associate the file with
 * @returns Editor.js attaches block data or null on failure
 */
export async function uploadAttachesFile(
	supabase: SupabaseClient,
	file: File,
	postId: number
): Promise<{
	url: string;
	size: number;
	name: string;
	title: string;
	extension: string;
} | null> {
	try {
		const storage = new FileStorage(supabase);
		const result = await storage.upload({
			file,
			options: {
				folder: `posts/${postId}/attachments`,
				entity_type: 'post',
				entity_id: postId.toString(),
				is_public: true
			}
		});

		if (!result) {
			return null;
		}

		return {
			url: result.url || '',
			size: result.file_size,
			name: result.original_filename,
			title: result.original_filename,
			extension: result.file_type || file.name.split('.').pop() || ''
		};
	} catch (error) {
		console.error('Error uploading attaches file:', error);
		return null;
	}
}
