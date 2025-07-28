import type { SupabaseClient } from '@supabase/supabase-js';

export interface StorageFile {
	path: string;
	url: string;
	size?: number;
	mimeType?: string;
}

export interface UploadOptions {
	file: File;
	path: string;
	bucket?: string;
	upsert?: boolean;
}

export interface DownloadOptions {
	path: string;
	bucket?: string;
}

/**
 * Upload a file to Supabase storage
 */
export async function uploadFile(
	supabase: SupabaseClient,
	options: UploadOptions
): Promise<StorageFile | null> {
	const { file, path, bucket = 'storage', upsert = false } = options;

	try {
		const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
			upsert,
			cacheControl: '3600'
		});

		if (error) {
			console.error('Upload error:', error);
			return null;
		}

		const url = await getFileUrl(supabase, { path, bucket });
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

/**
 * Download a file from Supabase storage
 */
export async function downloadFile(
	supabase: SupabaseClient,
	options: DownloadOptions
): Promise<Blob | null> {
	const { path, bucket = 'storage' } = options;

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

/**
 * Delete a file from Supabase storage
 */
export async function deleteFile(
	supabase: SupabaseClient,
	options: DownloadOptions
): Promise<boolean> {
	const { path, bucket = 'storage' } = options;

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

/**
 * Get a public URL for a file
 */
export async function getFileUrl(
	supabase: SupabaseClient,
	options: DownloadOptions
): Promise<string | null> {
	const { path, bucket = 'storage' } = options;

	try {
		const { data } = supabase.storage.from(bucket).getPublicUrl(path);

		return data.publicUrl;
	} catch (error) {
		console.error('Get URL failed:', error);
		return null;
	}
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(
	supabase: SupabaseClient,
	file: File,
	userId: string
): Promise<StorageFile | null> {
	const fileExt = file.name.split('.').pop();
	const fileName = `${userId}/avatar.${fileExt}`;

	const result = await uploadFile(supabase, {
		file,
		path: fileName,
		bucket: 'storage',
		upsert: true
	});

	return result;
}

/**
 * Delete user avatar
 */
export async function deleteAvatar(supabase: SupabaseClient, userId: string): Promise<boolean> {
	return await deleteFile(supabase, {
		path: `${userId}/avatar`,
		bucket: 'storage'
	});
}

/**
 * Get avatar URL for a user
 */
export async function getAvatarUrl(
	supabase: SupabaseClient,
	userId: string
): Promise<string | null> {
	return await getFileUrl(supabase, {
		path: `${userId}/avatar`,
		bucket: 'storage'
	});
}

/**
 * Update user avatar URL in database
 */
export async function updateUserAvatar(
	supabase: SupabaseClient,
	userId: string,
	avatarUrl: string
): Promise<boolean> {
	try {
		const { error } = await supabase
			.from('users')
			.update({ avatar_url: avatarUrl })
			.eq('id', userId);

		if (error) {
			console.error('Update avatar URL error:', error);
			return false;
		}

		return true;
	} catch (error) {
		console.error('Update avatar URL failed:', error);
		return false;
	}
}

/**
 * Complete avatar upload process
 */
export async function uploadUserAvatar(
	supabase: SupabaseClient,
	file: File,
	userId: string
): Promise<StorageFile | null> {
	// Upload the file
	const uploadResult = await uploadAvatar(supabase, file, userId);

	if (!uploadResult) {
		return null;
	}

	// Update the user's avatar_url in the database
	const updateSuccess = await updateUserAvatar(supabase, userId, uploadResult.url);

	if (!updateSuccess) {
		// If database update fails, delete the uploaded file
		await deleteAvatar(supabase, userId);
		return null;
	}

	return uploadResult;
}
