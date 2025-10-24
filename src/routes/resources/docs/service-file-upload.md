# Service File Upload Documentation

This document provides detailed information about the service file upload functionality for download-type services.

## Overview

For services with the "download" type, studios can upload two types of files:

1. **Preview File**: A public file that users can access to preview the service
2. **Product File**: A private file that only purchasers can access

## Components

### ServiceDownloads Utility Class

The `ServiceDownloads` class (`src/lib/utils/serviceDownloads.ts`) is the core utility for handling all service file operations.

Key methods:

- `getServiceFiles(serviceId: string)`: Retrieve file information for a service
- `uploadPreviewFile(serviceId: string, file: File, maxFileSize?: number, allowedTypes?: string[])`: Upload a preview file
- `uploadProductFile(serviceId: string, file: File, maxFileSize?: number, allowedTypes?: string[])`: Upload a product file
- `removePreviewFile(serviceId: string)`: Remove the preview file
- `removeProductFile(serviceId: string)`: Remove the product file
- `removeAllFiles(serviceId: string)`: Remove all files associated with a service
- `validateServiceType(serviceId: string)`: Validate that a service is of type "download"

### PreviewFileUpload Component

The `PreviewFileUpload.svelte` component (`src/lib/components/modules/services/PreviewFileUpload.svelte`) provides the UI for uploading and managing preview files.

Features:

- File selection with validation
- Upload progress feedback
- File preview display
- File removal functionality
- Error handling

### ProductFileUpload Component

The `ProductFileUpload.svelte` component (`src/lib/components/modules/services/ProductFileUpload.svelte`) provides the UI for uploading and managing product files.

Features:

- File selection with validation
- Upload progress feedback
- File information display (without preview for security)
- File removal functionality
- Error handling

### ServiceFileManager Component

The `ServiceFileManager.svelte` component (`src/lib/components/modules/services/ServiceFileManager.svelte`) provides a unified interface for managing both preview and product files.

Features:

- Tab-based navigation between preview and product file management
- Service type validation
- Integration with both upload components

### ServiceFileDisplay Component

The `ServiceFileDisplay.svelte` component (`src/lib/components/modules/services/ServiceFileDisplay.svelte`) displays files on service pages with appropriate access controls.

Features:

- Preview file display with download button
- Product file display with conditional access
- Access validation for product files
- File type icons and information

## Implementation Details

### Database Schema

The `service_downloads` table links services to their files:

- `service_id`: Foreign key to the services table
- `preview_file_id`: Storage ID for the preview file
- `product_file_id`: Storage ID for the product file

### File Storage

Files are stored using the `FileStorage` service with the following configuration:

- Preview files: `is_public: true`
- Product files: `is_public: false`

### Error Handling

The system implements manual cleanup for partial failures:

1. If a file is uploaded but the database operation fails, the file is automatically deleted from storage
2. If a database record is created but the file upload fails, the record is cleaned up
3. All operations include comprehensive error logging

### Access Control

- Preview files are publicly accessible for enabled services
- Product files require purchase verification through the `digital_order` table
- Only users with a "paid" status order can access product files

## Integration Examples

### Studio Dashboard Integration

The service edit page (`src/routes/studios/dashboard/services/[service_id]/+page.svelte`) integrates file management through the `ServiceFileManager` component.

### Service Display Integration

The service display page (`src/routes/services/[service_id]/+page.svelte`) shows files using the `ServiceFileDisplay` component with appropriate access controls.

## Best Practices

1. Always validate service type before allowing file operations
2. Implement proper error handling and cleanup for partial failures
3. Use the provided components rather than implementing custom solutions
4. Follow the existing patterns for file type and size validation
5. Ensure proper access controls for private files
