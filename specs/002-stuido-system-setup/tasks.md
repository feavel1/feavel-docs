# Tasks: Studio System Setup

**Input**: Design documents from `/specs/002-stuido-system-setup/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup

- [ ] T001 Verify existing project structure per implementation plan
- [ ] T002 [P] Update CLAUDE.md with studio-specific patterns and guidelines
- [ ] T003 [P] Create studio utility functions file at src/lib/utils/studio.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T004 [P] Contract test GET /studios endpoint in specs/002-stuido-system-setup/tests/public-studios.test.ts
- [ ] T005 [P] Contract test POST /studios/apply endpoint in specs/002-stuido-system-setup/tests/studio-application.test.ts
- [ ] T006 [P] Contract test GET /studios/my-studio endpoint in specs/002-stuido-system-setup/tests/user-studio.test.ts
- [ ] T007 [P] Integration test public studios display in tests/integration/test_studios_public.ts
- [ ] T008 [P] Integration test studio application process in tests/integration/test_studios_application.ts
- [ ] T009 [P] Integration test studio dashboard access control in tests/integration/test_studios_dashboard.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T010 [P] Create Zod schema for studio application form in src/routes/studios/apply/+page.svelte
- [ ] T011 Implement studio application server-side logic in src/routes/studios/apply/+page.server.ts
- [ ] T012 [P] Create public studios page component in src/routes/studios/+page.svelte
- [ ] T013 Implement public studios server-side loading in src/routes/studios/+page.server.ts
- [ ] T014 [P] Create studio dashboard layout component in src/routes/studios/dashboard/+layout.svelte
- [ ] T015 Implement studio dashboard server-side loading in src/routes/studios/dashboard/+layout.server.ts
- [ ] T016 [P] Create studio dashboard main page in src/routes/studios/dashboard/+page.svelte
- [ ] T017 Implement studio dashboard server-side loading in src/routes/studios/dashboard/+page.server.ts
- [ ] T018 [P] Create studio settings page in src/routes/studios/dashboard/settings/+page.svelte
- [ ] T019 Implement studio settings server-side logic in src/routes/studios/dashboard/settings/+page.server.ts
- [ ] T020 [P] Create studio services page in src/routes/studios/dashboard/services/+page.svelte
- [ ] T021 Implement studio services server-side logic in src/routes/studios/dashboard/services/+page.server.ts
- [ ] T022 [P] Create studio orders page in src/routes/studios/dashboard/orders/+page.svelte
- [ ] T023 Implement studio orders server-side logic in src/routes/studios/dashboard/orders/+page.server.ts

## Phase 3.4: Integration

- [ ] T024 Connect studio application form to Supabase database
- [ ] T025 Connect public studios display to Supabase database
- [ ] T026 Implement studio status-based dashboard access control
- [ ] T027 Add proper error handling and user feedback for all studio operations
- [ ] T028 Implement studio application duplicate prevention logic

## Phase 3.5: Polish

- [ ] T029 [P] Add unit tests for studio utility functions in tests/unit/test_studio_utils.ts
- [ ] T030 [P] Update studio system documentation in docs/studio-system.md
- [ ] T031 Implement performance optimizations for studio queries
- [ ] T032 Add accessibility attributes to all studio components
- [ ] T033 Run manual-testing.md scenarios for studio system
- [ ] T034 Verify all constitutional principles are followed
- [ ] T035 Run bun run check to ensure no type errors

## Dependencies

- Tests (T004-T009) before implementation (T010-T023)
- T010 blocks T011
- T012 blocks T013
- T014 blocks T015, T016 blocks T017
- T018 blocks T019, T020 blocks T021, T022 blocks T023
- Implementation before polish (T029-T035)

## Parallel Example

```
# Launch T004-T006 together:
Task: "Contract test GET /studios endpoint in specs/002-stuido-system-setup/tests/public-studios.test.ts"
Task: "Contract test POST /studios/apply endpoint in specs/002-stuido-system-setup/tests/studio-application.test.ts"
Task: "Contract test GET /studios/my-studio endpoint in specs/002-stuido-system-setup/tests/user-studio.test.ts"

# Launch T007-T009 together:
Task: "Integration test public studios display in tests/integration/test_studios_public.ts"
Task: "Integration test studio application process in tests/integration/test_studios_application.ts"
Task: "Integration test studio dashboard access control in tests/integration/test_studios_dashboard.ts"

# Launch T010, T012, T014, T016, T018, T020, T022 together:
Task: "Create Zod schema for studio application form in src/routes/studios/apply/+page.svelte"
Task: "Create public studios page component in src/routes/studios/+page.svelte"
Task: "Create studio dashboard layout component in src/routes/studios/dashboard/+layout.svelte"
Task: "Create studio dashboard main page in src/routes/studios/dashboard/+page.svelte"
Task: "Create studio settings page in src/routes/studios/dashboard/settings/+page.svelte"
Task: "Create studio services page in src/routes/studios/dashboard/services/+page.svelte"
Task: "Create studio orders page in src/routes/studios/dashboard/orders/+page.svelte"
```

## Notes

- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules

_Applied during main() execution_

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task

2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks

3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist

_GATE: Checked by main() before returning_

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
