# Tasks: Studio Services Dashboard

**Input**: Design documents from `/specs/005-create-a-simple/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/
**Constitution**: v2.0.0 - See `/memory/constitution.md`

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → implementation task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume web app structure based on plan.md

## Phase 3.1: Setup

- [ ] T001 Verify SvelteKit 5 with TypeScript setup and dependencies
- [ ] T002 [P] Configure linting and formatting tools for Svelte 5
- [ ] T003 [P] Verify shadcn-svelte components are installed and configured

## Phase 3.2: Core Implementation

- [ ] T004 [P] Create studio services page component at src/routes/studios/dashboard/services/+page.svelte
- [ ] T005 [P] Update studio dashboard layout server file at src/routes/studios/dashboard/+layout.server.ts
- [ ] T006 [P] Verify existing Services component at src/lib/components/modules/content/Services.svelte can accept initial services data
- [ ] T007 [P] Verify existing ServiceCard component at src/lib/components/modules/cards/ServiceCard.svelte displays status indicators
- [ ] T008 Implement data fetching logic for studio services in +layout.server.ts

## Phase 3.3: Integration

- [ ] T009 Connect studio services page to Supabase database using event.locals.supabase
- [ ] T010 Implement parent-child data flow using await parent() in server files
- [ ] T011 Ensure proper authentication and authorization checks for studio status
- [ ] T012 Implement error handling for database operations and service unavailability

## Phase 3.4: Polish

- [ ] T013 [P] Update documentation for studio services dashboard feature
- [ ] T014 Ensure accessibility standards are met for all components
- [ ] T015 Verify mobile responsiveness of the studio services page
- [ ] T016 Run performance validation with Lighthouse or similar tools

## Dependencies

- T004 blocks T006 (page component must exist before verifying component integration)
- T005 blocks T008 (layout server file must be updated before implementing data fetching)
- T009 blocks T011 (database connection must be established before auth checks)
- Implementation before polish (T013-T016)

## Parallel Example

```
# Launch T004-T007 together:
Task: "Create studio services page component at src/routes/studios/dashboard/services/+page.svelte"
Task: "Update studio dashboard layout server file at src/routes/studios/dashboard/+layout.server.ts"
Task: "Verify existing Services component at src/lib/components/modules/content/Services.svelte can accept initial services data"
Task: "Verify existing ServiceCard component at src/lib/components/modules/cards/ServiceCard.svelte displays status indicators"
```

## Notes

- [P] tasks = different files, no dependencies
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → implementation task [P]
   - Each endpoint → implementation task

2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks

3. **From User Stories**:
   - Each story → implementation task [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All entities have model tasks
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
