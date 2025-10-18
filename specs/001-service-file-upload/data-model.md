# Data Model: Service File Upload

## Entities

### ServiceDownloads

Represents the association between a service and its download files.

**Fields:**

- `service_id` (string, primary key, foreign key to services.id)
- `preview_file_id` (string, foreign key to file_storage.id) - Publicly accessible file
- `product_file_id` (string, foreign key to file_storage.id) - Private file requiring purchase access
- `created_at` (timestamp) - When the association was created

**Relationships:**

- One-to-one with services (each service can have at most one ServiceDownloads record)
- Many-to-one with file_storage for both preview_file_id and product_file_id

**Validation Rules:**

- Both preview_file_id and product_file_id must reference valid file_storage records
- Files referenced must have appropriate public/private access flags
- Service must be of type "download"

### FileStorage (Existing Entity)

Enhanced with public access differentiation.

**Fields:**

- `id` (string, primary key) - Unique identifier for the file
- `original_filename` (string) - Original name of the uploaded file
- `storage_path` (string) - Path to the file in storage
- `bucket_name` (string) - Storage bucket name
- `file_size` (number) - Size of the file in bytes
- `mime_type` (string) - MIME type of the file
- `file_type` (string) - Category of the file (image, document, etc.)
- `entity_type` (string) - Type of entity the file belongs to ("service")
- `entity_id` (string) - ID of the entity the file belongs to (service ID)
- `is_public` (boolean) - Whether the file is publicly accessible
- `upload_date` (timestamp) - When the file was uploaded

**Validation Rules:**

- Preview files must have is_public = true
- Product files must have is_public = false
- entity_type must be "service" for download service files

### Services (Existing Entity)

Extended to support the download type.

**Fields:**

- All existing fields from the services table
- `type` (enum: 'video', 'download', 'event', 'subscription') - Determines available file upload capabilities

## State Transitions

### File Upload Process

1. User selects preview and/or product files
2. Files are uploaded to storage with appropriate public/private flags
3. FileStorage records are created
4. ServiceDownloads record is created/updated linking the service to the files
5. On failure: Manual cleanup required per specification

## Access Patterns

### Public Access (Preview Files)

- Direct URL access through FileStorage.getUrl() for public files
- Available to all users viewing the service page

### Private Access (Product Files)

- Signed URL access through FileStorage.getSignedUrl() for authenticated users with purchase rights
- Available only to users who have purchased the service
