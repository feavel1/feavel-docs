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

export async function uploadAvatar(
	supabase: SupabaseClient,
	file: File,
	userId: string
): Promise<StorageFile | null> {
	const timestamp = Date.now();
	const random = Math.random();
	const extension = file.name.split('.').pop() || 'jpeg';
	const filename = `${timestamp}.${random}.${extension}`;
	const path = `avatars/${filename}`;

	try {
		const result = await uploadFile(supabase, {
			file,
			path,
			bucket: 'storage',
			upsert: true
		});

		if (!result) return null;

		const { error: updateError } = await supabase
			.from('users')
			.update({ avatar_url: filename })
			.eq('id', userId);

		if (updateError) {
			console.error('Failed to update avatar_url:', updateError);
			await deleteFile(supabase, { path, bucket: 'storage' });
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

	const path = `avatars/${avatarFilename}`;
	const success = await deleteFile(supabase, { path, bucket: 'storage' });

	if (success) {
		const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', userId);
		if (error) console.error('Failed to clear avatar_url:', error);
	}

	return success;
}
