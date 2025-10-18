# Tasks: Service File Upload and Database Enhancements

**Input**: Design documents from `/specs/001-service-file-upload/`
**Prerequisites**: plan.md (required), research.md, data-model.md
**Constitution**: v2.0.0 - See `/memory/constitution.md`

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Core: models, services, components
   → Integration: DB, UI integration
   → Polish: documentation
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All entities have models?
   → All UI components identified?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup

- [x] T001 Verify service_downloads table exists in database with correct schema
- [ ] T002 [P] Review existing FileStorage service implementation patterns
- [ ] T003 [P] Review shadcn-svelte component patterns and usage

## Phase 3.2: Database Schema Implementation

- [x] T004 Update database.types.ts with service_downloads table definition if needed

## Phase 3.3: Backend Service Implementation

- [x] T005 [P] Create service file download utilities (src/lib/utils/serviceDownloads.ts)
- [x] T006 [P] Implement service file upload handlers (src/lib/utils/serviceDownloads.ts)
- [x] T007 [P] Add validation for download service file types and sizes (src/lib/utils/serviceDownloads.ts)
- [x] T008 [P] Implement service file removal functionality (src/lib/utils/serviceDownloads.ts)
- [x] T009 [P] Add service file access control methods (src/lib/utils/serviceDownloads.ts)

## Phase 3.4: UI Component Creation

- [x] T010 [P] Create Preview File Upload component using shadcn-svelte (src/lib/components/modules/services/PreviewFileUpload.svelte)
- [x] T011 [P] Create Product File Upload component using shadcn-svelte (src/lib/components/modules/services/ProductFileUpload.svelte)
- [x] T012 [P] Implement file display components for service pages using shadcn-svelte
- [x] T013 [P] Create service file management UI for studio dashboard using shadcn-svelte

## Phase 3.5: Service Edit Page Integration

- [x] T014 Modify service edit page to include file upload components (src/routes/studios/dashboard/services/[service_id]/+page.svelte)
- [x] T015 Update service edit page server logic to handle file associations without form actions (src/routes/studios/dashboard/services/[service_id]/+page.server.ts)
- [x] T016 Add validation for download service type restrictions with Zod if needed
- [x] T017 Implement error handling for partial upload failures

## Phase 3.6: Service Display Integration

- [x] T018 [P] Update service display page to show preview files (src/routes/services/[service_id]/+page.svelte)
- [x] T019 [P] Implement product file access for authenticated users with purchase rights
- [x] T020 [P] Add file information display components using shadcn-svelte

## Phase 3.7: Documentation

- [x] T021 [P] Update CLAUDE.md with service file upload patterns
- [x] T022 [P] Document service file upload component usage

## Dependencies

- T001-T004 (Database schema) blocks T005-T009 (Backend services)
- T005-T009 (Backend services) blocks T010-T013 (UI components)
- T010-T013 (UI components) blocks T014-T017 (Service edit integration)
- T014-T017 (Service edit integration) blocks T018-T020 (Display integration)
- Implementation before documentation (T021-T022)

## Parallel Example

```
# Launch T010-T011 together:
Task: "Create Preview File Upload component using shadcn-svelte (src/lib/components/modules/services/PreviewFileUpload.svelte)"
Task: "Create Product File Upload component using shadcn-svelte (src/lib/components/modules/services/ProductFileUpload.svelte)"

# Launch T005-T009 together:
Task: "Create service file download utilities (src/lib/utils/serviceDownloads.ts)"
Task: "Implement service file upload handlers (src/lib/utils/serviceDownloads.ts)"
Task: "Add validation for download service file types and sizes (src/lib/utils/serviceDownloads.ts)"
Task: "Implement service file removal functionality (src/lib/utils/serviceDownloads.ts)"
Task: "Add service file access control methods (src/lib/utils/serviceDownloads.ts)"
```

## Notes

- [P] tasks = different files, no dependencies
- Commit after each task
- Follow existing FileStorage service pattern as demonstrated in AvatarUpload.svelte
- Follow the manual cleanup approach for failed uploads as specified in requirements
- Use shadcn-svelte components for all UI elements
- No API endpoints required
- No form actions required (use direct integration)
- No testing tasks included

## Task Generation Rules

_Applied during main() execution_

1. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks

2. **From User Stories**:
   - Each story → implementation task [P]
   - Quickstart scenarios → validation tasks

3. **Ordering**:
   - Setup → Models → Services → UI Components → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All entities have model tasks
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
