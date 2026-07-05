---
name: reviewer
description: "Multi-perspective code review with domain skill references (@frontend, @backend, @test, @devops) and risk-based escalation to @multi-agent-brainstorming."
version: 1.0.0
created: 2026-03-08
platforms: [cursor, claude-code]
category: code-review
tags: [review, multi-agent, security, performance, conventions]
risk: safe
---

# reviewer

## Purpose

Review code changes using a multi-agent perspective. Each review role brings domain expertise by referencing the project's domain skills (`@frontend`, `@backend`, `@test`, `@devops`). This prevents blind spots where a generalist review misses architecture-specific issues.

For high-impact or high-risk changes, hand off to `@multi-agent-brainstorming` for full structured review.

## When to Use

- After implementing a feature or fix
- Before committing or creating a PR
- User says "review", "check code", "review changes"
- When reviewing code written by another agent or developer

---

## Step 1: Identify Changed Files

Determine scope by priority:

1. **User specifies files/directories** — use exactly what they provide
2. **Staged + unstaged changes** — `git diff --name-only` and `git diff --name-only --cached`
3. **Recent commits on current branch** — `git log --oneline -10` then `git diff --name-only {commit}..HEAD`

Group changed files by domain:

| Domain | File patterns |
|--------|--------------|
| Frontend | `app/views/**`, `app/javascript/**`, `app/helpers/**`, `*.html.slim`, `*.js`, `*.scss` |
| Backend | `app/controllers/**`, `app/models/**`, `app/services/**`, `app/forms/**`, `app/policies/**`, `app/queries/**`, `*.rb` |
| Test | `spec/**`, `*_spec.rb` |
| DevOps | `.circleci/**`, `Dockerfile`, `docker-compose.yml`, `Capfile`, `config/deploy/**`, `config/schedule.rb` |

---

## Step 2: Context Loading (Smart)

**DO NOT bulk-read all AGENTS.md files.** Load context on demand.

1. If you recognize the files and patterns → proceed directly
2. If you're unsure about conventions for a domain → read that domain's `AGENTS.md` only
3. If changed files span multiple domains → read root `AGENTS.md` for the module map
4. Reference the domain skill (`@frontend`, `@backend`, `@test`, `@devops`) to understand architecture patterns

---

## Step 3: Multi-Perspective Review

Review changes through **sequential role-based perspectives**. Each role must reference the relevant domain skill for architecture accuracy.

### 3.1 — Domain Expert (per affected domain)

For **frontend** changes → reference `@frontend`:
- Verify Slim template uses `custom_i18n('.key')` or `I18n.t()` — no hardcoded strings
- Check partials are prefixed with `_` and receive data via `locals:` (no instance variables in partials)
- Stimulus controllers: `static targets`/`static values` declared; no jQuery inside controllers; anonymous `export default class extends Controller`
- SCSS: custom styles in appropriate `src/` file (not inline `style=""` attributes)
- No database queries in templates or helpers — data comes from controller instance variables

For **backend** changes → reference `@backend`:
- Every Ruby file starts with `# frozen_string_literal: true`
- Controller actions delegate to a service — no business logic in the controller body
- All data scoped through `current_company_user.company.*` — no unscoped `Model.all` or `Model.find`
- Pundit `authorize` or `policy_scope` called in every non-public action
- Service objects namespaced correctly (`Scouts::IndexService` in `scouts/index_service.rb`)
- N+1 queries — check for missing `includes`/`eager_load` in services
- Models: namespaced, inherits `ApplicationRecord`, soft-delete via `paranoia` where applicable
- Constants via `Settings.*` — no Ruby constants for configuration

For **test** changes → reference `@test`:
- Spec mirrors source path (`app/services/x.rb` → `spec/services/x_spec.rb`)
- FactoryBot used for all test data — no `Model.create` directly in specs
- No internal RSpec mocks: flag `double`, `instance_double`, `allow`, `receive`, or `expect(...).to receive` unless it stubs external HTTP or a third-party service boundary
- `expect` syntax only — no `should`; `described_class` instead of hardcoded class name
- Webmock stubs external HTTP — no real network calls in specs
- No `pending` examples without a tracking issue
- `let`/`let!` for setup; no instance variables (`@var`) in spec bodies

