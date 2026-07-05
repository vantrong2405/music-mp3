---
name: apply
description: "Coordinate feature implementation by routing to domain skills (@frontend, @backend, @devops) with YAGNI/SOLID/DRY enforcement."
version: 1.0.0
created: 2026-03-08
platforms: [cursor, claude-code]
category: workflow
tags: [implement, feature, coordinator, workflow]
risk: safe
---

# apply

## Purpose

Coordinate feature implementation by routing work to the right domain skill. This skill does NOT implement code directly — it parses requirements, determines which domains are involved, and delegates to `@frontend`, `@backend`, or `@devops` for the actual work.

## When to Use

- User says "implement", "build", "create feature", "add page", "add endpoint"
- User provides a ticket or description of work to do
- Any task that results in new or modified code

---

## Phase 1: Parse Requirements

Read the input and extract:

- **What** needs to be built or changed
- **Which domains** are involved (frontend / backend / devops / mixed)
- **Scope estimate** — how many files/modules will be touched

Classify complexity:

| Complexity | Signals |
|------------|---------|
| **Simple** | 1 domain, 1-2 files, clear scope |
| **Medium** | 1-2 domains, new logic but contained |
| **Complex** | 2+ domains, new feature, affects existing flows |

---

## Phase 2: Context Loading (Smart)

**DO NOT bulk-read all AGENTS.md files.** Only load context when you need it.

Decision tree:
1. **You already know enough** (simple task in familiar area) → proceed to Phase 3
2. **You know the domain but not the conventions** → read the relevant module's `AGENTS.md` only
3. **You don't know the project structure** → read root `AGENTS.md` for module map
4. **Conflicting signals** → read both root `AGENTS.md` and the specific module's `AGENTS.md`

Always prefer the minimal context needed. Loading unnecessary files wastes tokens and degrades output quality.

---

## Phase 3: Clarify (if needed)

**Simple** → Skip or 1 quick question.
**Medium** → Confirm key decisions.
**Complex** → Present summary and wait:

```
I'll implement [feature]:
- Domains: {frontend / backend / devops}
- Skills: @frontend, @backend (will reference for patterns)
- Modules: ...
- Assumptions: ...
Should I proceed?
```

**Hard rules:**
- Ambiguous → ask, don't guess
- Multiple valid approaches → present options, recommend one
- Never implement functionality not in the requirement
- Never add unrequested features

---

## Phase 4: Route & Implement

### 4.1 — Domain Routing

| If the task involves... | Reference skill | For... |
|------------------------|----------------|--------|
| Slim templates, partials, SCSS, Stimulus controllers | `@frontend` | Template patterns, Stimulus conventions, Bootstrap/SCSS rules |
| Rails controllers, services, models, APIs, Pundit policies | `@backend` | Service patterns, model namespacing, auth conventions |
| Writing, fixing, or refactoring tests | `@test` | RSpec, FactoryBot, Capybara conventions, file placement |
| CI/CD, Capistrano deployment, Docker, cron | `@devops` | Pipeline conventions, deployment patterns |

### 4.2 — Implementation

For each domain involved:

1. **Reference the domain skill** to understand conventions and patterns
2. **Check existing patterns** — look at sibling files in the same directory
3. **Follow YAGNI** — implement exactly what's asked, nothing more
4. **Follow SOLID** — one responsibility per file/class/controller
5. **Follow DRY** — reuse existing services/helpers, but don't abstract prematurely
6. **Place files correctly** — use the module mapping from the domain skill

### 4.3 — Cross-Domain Coordination

When backend + frontend are both involved, implement in this order:
1. Backend: route → controller → service → model (data foundation)
2. Backend: form object or params object (input handling)
3. Frontend: Slim template + partials
4. Frontend: Stimulus controller (if interactive behavior needed)
5. Tests: model/service specs → system test for user flow

---

## Phase 5: Wrap Up

### Self-check:

- [ ] All files placed in correct directories (per domain skill)
- [ ] Every Ruby file starts with `# frozen_string_literal: true`
- [ ] Service object created for any non-trivial business logic
- [ ] Authorization via Pundit (`authorize` or `policy_scope`) in controller
- [ ] All user-facing strings via `I18n.t()` — no hardcoded text
- [ ] Naming conventions followed (namespaced classes, `*Service`, `*Form`, `*Policy`)
- [ ] Only implemented what was requested — nothing extra
- [ ] Tests follow `@test` conventions (FactoryBot, file mirroring, `require 'rails_helper'`)

### Summary:

```
Done. Here's what I implemented:

Domains: {frontend / backend / devops}
Referenced: @backend, @frontend

Created:
- {list of new files}

Modified:
- {list of modified files}

No changes outside the requested scope.
```

### Next steps:

```
- Review code → use @reviewer
- Create PR → use @pr-description
```

---

## Principles

- **Coordinator, not implementer** — This skill routes to domain skills for expertise
- **YAGNI** — Implement exactly what's asked, nothing more
- **SOLID** — Single responsibility, dependency inversion, interface segregation
- **DRY** — Extract shared logic, but only after repetition is proven
- **Smart context** — Load AGENTS.md only when you lack information, not by default
- **Ask before guessing** — Ambiguity is resolved by asking, not assuming
- **Follow existing patterns** — The best convention is what's already in the codebase
