import type { Database } from '$lib/types/database.types';

export interface FileUploadOptions {
  file: File;
  bucket?: string;
  entity_type?: 'user' | 'post' | 'service' | 'digital';
  entity_id?: string | number;
  folder: string;
  is_public?: boolean;
  upsert?: boolean;
}

export interface FileConstraints {
  maxFileSize: number;
  allowedTypes?: string[];
  allowCustomTypes?: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  mime_type?: string;
  file_size?: number;
}

export interface StorageFile {
  storage_id: string;
  original_filename: string;
  storage_path: string;
  bucket_name: string;
  file_size: number;
  mime_type: string;
  file_type: string;
  url: string | null;
  metadata?: Database['public']['Tables']['file_storage']['Row']['metadata'];
}

export interface UploadConfig {
  file: File;
  options: {
    bucket?: string;
    folder: string;
    entity_type?: 'user' | 'post' | 'service' | 'digital';
    entity_id?: string | number;
    is_public?: boolean;
    upsert?: boolean;
    maxFileSize?: number;
    allowedTypes?: string[];
  };
}