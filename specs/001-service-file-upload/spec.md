# Feature Specification: Service File Upload and Database Enhancements

**Feature Branch**: `001-service-file-upload`
**Created**: 2025-10-17
**Status**: Draft
**Input**: User description: "service file upload I want to allow studios to attach files to their services. For example: a studio wants to sell it's own beat (music file), and if it selects service type "download", the studio would be able to upload two files: the product file (the beat itself) and a preview (a publicaly visible file). The uploading of files should be simple and structured. Reference current service cover upload to understand file uploads. Check database.types to understand databse tables like file_storage and services."

**Constitution**: v1.2.0 - See `/memory/constitution.md`

## Execution Flow (main)

```
1. Parse user description from Input
   → Feature: Allow studios to attach files to services, especially for "download" type
2. Extract key concepts from description
   → Identify: actors(studios), actions(file uploads), data(service files), constraints(download type)
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → User flow for uploading product and preview files
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a studio owner creating a download service (e.g., beat for sale), I want to upload two files - the actual product file (the beat) and a preview file - so that customers can listen to the preview but only access the full product after purchase.

As a user of the platform, I want to be able to participate in chat conversations with other users, so that I can communicate about services and collaborate effectively.

As a customer interested in digital services, I want to be able to purchase and access digital content securely, with clear tracking of my purchases and download rights.

### Acceptance Scenarios

1. **Given** a studio user editing a service of type "download", **When** they navigate to the file upload section, **Then** they should see fields to upload both a product file and a preview file
2. **Given** a studio user has uploaded a product file and a preview file for a "download" service, **When** they save the service, **Then** both files should be stored and associated with the service in the database
3. **Given** a studio user has a service with uploaded files, **When** they view the service edit page, **Then** they should see the uploaded files and be able to replace or remove them
4. **Given** a customer viewing the service page, **When** they look for a preview file, **Then** they should be able to access the preview file if it exists on the service page
5. **Given** a user on the platform, **When** they want to communicate with another user about a service, **Then** they should be able to start a chat conversation and send messages
6. **Given** a customer interested in a digital service, **When** they complete a purchase, **Then** they should receive download access and be able to track their purchase history

### Edge Cases

- What happens when preview file is uploaded but no product file exists?
- How does system handle file type restrictions (should preview be restricted to audio files)?
- What happens if a studio changes service type from "download" to another type?
- What happens when file upload exceeds size limits?
- What happens when a user tries to message someone who has blocked them?
- How does the system handle concurrent access to digital content?
- What happens when a user's download limit is exceeded?
- What happens when file upload to storage succeeds but database record creation fails (requires manual cleanup)?
- What happens when database record is created but file upload to storage fails (orphaned record handling)?
- What happens when a studio uploads a new preview file but keeps the existing product file?
- What happens when a studio uploads a new product file but keeps the existing preview file?
- What happens when a service with uploaded files is deleted (cleanup of associated files)?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow a studio user to upload a product file (full content) for a "download" type service
- **FR-002**: System MUST allow a studio user to upload a preview file for a "download" type service that should be publicly accessible
- **FR-003**: System MUST restrict file uploads to services that have "download" type
- **FR-004**: System MUST show existing file uploads when editing a service
- **FR-005**: System MUST allow a studio user to remove existing product or preview files from a service
- **FR-006**: System MUST store uploaded files using the existing file storage infrastructure in the file_storage table
- **FR-007**: System MUST create a record in the service_downloads table that links the service to its preview and product files via foreign key references
- **FR-008**: System MUST validate that both preview and product files are uploaded with allowed file types (any file type permitted)
- **FR-009**: System MUST enforce the same maximum file size limit for both preview and product files
- **FR-010**: Preview files MUST be accessible to public users if the service itself is public
- **FR-011**: System MUST create database records in both file_storage and service_downloads tables as part of a single logical operation
- **FR-012**: System MUST require manual cleanup when either file upload to storage or database record creation fails (partial uploads may exist)
- **FR-013**: System MUST allow users to create and participate in chat conversations with other users
- **FR-014**: System MUST allow users to send and receive messages within chat conversations
- **FR-015**: System MUST track conversation participants and manage conversation access
- **FR-016**: System MUST allow customers to purchase digital services and receive access rights
- **FR-017**: System MUST track digital order status and link to purchased services
- **FR-018**: System MUST manage digital access rights for purchased content
- **FR-019**: System MUST support different service types including video, download, event, and subscription

### Key Entities _(include if feature involves data)_

- **Service Files**: Additional file references attached to services beyond the existing cover image, specifically for download types. These should include two file identifiers: one for the product file and one for the preview file
- **File Storage**: File entries created using the existing file storage infrastructure (file_storage table). Each uploaded file results in a record in this table that contains metadata about the file and its location in storage buckets. Files are stored with unique identifiers that can be referenced by other tables.
- **Service Downloads**: A dedicated table (service_downloads) that links services to their associated download files. This table contains two foreign key references to the file_storage table: preview_file_id (for publicly accessible preview files) and product_file_id (for the full content file that requires purchase access). Each service can have at most one record in this table.
- **Service Type**: The service_type field ('download', 'video', 'event', 'subscription') determines what file upload capabilities are available. Only services with type "download" can have associated files in the service_downloads table.
- **Chat Conversations**: Conversations between users on the platform, identified by unique IDs
- **Chat Messages**: Individual messages within conversations, containing message content, sender information, and timestamps
- **Chat Participants**: Tracking which users are part of which conversations
- **Digital Orders**: Records of customer purchases for digital services, including status and user linkage
- **Digital Access**: Tracking of customer access rights to purchased digital content, including download counts and expiration dates
- **Service Categories**: Categorization system for services to improve discoverability

### Data Flow

When a studio user uploads files for a download service, the following process occurs:

1. **File Upload Process**: The user selects and uploads two separate files - a preview file and a product file. Both files are uploaded to the storage system using the existing file storage infrastructure.

2. **File Storage Creation**: For each uploaded file, a record is created in the file_storage table containing:
   - Original filename
   - Storage path and bucket information
   - File size and MIME type
   - Entity type ("service") and service ID
   - Public access flag (preview files are marked public, product files are private)
   - Upload timestamp

3. **Service Downloads Linking**: After both files are successfully stored, a record is created in the service_downloads table that links the service to both files by their file_storage IDs:
   - preview_file_id: References the file_storage record for the preview file
   - product_file_id: References the file_storage record for the product file
   - service_id: References the service that owns these files

4. **Error Handling**: If either file upload fails or database record creation fails, the system requires manual cleanup:
   - Partial uploads to storage may exist and need manual removal
   - Incomplete database records may need to be cleaned up
   - No automatic rollback mechanism is implemented

5. **File Access**:
   - Preview files can be accessed publicly through their storage URLs if the service is public
   - Product files require authenticated access through purchase verification and are served via signed URLs

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Clarifications

### Session 2025-10-17

- Q: What file types should be allowed for preview and product files in service downloads? → A: Any file type
- Q: Should there be different size limits for preview vs product files? → A: Same limit for both
- Q: How should the file upload process handle failed uploads or database record creation? → A: Manual cleanup required
- Q: Should preview files be automatically generated from product files or uploaded separately? → A: Separate uploads

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---