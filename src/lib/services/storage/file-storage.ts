import type { SupabaseClient } from '@supabase/supabase-js';
import type { StorageFile, UploadConfig, FileValidationResult } from './types';

// Configuration for storage paths
const STORAGE_CONFIG = {
	BUCKETS: {
		PUBLIC: 'public-storage',
		PRIVATE: 'private-storage'
	},

	// File type categories
	FILE_CATEGORIES: {
		IMAGE: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'svg'],
		DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
		VIDEO: ['mp4', 'mov', 'avi', 'mkv'],
		AUDIO: ['mp3', 'wav', 'flac']
	}
} as const;

export class FileStorage {
	private supabase: SupabaseClient;

	constructor(supabase: SupabaseClient) {
		this.supabase = supabase;
	}

	/**
	 * Upload file with validation and database record
	 */
	async upload(config: UploadConfig): Promise<StorageFile | null> {
		const { file, options } = config;
		const {
			folder,
			bucket,
			entity_type,
			entity_id,
			is_public = false,
			upsert = false,
			maxFileSize = 50 * 1024 * 1024, // 50MB default
			allowedTypes
		} = options;

		// Determine upload target
		const targetBucket =
			bucket || (is_public ? STORAGE_CONFIG.BUCKETS.PUBLIC : STORAGE_CONFIG.BUCKETS.PRIVATE);

		// Validate file
		const validationResult = this.validateFile(file, {
			maxFileSize,
			allowedTypes
		});

		if (!validationResult.isValid) {
			console.error('File validation failed:', validationResult.errors);
			return null;
		}

		// Generate unique storage path
		const fileName = this.generateFileName(file.name);
		const storagePath = `${folder}/${fileName}`.replace('//', '/');

		try {
			// Upload to Supabase storage
			const { error: uploadError } = await this.supabase.storage
				.from(targetBucket)
				.upload(storagePath, file, {
					upsert,
					cacheControl: '3600'
				});

			if (uploadError) {
				console.error('Upload failed:', uploadError.message);
				return null;
			}

			// Create database record
			const { data: fileRecord, error: recordError } = await this.supabase
				.from('file_storage')
				.insert({
					original_filename: file.name,
					storage_path: storagePath,
					bucket_name: targetBucket,
					file_size: file.size,
					mime_type: validationResult.mime_type,
					file_type: this.getFileTypeFromMime(validationResult.mime_type),
					entity_type,
					entity_id: entity_id?.toString() || null,
					is_public,
					upload_date: new Date().toISOString()
				})
				.select()
				.single();

			if (recordError) {
				console.error('Database record creation failed:', recordError.message);
				// Clean up uploaded file if database insertion failed
				await this.supabase.storage.from(targetBucket).remove([storagePath]);
				return null;
			}

			// Generate public URL if necessary
			let url: string | null = null;
			if (is_public) {
				const { data } = this.supabase.storage.from(targetBucket).getPublicUrl(storagePath);
				url = data?.publicUrl || null;
			}

			return {
				storage_id: fileRecord.id,
				original_filename: file.name,
				storage_path: storagePath,
				bucket_name: targetBucket,
				file_size: file.size,
				mime_type: validationResult.mime_type || file.type,
				file_type: this.getFileTypeFromMime(validationResult.mime_type || file.type),
				url,
				metadata: fileRecord.metadata
			};
		} catch (error: any) {
			console.error('Upload process failed:', error.message);
			return null;
		}
	}

	/**
	 * Delete file by storage ID
	 */
	async delete(storageId: string): Promise<boolean> {
		try {
			// Fetch file record
			const { data: fileData, error: fetchError } = await this.supabase
				.from('file_storage')
				.select('*')
				.eq('id', storageId)
				.single();

			if (fetchError || !fileData) {
				console.error('File not found:', fetchError?.message);
				return false;
			}

			// Remove from Supabase storage
			const { error: removeError } = await this.supabase.storage
				.from(fileData.bucket_name)
				.remove([fileData.storage_path]);

			if (removeError) {
				console.error('Storage file removal failed:', removeError.message);
				// Continue to delete from DB even if storage removal failed
			}

			// Delete database record
			const { error: dbError } = await this.supabase
				.from('file_storage')
				.delete()
				.eq('id', storageId);

			if (dbError) {
				console.error('Database record deletion failed:', dbError.message);
				return false;
			}

			return true;
		} catch (error: any) {
			console.error('Delete operation failed:', error.message);
			return false;
		}
	}

	/**
	 * Get URL for a file by storage ID
	 */
	async getUrl(storageId: string): Promise<string | null> {
		const { data: fileData, error } = await this.supabase
			.from('file_storage')
			.select('*')
			.eq('id', storageId)
			.single();

		if (error || !fileData) {
			console.error('Failed to fetch file record:', error?.message);
			return null;
		}

		if (fileData.is_public) {
			const { data } = this.supabase.storage
				.from(fileData.bucket_name)
				.getPublicUrl(fileData.storage_path);
			return data?.publicUrl || null;
		}

		return null; // Private files require special access logic
	}

