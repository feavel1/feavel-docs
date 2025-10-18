# Research: Service File Upload Implementation (Svelte Inline Approach)

## Svelte Inline File Upload Patterns

**Decision**: Implement file uploads using Svelte inline forms with server actions approach
**Rationale**: The user prefers to avoid dedicated API routes and instead use SvelteKit's built-in form handling capabilities for file uploads. This integrates more closely with existing service edit forms.

### Approaches considered:

1. **Traditional API routes** - Create dedicated endpoints like `/api/services/{id}/upload-preview`
2. **Svelte inline with server actions** - Use Svelte's `enhance` directive with server load actions
3. **Form actions with method="POST"** - Handle file uploads directly in page server files

### Recommendation:

- Use SvelteKit form actions within the service edit page server file
- Follow the existing pattern in `src/routes/studios/dashboard/services/[service_id]/+page.server.ts`
- Implement file upload handling in the `const actions = { ... }` object

## Supabase File Storage Integration

**Decision**: Use existing FileStorage service for inline upload handling
**Rationale**: Leverages the established file storage infrastructure while maintaining consistency with platform patterns

- No new API surface area needed
- Reuses existing FileStorage class and patterns
- Follows the same validation and security patterns as avatar uploads

## Form Action Handling for File Uploads

**Decision**: Use multipart/form-data with SvelteKit actions for file processing
**Rationale**: Standard approach that works well with the `enhance` directive for graceful degradation

- Handle file validation and upload in server actions
- Maintain proper error handling and user feedback
- Keep session validation consistent with constitutional requirements

## Security Considerations for Inline File Uploads

**Decision**: Apply same security checks as dedicated API endpoints
**Rationale**: Security must not be compromised despite avoiding dedicated endpoints

- Verify user authorization within server action using studio validation
- Apply same file type and size validations as API approach
- Ensure service type is "download" before processing
