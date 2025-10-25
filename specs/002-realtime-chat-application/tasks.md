# Tasks: Realtime Chat Application

**Input**: Design documents from `/specs/002-realtime-chat-application/`
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

- [ ] T001 Configure Supabase Realtime with database triggers per research.md
- [ ] T002 [P] Verify existing chat database tables and RLS policies
- [ ] T003 [P] Set up proper authentication and authorization for chat features

## Phase 3.2: Core Implementation

- [ ] T004 [P] Update chat utility functions in src/lib/utils/chatUtils.ts
- [ ] T005 [P] Implement real-time subscription functions in src/lib/utils/chatUtils.ts
- [ ] T006 [P] Create database triggers for message broadcasting using realtime.broadcast_changes
- [ ] T007 Update studio application process in src/routes/studios/apply/+page.server.ts to automatically create group chats
- [ ] T008 [P] Enhance ChatContainer.svelte with real-time subscription management
- [ ] T009 [P] Enhance ConversationList.svelte with real-time updates
- [ ] T010 [P] Enhance MessageList.svelte with real-time message updates
- [ ] T011 [P] Enhance GroupChatManager.svelte with group functionality
- [ ] T012 Update main chat route in src/routes/chat/+page.svelte for real-time subscriptions
- [ ] T013 [P] Implement group chat joining functionality for all users
- [ ] T014 [P] Add pagination for message history in large groups
- [ ] T015 [P] Implement proper cleanup and unsubscribe logic for real-time subscriptions
- [ ] T016 [P] Add remote functions for clean server-side chat operations (see remote-functions-integration.md)
- [ ] T017 Implement message rate limiting on the server side

## Phase 3.3: Integration

- [ ] T018 Connect chat utilities to Supabase client following constitutional requirements
- [ ] T019 Implement proper error handling for network and validation errors
- [ ] T020 Add accessibility features to all chat UI components
- [ ] T021 Implement virtual scrolling for MessageList and ConversationList

## Phase 3.4: Polish

- [ ] T022 [P] Update documentation in CLAUDE.md with real implementation details
- [ ] T023 [P] Update existing chat UI components to support both private and group chats
- [ ] T024 Performance optimization for large group chats (50+ participants)
- [ ] T025 Run manual-testing.md scenarios from quickstart guide
- [ ] T026 [P] Remove any remaining dummy implementations
- [ ] T027 [P] Ensure all components follow Svelte 5 runes patterns
- [ ] T028 Run type checking and formatting validation

## Dependencies

- T004-T005 blocks T008-T012
- T006 blocks T015
- T007 blocks T013
- T018 blocks T020
- Implementation before polish (T022-T028)

## Parallel Example

```
# Launch T004-T005 together:
Task: "Update chat utility functions in src/lib/utils/chatUtils.ts"
Task: "Implement real-time subscription functions in src/lib/utils/chatUtils.ts"

# Launch T008-T011 together:
Task: "Enhance ChatContainer.svelte with real-time subscription management"
Task: "Enhance ConversationList.svelte with real-time updates"
Task: "Enhance MessageList.svelte with real-time message updates"
Task: "Enhance GroupChatManager.svelte with group functionality"
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
