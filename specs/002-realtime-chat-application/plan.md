# Implementation Plan: Realtime Chat Application

**Branch**: `002-realtime-chat-application` | **Date**: 2025-10-25 | **Spec**: [spec.md](/specs/002-realtime-chat-application/spec.md)
**Input**: Feature specification from `/specs/002-realtime-chat-application/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

The Realtime Chat Application feature will implement a comprehensive chat system with both private one-on-one conversations and group chats supporting up to 100 participants. The system will use Supabase Broadcast with database triggers for real-time message delivery, automatically create group chats when studios apply to the platform, and allow all users to join any studio group chat with a single click. Messages will be stored for one year and delivered to offline users when they come online. The implementation will follow Svelte 5 runes for state management and adhere to the Feavel Docs Constitution for type safety, component architecture, and performance requirements. The existing UI components will be enhanced to support real-time functionality without requiring new API routes.

## Technical Context

**Language/Version**: TypeScript with Svelte 5
**Primary Dependencies**: Supabase JavaScript client, SvelteKit 5, Svelte 5 runes
**Storage**: Supabase PostgreSQL database with Realtime capabilities
**Target Platform**: Web application (SvelteKit frontend with Supabase backend)
**Project Type**: Web application
**Performance Goals**: Real-time message delivery with minimal latency, support for group chats with up to 100 participants
**Constraints**: Must use Supabase client from SvelteKit hooks, follow component-based architecture with Svelte 5 runes, maintain type safety with TypeScript, NO new API routes required (existing UI handles different chats and conversations)
**Scale/Scope**: Support for large group chats with 50+ participants, message retention for one year

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- All database operations MUST use the Supabase client provided by SvelteKit hooks (`event.locals.supabase`)
- Session validation and permission checks MUST be handled at the hook level (`hooks.server.ts`) rather than in individual route files
- Parent-child data flow MUST be implemented through `await parent()` in server files
- Inherited data MUST be accessed through props in Svelte components
- Type safety MUST be maintained with TypeScript and Zod validation
- Code MUST follow the component-based architecture with Svelte 5 runes
- Performance and accessibility requirements MUST be met

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└──

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└──

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application) - The project follows the existing SvelteKit structure with frontend components in src/lib/components/ and routes in src/routes/. No new API routes will be created as the existing UI already handles different chats and conversations.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (UI components specification, data model, quickstart)
- Each UI component → implementation task [P]
- Each entity → database and utility function implementation task [P]
- Real-time subscription and broadcast implementation tasks
- Database trigger implementation tasks
- Studio integration tasks for automatic group creation
- Testing and validation tasks
- NO tasks for API routes as existing UI handles different chats and conversations

**Ordering Strategy**:

- Dependency order: Database schema and utility functions before UI components
- Core functionality before advanced features
- Backend implementation before frontend integration
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v2.0.0 - See `/memory/constitution.md`_
