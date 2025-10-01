# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
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
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

## Phase 3.2: Core Implementation
- [ ] T004 [P] User model in src/models/user.py
- [ ] T005 [P] UserService CRUD in src/services/user_service.py
- [ ] T006 [P] CLI --create-user in src/cli/user_commands.py
- [ ] T007 POST /api/users endpoint
- [ ] T008 GET /api/users/{id} endpoint
- [ ] T009 Input validation
- [ ] T010 Error handling and logging

## Phase 3.3: Integration
- [ ] T011 Connect UserService to DB
- [ ] T012 Auth middleware
- [ ] T013 Request/response logging
- [ ] T014 CORS and security headers

## Phase 3.4: Polish
- [ ] T015 Performance optimization (<200ms)
- [ ] T016 [P] Update docs/api.md
- [ ] T017 Remove duplication
- [ ] T018 Run manual-testing.md

## Dependencies
- T004 blocks T005, T011
- T012 blocks T014
- Implementation before polish (T015-T018)

## Parallel Example
```
# Launch T004-T006 together:
Task: "User model in src/models/user.py"
Task: "UserService CRUD in src/services/user_service.py"
Task: "CLI --create-user in src/cli/user_commands.py"
```

## Notes
- [P] tasks = different files, no dependencies
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

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
*GATE: Checked by main() before returning*

- [ ] All entities have model tasks
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task