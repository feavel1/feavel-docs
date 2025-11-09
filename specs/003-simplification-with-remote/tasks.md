# Tasks: Simplification with Remote Functions

**Input**: Design documents from `/specs/003-simplification-with-remote/`
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
- [ ] T002 Initialize TypeScript project with SvelteKit 5 dependencies
- [ ] T003 [P] Configure linting and formatting tools for TypeScript/Svelte

## Phase 3.2: Posts System Implementation (High Priority)

### Core Remote Functions Implementation

- [ ] T004 [P] Create posts.remote.ts with Supabase join optimization for core post data
- [ ] T005 Implement getPostByIdWithJoins(postId: number) function with all related data
- [ ] T006 Implement getPublicPostsWithJoins(options) function with pagination support
- [ ] T007 Implement getDraftsWithJoins(userId: string) function for user drafts
- [ ] T008 Implement getPostsByTagWithJoins(tagName: string) function for tag-based filtering
- [ ] T009 Implement getPostCommentsOptimized(postId: number, options) function for paginated comments

### Route Updates

- [ ] T010 Update src/routes/posts/+page.server.ts to use remote functions instead of complex queries
- [ ] T011 Update src/routes/posts/[post_id]/+page.server.ts to use remote functions instead of complex queries

### Utility Function Simplification

- [ ] T012 Refactor src/lib/utils/posts.ts to remove data fetching logic, keep only client-side utilities
- [ ] T013 Refactor src/lib/utils/tags.ts to remove data fetching logic, keep only client-side utilities

### Component Updates

- [ ] T014 [P] Update post components to use remote functions with proper error handling
- [ ] T015 Implement error handling with {#if query.error} pattern in post components

## Phase 3.3: Services System Implementation (High Priority)

### Core Remote Functions Implementation

- [ ] T016 [P] Create services.remote.ts with Supabase join optimization
- [ ] T017 Implement getServiceByIdWithJoins(serviceId: string) function with all related data
- [ ] T018 Implement getServiceCategoriesWithJoins() function for category listing
- [ ] T019 Implement getServiceFilesWithJoins(serviceId: string) function for file access
- [ ] T020 Implement checkServiceAccessOptimized(serviceId: string, userId: string) function

### Route Updates

- [ ] T021 Update src/routes/services/+page.server.ts to remove category fetching
- [ ] T022 Update src/routes/services/[service_id]/+page.server.ts to use remote functions

### Component Updates

- [ ] T023 [P] Update service components to use remote functions with proper error handling
- [ ] T024 Implement error handling with {#if query.error} pattern in service components

## Phase 3.4: Chat System Implementation (High Priority)

### Core Remote Functions Implementation

- [ ] T025 [P] Update chat.remote.ts with Supabase join optimization (replace current placeholder)
- [ ] T026 Implement getUserConversationsWithJoins(userId: string) function
- [ ] T027 Implement getConversationMessagesOptimized(conversationId: string, options) function
- [ ] T028 Implement sendMessageOptimized(data) function with database-based rate limiting
- [ ] T029 Implement createGroupChatWithJoins(data) function
- [ ] T030 Implement joinGroupChatOptimized(conversationId: string, userId: string) function
- [ ] T031 Implement getGroupInfoWithJoins(conversationId: string) function
- [ ] T032 Implement getPublicGroupChatsWithJoins() function

### Utility Function Simplification

- [ ] T033 Refactor src/lib/utils/chatUtils.ts to remove server-side logic, keep only client-side utilities

### Component Updates

- [ ] T034 [P] Update chat components to use remote functions with proper error handling
- [ ] T035 Implement error handling with {#if query.error} pattern in chat components

## Phase 3.5: Additional Remote Functions

### Tags System Remote Functions

- [ ] T036 [P] Create tags.remote.ts with Supabase optimization
- [ ] T037 Implement getAllTagsOptimized() function for comprehensive tag listing

### Utility Functions

- [ ] T038 [P] Implement validateInputOptimized(value, schema) utility function
- [ ] T039 Implement paginateResultsOptimized(data, page, limit) utility function
- [ ] T040 Implement handleDatabaseErrorOptimized(error) utility function

## Phase 3.6: Navigation System Updates

### Component Updates

- [ ] T041 [P] Update navigation components to use optimized remote functions
- [ ] T042 Implement error handling with {#if query.error} pattern in navigation components

## Phase 3.7: Integration & Testing

### Integration

- [ ] T043 Connect remote functions to Supabase client properly
- [ ] T044 Implement proper error handling and logging across all remote functions
- [ ] T045 Ensure session validation through hooks is maintained
- [ ] T046 Verify parent-child data flow implementation

### Testing & Validation

- [ ] T047 Performance optimization with Supabase joins (measure before/after)
- [ ] T048 [P] Update documentation for remote functions
- [ ] T049 Remove code duplication across similar functions
- [ ] T050 Run manual testing with bun run check after each system update

## Dependencies

- T004-T009 blocks T010-T015 (Posts system)
- T016-T020 blocks T021-T024 (Services system)
- T025-T032 blocks T033-T035 (Chat system)
- T036-T037 blocks T041-T042 (Navigation updates)
- Implementation before polish (T047-T050)
- Route updates before component updates
- Remote functions before route updates

## Parallel Example

```
# Launch initial remote function files creation:
Task: "Create posts.remote.ts with Supabase join optimization for core post data"
Task: "Create services.remote.ts with Supabase join optimization"
Task: "Update chat.remote.ts with Supabase join optimization (replace current placeholder)"
Task: "Create tags.remote.ts with Supabase optimization"
```

## Notes

- [P] tasks = different files, no dependencies
- Commit after each task
- Run `bun run check` after each system update to verify types are correct
- Focus on maintainability and simplicity as primary goals
- Follow incremental approach - complete one system before moving to the next
- Avoid: vague tasks, same file conflicts
- No formatting or testing required per user instructions

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
