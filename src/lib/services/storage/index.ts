import { FileStorage } from './file-storage';
import { ImageProcessor } from './image-processor';
import type { SupabaseClient } from '@supabase/supabase-js';

// Export the simplified storage system
export { FileStorage, ImageProcessor };

// Convenience function for creating storage instances
export function createFileStorage(supabase: SupabaseClient) {
	const fileStorage = new FileStorage(supabase);
	return fileStorage;
}

// Export helpers
export { type StorageFile, type UploadConfig } from './types';