For **devops** changes → reference `@devops`:
- No secrets or credentials committed; no `.env` with real values
- `circleci config validate` should pass for any `.circleci/config.yml` changes
- Capistrano changes use `Settings.deploy.*` for server-specific values — no hardcoded IPs
- New cron jobs added to `config/schedule.rb` via `whenever` — not manual crontab edits

### 3.2 — Skeptic / Risk Assessor

Assume this code will fail in production. Check:

- What happens if the service returns empty/nil results?
- What if `current_company_user.company` is nil or missing an association?
- What happens with concurrent requests to the same resource?
- What if input is at boundary values (0, max, negative, empty string, nil)?
- Are there N+1 queries hidden in loops or associations?
- Does this change break existing controller actions that share the same service/model?

### 3.3 — Constraint Guardian

Check non-functional requirements:

- **Performance**: N+1 queries, unindexed WHERE clauses, unbounded queries without pagination
- **Security**: Missing `authorize`/`policy_scope`, unscoped model queries, unsanitized `html_safe`, missing CSRF protection on AJAX
- **Maintainability**: Business logic in controllers, logic in views, classes over 120 lines (Rubocop limit)
- **Convention compliance**: File placement, naming suffixes (`*Service`, `*Form`, `*Policy`), namespace matching directory

### 3.4 — Integration Reviewer

For changes spanning frontend + backend:

- Controller sets instance variables that Slim templates expect — do they match?
- AJAX response shape (`render json: { ... }`) matches what the Stimulus controller expects
- Form object attributes match the Slim form fields
- New routes in `config/routes.rb` reflected in JS routes (`js-routes`)

---

## Step 4: Risk Assessment

Classify the change:

| Risk Level | Criteria | Action |
|------------|----------|--------|
| **Low** | 1 domain, < 5 files, no shared code | Standard review (Steps 1-3) |
| **Medium** | 2 domains or touches shared service/model | Full review (Steps 1-3) with domain skill references |
| **High** | Auth changes, model schema changes, cross-company data access, breaking API | Full review + hand off to `@multi-agent-brainstorming` |

If **High risk**: invoke `@multi-agent-brainstorming` with the review findings as input. The structured multi-agent process will surface deeper issues.

---

## Step 5: Report

Group findings by severity. Be direct — state the problem, state the fix.

```markdown
## Code Review Report

**Files reviewed:** {N}
**Domains:** {frontend / backend / devops}
**Risk level:** {Low / Medium / High}

---

### 🔴 BLOCKING ({N})

Issues that must be fixed — bugs, security risks, or hard convention violations.

**1. [{Domain}] [{Category}] {Title}** — `{file}:{line}`
> {Description}
> **Fix:** {concrete fix}

---

### 🟡 IMPORTANT ({N})

Issues that should be fixed — performance, edge cases, best practice violations.

---

### 🟢 MINOR ({N})

Nice-to-fix — style, naming, minor improvements.

---

### ✅ CLEAN

Files that passed all checks: {list}
```

---

## Severity Definitions

| Severity | Meaning | Action |
|----------|---------|--------|
| 🔴 BLOCKING | Bug, security flaw, or MUST rule violation | Fix before merge |
| 🟡 IMPORTANT | Performance, edge case, SHOULD rule violation | Fix recommended |
| 🟢 MINOR | Style, naming, suggestion | Fix when convenient |

---

## Principles

- **Domain-informed** — Reference domain skills to avoid misjudging architecture patterns
- **Smart context** — Load AGENTS.md only when you lack information, not by default
- **Practical** — Every finding has a concrete fix, not just a complaint
- **Proportional** — Don't flag 20 minor issues when there are 2 blocking ones
- **Escalate when unsure** — High-risk changes go to `@multi-agent-brainstorming`
- **Honest** — If the code is clean, say so. Don't invent issues
