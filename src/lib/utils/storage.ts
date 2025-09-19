import type { SupabaseClient } from '@supabase/supabase-js';

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

// Storage configuration
const STORAGE_CONFIG = {
	BUCKET: 'storage',
	FOLDERS: {
		AVATARS: 'avatars',
		POST_COVERS: 'post_covers',
		SERVICE_COVERS: 'service_covers'
	}
} as const;

// Storage path management
export class StoragePath {
	static avatars(filename: string): string {
		return `${STORAGE_CONFIG.FOLDERS.AVATARS}/${filename}`;
	}

	static postCovers(filename: string): string {
		return `${STORAGE_CONFIG.FOLDERS.POST_COVERS}/${filename}`;
	}

	static serviceCovers(filename: string): string {
		return `${STORAGE_CONFIG.FOLDERS.SERVICE_COVERS}/${filename}`;
	}

	static fromPath(path: string): { folder: string; filename: string } {
		const parts = path.split('/');
		if (parts.length < 2) {
			return { folder: '', filename: path };
		}
		return { folder: parts[0], filename: parts.slice(1).join('/') };
	}

	static getBucket(): string {
		return STORAGE_CONFIG.BUCKET;
	}
}

// Core storage operations
export async function uploadFile(
	supabase: SupabaseClient,
	path: string,
	options: UploadOptions
): Promise<StorageFile | null> {
	const { file, bucket = StoragePath.getBucket(), upsert = false } = options;

	try {
		const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
			upsert,
			cacheControl: '3600'
		});

		if (error) {
			console.error(`Upload error for ${path}:`, error.message);
			return null;
		}

		const url = await getFileUrl(supabase, path, { path, bucket });
		return {
			path: data.path,
			url: url || '',
			size: file.size,
			mimeType: file.type
		};
	} catch (error: any) {
		console.error(`Upload failed for ${path}:`, error.message || error);
		return null;
	}
}

export async function downloadFile(
	supabase: SupabaseClient,
	path: string,
	options: DownloadOptions
): Promise<Blob | null> {
	const { bucket = StoragePath.getBucket() } = options;

	try {
		const { data, error } = await supabase.storage.from(bucket).download(path);

		if (error) {
			console.error(`Download error for ${path}:`, error.message);
			return null;
		}

		return data;
	} catch (error: any) {
		console.error(`Download failed for ${path}:`, error.message || error);
		return null;
	}
}

export async function deleteFile(
	supabase: SupabaseClient,
	path: string,
	options: DownloadOptions
): Promise<boolean> {
	const { bucket = StoragePath.getBucket() } = options;

	try {
		const { error } = await supabase.storage.from(bucket).remove([path]);

		if (error) {
			console.error(`Delete error for ${path}:`, error.message);
			return false;
		}

		return true;
	} catch (error: any) {
		console.error(`Delete failed for ${path}:`, error.message || error);
		return false;
	}
}

export async function getFileUrl(
	supabase: SupabaseClient,
	path: string,
	options: DownloadOptions
): Promise<string | null> {
	const { bucket = StoragePath.getBucket() } = options;

	try {
		const { data } = supabase.storage.from(bucket).getPublicUrl(path);
		return data.publicUrl;
	} catch (error: any) {
		console.error(`Get URL failed for ${path}:`, error.message || error);
		return null;
	}
}

// Image compression utility
export async function compressImage(
	file: File,
	maxWidth = 1200,
	maxHeight = 800,
	quality = 0.9
): Promise<File> {
	return new Promise((resolve, reject) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			reject(new Error('Could not get canvas context'));
			return;
		}

		const img = new Image();

		img.onload = () => {
			try {
				let { width, height } = img;
				if (width > height) {
					if (width > maxWidth) {
						height = (height * maxWidth) / width;
						width = maxWidth;
					}
				} else {
					if (height > maxHeight) {
						width = (width * maxHeight) / height;
						height = maxHeight;
					}
				}

				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0, width, height);
				canvas.toBlob(
					(blob) => {
						if (blob) {
							const compressedFile = new File([blob], file.name, {
								type: 'image/jpeg',
								lastModified: Date.now()
							});
							resolve(compressedFile);
						} else {
							resolve(file);
						}
					},
					'image/jpeg',
					quality
				);
			} catch (error) {
				console.error('Image compression failed:', error);
				resolve(file); // Return original file if compression fails
			}
		};

		img.onerror = () => {
			console.error('Failed to load image for compression');
			resolve(file); // Return original file if loading fails
		};

		img.src = URL.createObjectURL(file);
	});
}

