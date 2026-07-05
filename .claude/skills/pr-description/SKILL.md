---
name: pr-description
description: "Generate PR title, description, and commit message by analyzing git changes. Fills the project's PR template and follows conventional commit format. Supports submodule PRs."
version: 1.0.0
created: 2026-03-08
platforms: [cursor, claude-code]
category: git
tags: [pr, pull-request, git, description]
risk: safe
---

# pr-description

## Purpose

Analyze git changes on the current branch and generate a complete PR package: title, description, and commit message. Fills the project's PR template and adapts to its structure.

## When to Use

- User says "create PR", "PR description", "write PR", "prepare PR"
- User asks for commit message, PR title
- After changes are ready to push

---

## Process

### 1. Gather Changes

```bash
git branch --show-current
git log --oneline -20
git diff --name-only --cached
git diff --name-only
```

Read the actual diff content to understand what changed.

### 2. Detect Submodules

This project uses a git submodule (`daijob6_shared`). Check for submodule changes:

```bash
cat .gitmodules
git diff --cached --name-only | grep daijob6_shared
```

**If `daijob6_shared` has staged changes:**
- It needs its own PR description (check `daijob6_shared/.github/pull_request_template.md`)
- The main repo PR should reference the submodule PR in the "Related PRs" section
- Output submodule PR description first, then the main repo PR

### 3. Read Template(s)

**Main repo template:** `.github/pull_request_template.md`

```markdown
### 1. Related PRs
- Nothing
---
### 2. Attention
**_Here is what you have to do before or after the production release_**
- Nothing
---
### 3. Summary (describe what you did)
- Nothing
---
### 4. Link specs
- Nothing
---
### 5. Localhost output (image or video or json example)
- Nothing
```

Fill every section — replace "Nothing" with actual content or leave it if truly not applicable.

**Submodule template:** Check `daijob6_shared/.github/pull_request_template.md`; if not found, use the same format as above.

### 4. Analyze & Think

- **What type of change?** Feature, bugfix, refactor, chore
- **Which modules/areas are affected?** Map changed files to project structure
- **What's the user-facing impact?**
- **What could break?** Shared services, models, or JS that others depend on
- **Which environment to test?** (staging branch or localhost)
- **Submodule impact** — if `daijob6_shared` changed, what in the main app depends on it?

### 5. Fill Template

For each section, be concrete — use actual file names, routes, or feature names from the diff.

**Section guide for this project's template:**

| Section | What to write |
|---------|--------------|
| **1. Related PRs** | Link to submodule PR (`daijob6_shared#123`) if applicable; otherwise "Nothing" |
| **2. Attention** | Pre/post-deploy steps: DB migrations, credentials changes, cron updates, cache clears, env var additions |
| **3. Summary** | Bullet points: what was changed and why (user story / bug description / ticket) |
| **4. Link specs** | Link to Jira/GitHub issue, design spec, or Notion doc; "Nothing" if no spec |
| **5. Localhost output** | Screenshot, video, or JSON example showing the change works; skip if pure backend logic |

#### 5.1 — When the PR includes Cursor skill changes

If the diff includes files under `.cursor/skills/`, add a **Cursor Skills** section to the PR description. For each skill added or changed:

| Skill | Summary | Example |
|-------|---------|---------|
| `backend` | Rails service/model/auth conventions for the AI agent | `@backend — how should I add a new service?` |
| `frontend` | Slim/Stimulus/SCSS conventions | `@frontend — how do I add a Stimulus controller?` |
| `test` | RSpec/FactoryBot/Capybara conventions | `@test — write specs for this service` |
| `devops` | CircleCI/Capistrano/Docker conventions | `@devops — how do I add a cron job?` |
| `apply` | Implementation coordinator | `@apply — implement this feature` |
| `reviewer` | Code review coordinator | `@reviewer — review these changes` |
| `pr-description` | PR package generator | `@pr-description — generate PR for this branch` |

### 6. Generate PR Title

Format: `<type>(<scope>): <short summary>`

**Type:**

| Type | When |
|------|------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructure, no behavior change |
| `chore` | Build, CI, dependencies, tooling |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |

**Scope** — the primary module or area (e.g., `scouts`, `applicants`, `auth`, `ci`). Omit for cross-cutting changes.

Examples:
```
feat(scouts): add CSV export for scout list
fix(applicants): handle nil member_application in status update
refactor(services): extract ScoutQuery from IndexService
chore(ci): enable parallel RSpec execution in CircleCI
```

### 7. Generate Commit Message

If the branch has multiple commits or the user requests a commit message:

```
<type>(<scope>): <summary>

<body>

<footer>
```

**Rules:**
- Summary line: imperative mood, lowercase, max 72 chars
- Body: explain *what* and *why*, not *how*; wrap at 72 chars
- Footer: `Closes #123` for issue references; `BREAKING CHANGE:` if applicable

**Single-commit branches:** If the branch has exactly one commit and no staged changes, skip — the existing commit message is sufficient.

### 8. Output

```
## PR Title
<generated title>

## Commit Message
<generated commit message>

## PR Description: daijob6_companytools
(markdown block with filled template)

## PR Description: daijob6_shared (if submodule changed)
(markdown block with filled template)
```

Submodule PR descriptions come first when present.

---

## Principles

- **Template is the source of truth** — follow its 5-section structure exactly
- **Concise** — reviewer should understand the PR in 30 seconds
- **Honest** — small change = small description. Don't inflate
- **Smart context** — Only read AGENTS.md or domain skills when you need more info
- **English by default** — unless user requests Japanese
- **Conventional Commits** — PR title and commit message follow conventional commit format
