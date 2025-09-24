# Tasks: Services Page Pagination

**Input**: Design documents from `/specs/001-build-a-light/`
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
- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize TypeScript project with Svelte 5 dependencies
- [ ] T003 [P] Configure linting and formatting tools for SvelteKit

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P] Contract test for Services component in tests/contract/test_services_component.py
- [ ] T005 [P] Integration test for basic pagination in tests/integration/test_pagination.py
- [ ] T006 [P] Integration test for search functionality in tests/integration/test_search.py
- [ ] T007 [P] Integration test for category filtering in tests/integration/test_filtering.py
- [ ] T008 [P] Integration test for sorting functionality in tests/integration/test_sorting.py
- [ ] T009 [P] Integration test for error handling in tests/integration/test_error_handling.py

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T010 Create Services.svelte component in src/lib/components/modules/content/Services.svelte
- [ ] T011 Update services page server load in src/routes/services/+page.server.ts
- [ ] T012 Update services page client in src/routes/services/+page.svelte
- [ ] T013 Implement pagination logic with "Load More" button
- [ ] T014 Implement "You reached bottom" message
- [ ] T015 Implement toast() notifications for error handling
- [ ] T016 Maintain existing search and filtering functionality
- [ ] T017 Implement sorting functionality

## Phase 3.4: Integration
- [ ] T018 Connect Services component to Supabase client
- [ ] T019 Implement proper error handling with toast notifications
- [ ] T020 Add loading indicators during data fetch
- [ ] T021 Ensure accessibility with proper ARIA attributes

## Phase 3.5: Polish
- [ ] T022 [P] Unit tests for Services component in tests/unit/test_services_component.py
- [ ] T023 Performance tests for pagination (<200ms)
- [ ] T024 [P] Update documentation in docs/services-pagination.md
- [ ] T025 Remove code duplication and optimize
- [ ] T026 Run manual-testing.md validation checklist

## Dependencies
- Tests (T004-T009) before implementation (T010-T017)
- T010 blocks T012, T018
- T011 blocks T012
- Implementation before polish (T022-T026)

## Parallel Example
```
# Launch T004-T009 together:
Task: "Contract test for Services component in tests/contract/test_services_component.py"
Task: "Integration test for basic pagination in tests/integration/test_pagination.py"
Task: "Integration test for search functionality in tests/integration/test_search.py"
Task: "Integration test for category filtering in tests/integration/test_filtering.py"
Task: "Integration test for sorting functionality in tests/integration/test_sorting.py"
Task: "Integration test for error handling in tests/integration/test_error_handling.py"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

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
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task