// Avatar management
export async function uploadAvatar(
	supabase: SupabaseClient,
	file: File,
	userId: string
): Promise<StorageFile | null> {
	const timestamp = Date.now();
	const random = Math.random();
	const extension = file.name.split('.').pop() || 'jpeg';
	const filename = `${timestamp}.${random}.${extension}`;
	const path = StoragePath.avatars(filename);

	try {
		const compressedFile = await compressImage(file, 400, 400, 0.8);
		const result = await uploadFile(supabase, path, {
			file: compressedFile,
			bucket: StoragePath.getBucket(),
			upsert: true
		});

		if (!result) {
			console.error('Failed to upload avatar file');
			return null;
		}

		const { error: updateError } = await supabase
			.from('users')
			.update({ avatar_url: filename })
			.eq('id', userId);

		if (updateError) {
			console.error('Failed to update avatar_url in database:', updateError.message);
			await deleteFile(supabase, path, { path, bucket: StoragePath.getBucket() });
			return null;
		}

		return result;
	} catch (error: any) {
		console.error('Avatar upload failed:', error.message || error);
		return null;
	}
}

export async function deleteAvatar(
	supabase: SupabaseClient,
	userId: string,
	avatarFilename?: string
): Promise<boolean> {
	if (!avatarFilename) return true;

	const path = StoragePath.avatars(avatarFilename);
	const fileDeleted = await deleteFile(supabase, path, { path, bucket: StoragePath.getBucket() });

	if (fileDeleted) {
		const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', userId);
		if (error) {
			console.error('Failed to clear avatar_url in database:', error.message);
			return false;
		}
		return true;
	}

	return false;
}

// Post cover management
export async function uploadPostCover(
	supabase: SupabaseClient,
	file: File
): Promise<string | null> {
	const timestamp = Date.now();
	const random = Math.random();
	const extension = file.name.split('.').pop() || 'jpeg';
	const filename = `${timestamp}.${random}.${extension}`;
	const path = StoragePath.postCovers(filename);

	try {
		// Compress the image
		const compressedFile = await compressImage(file);

		// Upload the file
		const result = await uploadFile(supabase, path, {
			file: compressedFile,
			bucket: StoragePath.getBucket(),
			upsert: true
		});

		if (!result) {
			console.error('Failed to upload post cover file');
			return null;
		}

		// Return only the filename, not the full path
		return filename;
	} catch (error: any) {
		console.error('Post cover upload failed:', error.message || error);
		return null;
	}
}

// Utility for handling post form data with optional file uploads
export async function createPostFormData(
	data: {
		id?: number;
		title: string;
		content: any;
		cover?: string;
		public_visibility: boolean;
		tags: string[];
	},
	coverFile?: File | null
): Promise<FormData | string> {
	if (coverFile) {
		const formData = new FormData();
		formData.append(
			'data',
			JSON.stringify(data)
		);
		formData.append('cover', coverFile);
		return formData;
	} else {
		return JSON.stringify(data);
	}
}

// Utility to get full URL from filename for different file types
export function getAvatarUrl(filename: string, supabase: SupabaseClient): string {
	if (!filename) return '';

	try {
		const path = StoragePath.avatars(filename);
		const { data } = supabase.storage.from(StoragePath.getBucket()).getPublicUrl(path);
		return data.publicUrl;
	} catch (error: any) {
		console.error('Failed to get avatar URL:', error.message || error);
		return '';
	}
}

export function getPostCoverUrl(filename: string, supabase: SupabaseClient): string {
	if (!filename) return '';

	try {
		const path = StoragePath.postCovers(filename);
		const { data } = supabase.storage.from(StoragePath.getBucket()).getPublicUrl(path);
		return data.publicUrl;
	} catch (error: any) {
		console.error('Failed to get post cover URL:', error.message || error);
		return '';
	}
}
