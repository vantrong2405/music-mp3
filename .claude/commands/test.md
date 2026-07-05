---
description: Run TDD workflow for this Vite + React + TypeScript project — write failing tests, implement, verify.
---

Apply the TDD workflow from `.claude/skills/test-driven-development/SKILL.md`.

For new features:
1. Write tests that describe the expected behavior (they should FAIL)
2. Implement the code to make them pass
3. Refactor while keeping tests green

For bug fixes (Prove-It pattern):
1. Write a test that reproduces the bug (must FAIL)
2. Confirm the test fails
3. Implement the fix
4. Confirm the test passes
5. Run the full test suite for regressions

For UI/playback behavior (DOM state, audio events), use `.claude/skills/browser-testing-with-devtools/SKILL.md` to verify with Chrome DevTools MCP — no test runner is configured yet in `package.json`; if one is needed, ask the user which one (Vitest is the natural fit for Vite) before adding it.