	/**
	 * Create a signed URL for private access (valid for 1 hour by default)
	 */
	async getSignedUrl(storageId: string, expireSeconds: number = 3600): Promise<string | null> {
		const { data: fileData, error } = await this.supabase
			.from('file_storage')
			.select('*')
			.eq('id', storageId)
			.single();

		if (error || !fileData) {
			console.error('File not found:', error?.message);
			return null;
		}

		if (fileData.is_public) {
			// Return public URL instead of signed URL
			return this.getUrl(storageId);
		}

		const { data, error: signError } = await this.supabase.storage
			.from(fileData.bucket_name)
			.createSignedUrl(fileData.storage_path, expireSeconds);

		if (signError) {
			console.error('Error generating signed URL:', signError.message);
			return null;
		}

		return data?.signedUrl || null;
	}

	/**
	 * Generic file validation
	 */
	private validateFile(
		file: File,
		constraints: { maxFileSize: number; allowedTypes?: string[] }
	): FileValidationResult {
		const errors: string[] = [];

		// Check file size
		if (file.size > constraints.maxFileSize) {
			const maxSizeMB = (constraints.maxFileSize / (1024 * 1024)).toFixed(2);
			errors.push(`File size must be less than ${maxSizeMB}MB`);
		}

		// Check file extension and MIME type
		const extension = file.name.split('.').pop()?.toLowerCase() || '';
		if (extension.length > 5 || !extension) {
			errors.push('Invalid file extension');
		}

		// Security check for dangerous extensions
		const dangerousExtensions = [
			'exe',
			'bat',
			'com',
			'pif',
			'scr',
			'js',
			'vbs',
			'sh',
			'php',
			'asp'
		];
		if (dangerousExtensions.includes(extension)) {
			errors.push(`Potentially dangerous file extension: ${extension}`);
		}

		// Check allowed types if specified
		if (constraints.allowedTypes && constraints.allowedTypes.length > 0) {
			const isAllowed = constraints.allowedTypes.some((allowed) => {
				const allowedLower = allowed.toLowerCase();
				const ext = extension as string; // The extension is likely already a reasonable type

				// Check directly for exact extension match or MIME startswith
				if (allowedLower === ext || file.type.startsWith(allowedLower)) {
					return true;
				}

				// Check against built-in categories without strict typing
				if (
					allowedLower === 'image' &&
					STORAGE_CONFIG.FILE_CATEGORIES.IMAGE.includes(ext as never)
				) {
					return true;
				}
				if (
					allowedLower === 'document' &&
					STORAGE_CONFIG.FILE_CATEGORIES.DOCUMENT.includes(ext as never)
				) {
					return true;
				}
				if (
					allowedLower === 'video' &&
					STORAGE_CONFIG.FILE_CATEGORIES.VIDEO.includes(ext as never)
				) {
					return true;
				}
				if (
					allowedLower === 'audio' &&
					STORAGE_CONFIG.FILE_CATEGORIES.AUDIO.includes(ext as never)
				) {
					return true;
				}

				return false;
			});

			if (!isAllowed) {
				errors.push(
					`File type "${extension}" is not allowed. Allowed types: ${constraints.allowedTypes.join(', ')}`
				);
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
			mime_type: file.type || undefined,
			file_size: file.size
		};
	}

	/**
	 * Helper to get max file size based on context
	 */
	static getMaxFileSize(folder: string): number {
		// Custom sizes based on folder context
		if (folder.includes('avatars')) {
			return 2 * 1024 * 1024; // 2MB
		}
		if (folder.includes('covers')) {
			return 5 * 1024 * 1024; // 5MB
		}
		if (folder.includes('embedded')) {
			return 10 * 1024 * 1024; // 10MB
		}
		return 50 * 1024 * 1024; // 50MB default
	}

	/**
	 * Helper to get allowed types based on context
	 */
	static getAllowedTypes(folder: string): string[] {
		// Context-aware type restrictions
		if (folder.includes('avatars') || folder.includes('covers')) {
			return [...STORAGE_CONFIG.FILE_CATEGORIES.IMAGE];
		}
		if (folder.includes('docs') || folder.includes('attachments')) {
			return [...STORAGE_CONFIG.FILE_CATEGORIES.DOCUMENT];
		}
		// General default
		return [...STORAGE_CONFIG.FILE_CATEGORIES.IMAGE, ...STORAGE_CONFIG.FILE_CATEGORIES.DOCUMENT];
	}

	private generateFileName(originalName: string): string {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 10);
		const ext = originalName.split('.').pop()?.toLowerCase() || 'bin';

		return `${timestamp}-${random}.${ext}`;
	}

	private getFileTypeFromMime(mimeType: string | undefined): string {
		if (!mimeType) return 'unknown';

		if (mimeType.startsWith('image/')) return 'image';
		if (mimeType.startsWith('video/')) return 'video';
		if (mimeType.startsWith('audio/')) return 'audio';
		if (mimeType.startsWith('application/pdf')) return 'document';
		if (mimeType.startsWith('text/')) return 'text';

		return 'other';
	}
}
