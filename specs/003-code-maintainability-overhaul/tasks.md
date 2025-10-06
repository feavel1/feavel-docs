# Tasks: Code Maintainability Overhaul

**Input**: Design documents from `/specs/003-code-maintainability-overhaul/`
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

- **Web app**: `src/routes/`, `src/lib/`

## Phase 3.1: Setup

- [ ] T001 Review current layout server files to identify data fetching patterns in src/routes/+layout.server.ts and src/routes/studios/dashboard/+layout.server.ts
- [ ] T002 [P] Analyze utility functions in src/lib/utils/studio.ts to identify candidates for removal
- [ ] T003 [P] Review user profile utilities in src/lib/utils/user.ts for data consolidation opportunities

## Phase 3.2: Core Implementation

- [ ] T004 Create consolidated user profile data model with embedded studio information in src/lib/types/database.types.ts
- [ ] T005 [P] Refactor getUserProfile function in src/lib/utils/user.ts to include studio data
- [ ] T006 [P] Remove redundant getUserStudio function from src/lib/utils/studio.ts
- [ ] T007 [P] Remove hasUserAppliedToStudio function from src/lib/utils/studio.ts
- [ ] T008 [P] Remove checkStudioDashboardAccess function from src/lib/utils/studio.ts
- [ ] T009 Update +layout.server.ts to use consolidated user profile data fetching in src/routes/+layout.server.ts
- [ ] T010 Update studio dashboard +layout.server.ts to use consolidated data access in src/routes/studios/dashboard/+layout.server.ts
- [ ] T011 Replace direct studio status checks with userProfile.studio.status access patterns throughout the codebase

## Phase 3.3: Integration

- [ ] T012 Update studio dashboard access control to use consolidated data in src/routes/studios/dashboard/+layout.server.ts
- [ ] T013 Ensure proper error handling for consolidated data fetching operations
- [ ] T014 Update any remaining components that directly access userStudio to use consolidated userProfile.studio

## Phase 3.4: Polish

- [ ] T015 [P] Remove unused utility functions from src/lib/utils/studio.ts
- [ ] T016 Validate type safety with bun run check
- [ ] T017 Update documentation to reflect consolidated data access patterns
- [ ] T018 Manual testing of critical user flows including studio application and dashboard access

## Dependencies

- T004 blocks T005, T009
- T005 blocks T009, T010
- T009 blocks T010, T011
- T010 blocks T012
- Core implementation before polish (T015-T018)

## Parallel Example

```
# Launch T002-T003 together:
Task: "Analyze utility functions in src/lib/utils/studio.ts to identify candidates for removal"
Task: "Review user profile utilities in src/lib/utils/user.ts for data consolidation opportunities"

# Launch T005-T008 together:
Task: "Refactor getUserProfile function in src/lib/utils/user.ts to include studio data"
Task: "Remove redundant getUserStudio function from src/lib/utils/studio.ts"
Task: "Remove hasUserAppliedToStudio function from src/lib/utils/studio.ts"
Task: "Remove checkStudioDashboardAccess function from src/lib/utils/studio.ts"
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
