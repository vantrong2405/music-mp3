---
name: planning-and-task-breakdown
description: Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
---

# Planning and Task Breakdown

## Overview

Decompose work into small, verifiable tasks with explicit acceptance criteria. Every task must be small enough to implement, test, and verify in one focused session. **Always create a TodoList after planning** — written tasks survive session boundaries and context compaction.

## When to Use

- You have a spec and need to break it into implementable units
- A task feels too large or vague to start
- The implementation order isn't obvious

**When NOT to use:** Single-file changes with obvious scope.

---

## The Planning Process

### Step 1: Explore (Read-Only)

Before writing any code:

- Read spec and relevant codebase sections
- Identify existing patterns and conventions
- Map dependencies between components
- Note risks and unknowns

**Do NOT write code during planning.** Output is a plan document + TodoList, not implementation.

---

### Step 2: Identify Dependency Graph

Map what depends on what → implement bottom-up:

```
Migration / Schema
    │
    ├── Model / Service / Query
    │       │
    │       ├── RSpec (model / service / query)
    │       │
    │       └── Controller / Helper / Decorator
    │               │
    │               ├── RSpec (controller / helper / decorator)
    │               │
    │               └── View / Frontend
```

---

### Step 3: Slice Into Phases

Split work into phases. Each phase ends with a spec checkpoint.

**Standard Rails feature phases:**

| Phase | Scope |
|-------|-------|
| 0 — Explore | Read codebase, map dependencies |
| 1 — Backend | Migration, Model, Service, Query, Form |
| 2 — RSpec Backend | Specs for Phase 1 |
| 3 — Controller / Helper / Decorator | Controller actions, helper methods, decorator display |
| 4 — RSpec Controller | Specs for Phase 3 |
| 5 — View / Frontend | Slim templates, Stimulus JS, i18n |
| 6 — Polish | i18n cleanup, edge cases, manual QA |

Skip phases that don't apply. Always keep RSpec phases immediately after their implementation phase.

---

### Step 4: Write Tasks Per Phase

Each task follows this structure:

```markdown
## Task [N]: [Short title]

**Description:** What this accomplishes.

**Acceptance criteria:**
- [ ] [Specific, testable condition]
- [ ] [Specific, testable condition]

**Verification:**
- [ ] `rtk env RAILS_ENV=test bundle exec rspec spec/path/to/spec.rb`
- [ ] Manual check: [what to verify in browser/console]

**Dependencies:** [Task N, or "None"]

**Files:**
- `app/path/to/file.rb`
- `spec/path/to/file_spec.rb`

**Size:** [XS | S | M | L]
```

---

### Step 5: Create TodoList

After writing the plan, **immediately create todos** using TaskCreate for each task so progress is tracked across sessions.

```
TaskCreate: "Phase 1 — Model: add contract_date fields to Company"
TaskCreate: "Phase 2 — RSpec: spec company model contract fields"
TaskCreate: "Phase 3 — Controller: ContractInformationsController#index"
TaskCreate: "Phase 4 — RSpec: spec controller auth + 200"
...
```

Mark each task `in_progress` when starting, `completed` when done.

---

### Step 6: Order + Checkpoints

**CRITICAL: Stop after every phase and wait for user approval before continuing.**

After each phase completes:
1. Run specs
2. Report what was done in plain language — no jargon
3. **STOP — ask user to review**
4. Only continue after user confirms they understand

```markdown
## Checkpoint: After Phase 1
- [ ] `rtk env RAILS_ENV=test bundle exec rspec spec/models/ spec/services/` — all pass
- [ ] 🛑 STOP: describe what was done in plain language, ask if user understands
- [ ] Only continue after user confirms
```

**Do NOT chain phases automatically.** Even if everything passes, stop and report. Reviewing one phase is easy — reviewing 6 phases at once is a mess.

---

### Stuck Point Protocol

When blocked (logic unclear, behavior ambiguous, spec uncertain):

**❌ DO NOT:**
- Guess and implement anyway
- Invent spec behavior to make tests pass
- Pick one interpretation silently and proceed
- Skip because "it seems right"

**✅ MUST:**
1. Stop immediately
2. Describe the stuck point in plain language — avoid code and technical terms where possible
3. Present concrete options (if any)
4. Ask user to decide

