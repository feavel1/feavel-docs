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

// Storage path management
export class StoragePath {
	private static readonly BUCKETS = {
		DEFAULT: 'storage',
		AVATARS: 'storage',
		POST_COVERS: 'storage'
	} as const;

	private static readonly FOLDERS = {
		AVATARS: 'avatars',
		POST_COVERS: 'post_covers',
		SERVICE_COVERS: 'service_covers'
	} as const;

	static avatars(filename: string): string {
		return `${this.FOLDERS.AVATARS}/${filename}`;
	}

	static postCovers(filename: string): string {
		return `${this.FOLDERS.POST_COVERS}/${filename}`;
	}

	static serviceCovers(filename: string): string {
		return `${this.FOLDERS.SERVICE_COVERS}/${filename}`;
	}

	static fromPath(path: string): { folder: string; filename: string } {
		const parts = path.split('/');
		if (parts.length < 2) {
			return { folder: '', filename: path };
		}
		return { folder: parts[0], filename: parts.slice(1).join('/') };
	}

	static getBucket(): string {
		return this.BUCKETS.DEFAULT;
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
			console.error('Upload error:', error);
			return null;
		}

		const url = await getFileUrl(supabase, path, { path, bucket });
		return {
			path: data.path,
			url: url || '',
			size: file.size,
			mimeType: file.type
		};
	} catch (error) {
		console.error('Upload failed:', error);
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
			console.error('Download error:', error);
			return null;
		}

		return data;
	} catch (error) {
		console.error('Download failed:', error);
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
			console.error('Delete error:', error);
			return false;
		}

		return true;
	} catch (error) {
		console.error('Delete failed:', error);
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
	} catch (error) {
		console.error('Get URL failed:', error);
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
	return new Promise((resolve) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d')!;
		const img = new Image();

		img.onload = () => {
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

		if (!result) return null;

		const { error: updateError } = await supabase
			.from('users')
			.update({ avatar_url: filename })
			.eq('id', userId);

		if (updateError) {
			console.error('Failed to update avatar_url:', updateError);
			await deleteFile(supabase, path, { path, bucket: StoragePath.getBucket() });
			return null;
		}

		return result;
	} catch (error) {
		console.error('Avatar upload failed:', error);
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
	const success = await deleteFile(supabase, path, { path, bucket: StoragePath.getBucket() });

	if (success) {
		const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', userId);
		if (error) console.error('Failed to clear avatar_url:', error);
	}

	return success;
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

		if (!result) return null;

		// Return only the filename, not the full path
		return filename;
	} catch (error) {
		console.error('Post cover upload failed:', error);
		return null;
	}
}

// Utility to get full URL from filename for different file types
export function getAvatarUrl(filename: string, supabase: SupabaseClient): string {
	if (!filename) return '';
	
	const path = StoragePath.avatars(filename);
	const { data } = supabase.storage.from(StoragePath.getBucket()).getPublicUrl(path);
	return data.publicUrl;
}

export function getPostCoverUrl(filename: string, supabase: SupabaseClient): string {
	if (!filename) return '';
	
	const path = StoragePath.postCovers(filename);
	const { data } = supabase.storage.from(StoragePath.getBucket()).getPublicUrl(path);
	return data.publicUrl;
}