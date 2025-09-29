# Implementation Plan: Services Page with Pagination

**Branch**: `001-build-a-light` | **Date**: 2025-09-24 | **Spec**: /specs/001-build-a-light/spec.md
**Input**: Feature specification from `/specs/001-build-a-light/spec.md`

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

The primary requirement is to refactor the `/services/+page.svelte` page to implement pagination with a "Load More" button, similar to the existing Posts component. The page already has filtering and search functionality that must be maintained.

Technical approach:

1. Create a reusable Services component similar to Posts.svelte that handles pagination
2. Implement client-side pagination with "Load More" button functionality
3. Display 9 services initially, then load additional batches on demand
4. Maintain existing search and filtering capabilities
5. Show "You reached bottom" message when no more services are available
6. Use toast() for error notifications
7. Follow Svelte 5 runes patterns for state management

## Technical Context

**Language/Version**: TypeScript with Svelte 5
**Primary Dependencies**: SvelteKit 5, Supabase, shadcn-svelte, Tailwind CSS
**Storage**: Supabase PostgreSQL (via Supabase client)
**Testing**: Vitest (unit) + Playwright (E2E)
**Target Platform**: Web browser (SvelteKit frontend)
**Project Type**: web
**Performance Goals**: Fast initial load with pagination (9 services per batch)
**Constraints**: Use existing Supabase client from SvelteKit hooks, maintain existing filtering functionality
**Scale/Scope**: Services page with pagination support for large numbers of services

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Based on the Feavel Docs Constitution v1.0.0, the following principles apply to this implementation:

1. **Type Safety First**: All code will be written in TypeScript with strict type checking. Runtime type checking will be implemented for API inputs using Zod schemas where applicable.

2. **Component-Based Architecture**: The implementation will follow a modular component structure with UI components in `src/lib/components/ui/` and feature components in `src/lib/components/modules/`. Reusable components will use Svelte 5 runes (`$state`, `$derived`, `$effect`) for state management.

3. **Supabase Integration Standards**: All database operations will use the Supabase client provided by SvelteKit hooks (`event.locals.supabase`). Row Level Security (RLS) policies are already implemented for all tables. Server-side authentication will use `auth.getUser()` rather than trusting client session data.

4. **Performance and Accessibility**: Queries will use `select()` to limit returned columns. Pagination will be implemented for large datasets (loading 9 services initially, then in batches). All components will be accessible with proper ARIA attributes and keyboard navigation support.

5. **Code Quality Standards**: All code will pass type checking with `bun run check`. Code formatting will be consistent using Prettier (`bun run format`). ESLint will be used for code linting.

6. **Git Workflow**: The feature branch follows the pattern `[###-feature-name]` (001-build-a-light). Commits will include descriptive messages following conventional commit format.

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

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 2 (Web application - frontend with SvelteKit structure)

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

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Create a reusable Services.svelte component based on the existing Posts.svelte component
- Implement pagination functionality with "Load More" button
- Maintain existing search and filtering functionality
- Add "You reached bottom" message when no more services are available
- Implement toast() notifications for error handling
- Create contract test task for the Services component
- Create integration test tasks based on user stories
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Component creation before functionality implementation
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

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

_Based on Constitution v1.0.0 - See `/memory/constitution.md`_
