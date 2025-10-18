# Quickstart: Service File Upload (Svelte Inline Implementation)

## Overview

This guide explains how to implement file uploads for download services using Svelte inline form actions. Studios can upload two files for their download services: a preview file (publicly accessible) and a product file (private, requires purchase).

## Prerequisites

- Studio user with approved status
- Service of type "download"
- Files to upload (any type, consistent size limits)

## Implementation Steps

### 1. Backend Setup

1. Ensure the `service_downloads` table exists in the database
2. Verify FileStorage service is properly configured
3. Implement server actions in the service edit page server file for file upload, removal, and retrieval

### 2. Frontend Integration

1. Add file upload components to the service edit page
2. Implement separate upload areas for preview and product files
3. Add file display and removal functionality
4. Ensure proper validation and user feedback

### 3. File Upload Process

1. User navigates to service edit page for a download service
2. User selects and uploads preview file (publicly accessible) using form action
3. User selects and uploads product file (private, requires purchase) using form action
4. System stores files using FileStorage service with appropriate access flags
5. System creates/updates service_downloads record linking files to service
6. On success: Files are available for access
7. On failure: Manual cleanup required per specification

### 4. File Access

- Preview files: Direct URL access for all users viewing the service
- Product files: Signed URL access for authenticated users with purchase rights

## Error Handling

- If file upload fails: Display error message to user via flash message
- If database operation fails: Log error and require manual cleanup
- If partial failure occurs: Log details and require manual cleanup

## Testing

1. Test file upload with various file types and sizes using form actions
2. Test public access to preview files
3. Test private access to product files with proper authentication
4. Test file removal functionality using form actions
5. Test error scenarios and manual cleanup requirements
6. Test service type validation (only "download" services should allow file uploads)