**Good stuck point example:**
> "I'm stuck in `app/controllers/contract_informations_controller.rb`, inside the `destroy` action. On the contract detail page (the modal that shows contract period + job posting limit), when a user clicks Delete — should the system also delete the related job postings, or leave them as-is? If we delete them, the user loses all active jobs. If we leave them, jobs stay active even without a contract. Which behavior do you want?"

Must include:
- **File/class** where stuck (`app/controllers/...`, `app/services/...`)
- **UI context** — which screen, which component, which action triggered it (e.g. "the delete button inside the contract detail modal", "the search form on the scout listing page")
- **The actual ambiguity** — two concrete options with consequences
- **Question** — ask user to decide

**Bad stuck point example:**
> "There's ambiguity in the dependent destroy behavior of the contract→job association, I'll default to nullify."

---

### User Confirm Protocol

When user shows signs of wanting to skip quickly (e.g. "ok", "yeah", "just do it"):

**Ask again to confirm they actually understand:**

> "Would you like me to explain it again? Skipping this part now may cost much more time to debug later."

**Only continue when user:**
- Explains it back in their own words, OR
- Clearly says "I understand, continue" after a full explanation

**Not accepted:** "ok", "yeah", "sure" alone — must have confirmation with context.

---

### Ordering Rules

1. Dependencies satisfied — build foundation first
2. High-risk tasks early — fail fast
3. Each task leaves the system in a working state
4. RSpec always follows implementation, never precedes it (unless TDD)
5. **One phase at a time — always pause for human review**
6. **Stuck = stop + explain in plain language + wait**
7. **"ok" alone is not approval — verify user actually understands**

---

## Task Sizing

| Size | Files | Example |
|------|-------|---------|
| XS | 1 | Add a validation rule |
| S | 1-2 | New API endpoint |
| M | 3-5 | One feature slice |
| L | 5-8 | Search with filtering + pagination |
| XL | 8+ | **Break down further** |

If a task title contains "and" → it is 2 tasks, split it.

---

## Plan Document Template

```markdown
# Implementation Plan: [Feature Name]

## Overview
[One paragraph — what we're building and why]

## Architecture Decisions
- [Decision + rationale]

---

## Phase 1 — Backend
- [ ] Task 1: [title] — Size: S
- [ ] Task 2: [title] — Size: M

### Checkpoint: Phase 1
- [ ] `rtk env RAILS_ENV=test bundle exec rspec spec/models/ spec/services/` green
- [ ] 🛑 STOP — report to user, wait for approval before Phase 2

---

## Phase 2 — RSpec Backend
- [ ] Task 3: Specs for [model/service]

### Checkpoint: Phase 2
- [ ] All backend specs pass
- [ ] 🛑 STOP — report to user, wait for approval before Phase 3

---

## Phase 3 — Controller / Helper / Decorator
- [ ] Task 4: [title]

### Checkpoint: Phase 3
- [ ] `rtk env RAILS_ENV=test bundle exec rspec spec/controllers/ spec/helpers/ spec/decorators/` green
- [ ] 🛑 STOP — report to user, wait for approval before Phase 4

---

## Phase 4 — View / Frontend
- [ ] Task 5: [title]

### Checkpoint: Phase 4
- [ ] Manual QA golden path
- [ ] i18n ja/en verified
- [ ] 🛑 STOP — report to user, final review

---

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| [risk] | High/Med/Low | [strategy] |

## Open Questions
- [Question needing human decision]
```

---

## RSpec Phase Rules

Follow rules from `@test` skill when writing RSpec phase tasks:

- **DO NOT** test `response.body` — views change frequently
- **DO** test decorator output (display methods)
- **DO** test helper business logic (return values, edge cases)
- **Controller specs:** HTTP status + redirect + assigns only
- **Helper specs with controller concerns:** use `define_singleton_method` pattern
- **Do not add new production code** when only asked to write specs

---

## Red Flags

- Starting implementation without a written task list
- No RSpec phase after each implementation phase
- Tasks without acceptance criteria
- All tasks XL-sized
- No checkpoints between phases
- Forgot to create TodoList via TaskCreate
- **Continuing to next phase without user approval** ← most common mistake

---

## Verification Before Starting

- [ ] Every task has acceptance criteria
- [ ] Every task has a verification step (rspec command)
- [ ] RSpec phase exists after each implementation phase
- [ ] TodoList created via TaskCreate
- [ ] Dependency order is correct
- [ ] Human reviewed and approved plan
