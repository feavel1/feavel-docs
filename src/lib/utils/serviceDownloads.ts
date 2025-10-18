import type { SupabaseClient } from '@supabase/supabase-js';
import { FileStorage } from '$lib/services/storage/file-storage';
import type { Tables } from '$lib/types/database.types.ts';

export type ServiceDownloadFiles = {
	preview_file_id: string | null;
	product_file_id: string | null;
	preview_file_url: string | null;
	product_file_url: string | null;
};

/**
 * Service download utilities for handling file operations for download-type services
 */
export class ServiceDownloads {
	private supabase: SupabaseClient;
	private storage: FileStorage;

	constructor(supabase: SupabaseClient) {
		this.supabase = supabase;
		this.storage = new FileStorage(supabase);
	}

	/**
	 * Get file information for a service
	 */
	async getServiceFiles(serviceId: string): Promise<ServiceDownloadFiles | null> {
		const { data, error } = await this.supabase
			.from('service_downloads')
			.select('*')
			.eq('service_id', serviceId)
			.maybeSingle();

		if (error) {
			console.error('Error fetching service download files:', error.message);
			return null;
		}

		// If no record exists, return null values
		if (!data) {
			return {
				preview_file_id: null,
				product_file_id: null,
				preview_file_url: null,
				product_file_url: null
			};
		}

		// Get URLs for both files
		const previewUrl = data.preview_file_id
			? await this.storage.getUrl(data.preview_file_id)
			: null;
		const productUrl = data.product_file_id
			? await this.storage.getSignedUrl(data.product_file_id)
			: null;

		return {
			preview_file_id: data.preview_file_id,
			product_file_id: data.product_file_id,
			preview_file_url: previewUrl,
			product_file_url: productUrl
		};
	}

	/**
	 * Upload a preview file for a service
	 */
	async uploadPreviewFile(
		serviceId: string,
		file: File,
		maxFileSize?: number,
		allowedTypes?: string[]
	): Promise<string | null> {
		return this.uploadFile(serviceId, file, 'preview', maxFileSize, allowedTypes);
	}

	/**
	 * Upload a product file for a service
	 */
	async uploadProductFile(
		serviceId: string,
		file: File,
		maxFileSize?: number,
		allowedTypes?: string[]
	): Promise<string | null> {
		return this.uploadFile(serviceId, file, 'product', maxFileSize, allowedTypes);
	}

	/**
	 * Private helper method to upload a file (preview or product)
	 */
	private async uploadFile(
		serviceId: string,
		file: File,
		fileType: 'preview' | 'product',
		maxFileSize?: number,
		allowedTypes?: string[]
	): Promise<string | null> {
		// Upload file to storage
		const result = await this.storage.upload({
			file,
			options: {
				folder: fileType === 'preview' ? 'services/previews' : 'services/products',
				entity_type: 'service',
				entity_id: serviceId,
				is_public: fileType === 'preview',
				maxFileSize,
				allowedTypes
			}
		});

		if (!result) {
			return null;
		}

		// Get existing service download record or create new one
		const existingRecord = await this.getServiceDownloadRecord(serviceId);

		if (existingRecord) {
			// Update existing record
			const { error } = await this.supabase
				.from('service_downloads')
				.update({
					[fileType === 'preview' ? 'preview_file_id' : 'product_file_id']: result.storage_id
				})
				.eq('service_id', serviceId);

			if (error) {
				console.error('Failed to update service download record:', error.message);
				// Clean up uploaded file if database update failed
				await this.storage.delete(result.storage_id);
				return null;
			}
		} else {
			// Create new record
			const { error } = await this.supabase.from('service_downloads').insert({
				service_id: serviceId,
				preview_file_id: fileType === 'preview' ? result.storage_id : null,
				product_file_id: fileType === 'product' ? result.storage_id : null,
				created_at: new Date().toISOString()
			});

			if (error) {
				console.error('Failed to create service download record:', error.message);
				// Clean up uploaded file if database insertion failed
				await this.storage.delete(result.storage_id);
				return null;
			}
		}

		return result.storage_id;
	}

	/**
	 * Remove preview file from a service
	 */
	async removePreviewFile(serviceId: string): Promise<boolean> {
		return this.removeFile(serviceId, 'preview');
	}

	/**
	 * Remove product file from a service
	 */
	async removeProductFile(serviceId: string): Promise<boolean> {
		return this.removeFile(serviceId, 'product');
	}

	/**
	 * Private helper method to remove a file (preview or product)
	 */
	private async removeFile(serviceId: string, fileType: 'preview' | 'product'): Promise<boolean> {
		const record = await this.getServiceDownloadRecord(serviceId);

		const fileId = fileType === 'preview' ? record?.preview_file_id : record?.product_file_id;

		if (!fileId) {
			return true; // Nothing to remove
		}

		// Delete file from storage
		const deleted = await this.storage.delete(fileId);

		if (!deleted) {
			console.error(`Failed to delete ${fileType} file from storage`);
			return false;
		}

		// Update database record
		const { error } = await this.supabase
			.from('service_downloads')
			.update({
				[fileType === 'preview' ? 'preview_file_id' : 'product_file_id']: null
			})
			.eq('service_id', serviceId);

		if (error) {
			console.error('Failed to update service download record:', error.message);
			return false;
		}

		return true;
	}

	/**
	 * Remove all files associated with a service (cleanup)
	 */
	async removeAllFiles(serviceId: string): Promise<boolean> {
		let success = true;

		// Remove preview file if exists
		const previewSuccess = await this.removePreviewFile(serviceId);
		if (!previewSuccess) {
			success = false;
		}

		// Remove product file if exists
		const productSuccess = await this.removeProductFile(serviceId);
		if (!productSuccess) {
			success = false;
		}

		// Delete database record
		const { error } = await this.supabase
			.from('service_downloads')
			.delete()
			.eq('service_id', serviceId);

		if (error) {
			console.error('Failed to delete service download record:', error.message);
			success = false;
		}

		return success;
	}

	/**
	 * Validate that a service is of type "download"
	 */
	async validateServiceType(serviceId: string): Promise<boolean> {
		const { data, error } = await this.supabase
			.from('services')
			.select('type')
			.eq('id', serviceId)
			.single();

		if (error || !data) {
			return false;
		}

		return data.type === 'download';
	}

	/**
	 * Helper to get existing service download record
	 */
	private async getServiceDownloadRecord(
		serviceId: string
	): Promise<Tables<'service_downloads'> | null> {
		const { data, error } = await this.supabase
			.from('service_downloads')
			.select('*')
			.eq('service_id', serviceId)
			.maybeSingle();

		if (error) {
			return null;
		}

		return data;
	}
}
