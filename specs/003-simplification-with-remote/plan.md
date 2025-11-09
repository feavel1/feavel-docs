# Implementation Plan: Simplification with Remote Functions

**Branch**: `003-simplification-with-remote` | **Date**: 2025-11-09 | **Spec**: [/specs/003-simplification-with-remote/spec.md](/specs/003-simplification-with-remote/spec.md)
**Input**: Feature specification from `/specs/003-simplification-with-remote/spec.md`

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

This plan outlines the refactoring of the Feavel Docs application to use Svelte's async remote functions for reducing code complexity while maximizing Supabase's selective single fetch joins where appropriate. The approach focuses on consolidating data fetching patterns in centralized remote functions with clear, descriptive naming conventions, simplifying server-side loading files, and improving separation between client and server logic. The refactoring emphasizes using Supabase's powerful join capabilities to minimize JavaScript mapping operations, resulting in better performance and cleaner code. The refactoring will be implemented in phases: posts system, services system, and chat system, following the existing navigation system as a reference implementation. Pagination-aware data (such as post comments) will be handled separately to maintain proper pagination functionality. Function names will follow clear naming conventions that describe what they do rather than implementation details.

## Technical Context

**Language/Version**: TypeScript with Svelte 5 runes
**Primary Dependencies**: SvelteKit 5, Supabase, TypeScript, Svelte 5
**Storage**: Supabase (PostgreSQL) with selective single fetch joins
**Target Platform**: Web application
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Improved SSR performance with Svelte's async remote functions and optimized Supabase queries
**Constraints**: Maintain existing functionality without adding new logic, maximize use of Supabase joins where appropriate while respecting pagination requirements, use clear and descriptive function names that don't include implementation details like "joins"
**Scale/Scope**: Full Feavel Docs application with posts, tags, services, and chat functionality

**Function Naming Convention**: Function names should be clear and descriptive, focusing on what they do rather than how they do it. Avoid implementation-specific terms like "joins" or "optimized" in function names. Instead, use names that clearly describe the purpose and data being fetched.

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
src/
├── lib/
│   ├── components/
│   │   ├── modules/
│   │   └── ui/
│   ├── remote/
│   ├── utils/
│   ├── services/
│   └── types/
├── routes/
│   ├── posts/
│   ├── services/
│   ├── chat/
│   └── [other routes]/
└── app.html
```

**Structure Decision**: Option 1 (Single project) - The Feavel Docs application follows a SvelteKit structure with a single src/ directory containing lib/ for shared code and routes/ for page components.

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
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each remote function implementation → implementation task [P]
- Each route update → refactoring task
- Each utility function simplification → refactoring task
- Component update tasks for each system (posts, services, chat)
- Separate pagination-aware data handling tasks
- Function naming review tasks to ensure clear, descriptive names

**Ordering Strategy**:

- Dependency order: Core remote functions before pagination functions before route updates before component updates
- Mark [P] for parallel execution (independent files)
- Group by system (posts, services, chat) for logical organization
- Include function naming review as part of each implementation task

**Estimated Output**: 45-55 numbered, ordered tasks in tasks.md

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
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---

_Based on Constitution v2.0.0 - See `/memory/constitution.md`_
