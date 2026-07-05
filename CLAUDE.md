# CLAUDE.md — music-mp3

## 0. Language

- **Communicate with user**: Vietnamese
- **Code, commits, variable names, comments**: English

---

## 1. Project Overview

`music-mp3` is the React (Vite + TypeScript) port of the vanilla HTML/CSS/JS music-listening website at `../musicpage`. Goal: migrate all UI and logic (playlist, player, song list) to React, preserving original functionality and appearance.

- **Source of truth for old behavior/UI**: `../musicpage/index.html`, `../musicpage/main.js`, `../musicpage/listsong.js`, `../musicpage/style.css`.
- When unsure how to port a behavior, read the corresponding original file in `musicpage` before asking or guessing.
- `../musicpage` is a separate repo (has its own git) — do not edit files there unless explicitly asked.

---

## 2. Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite |
| UI | React 19 + TypeScript |
| Lint | ESLint (typescript-eslint, react-hooks, react-refresh) |
| Styling | CSS (ported from `style.css`, gradually moved to modules/components where it makes sense) |

No backend/API in this repo — if legacy logic relies on something server-side, ask first; don't invent an endpoint.

---

## 3. Migration Rules

- Port one feature at a time, end-to-end (player → done → playlist → done → ...). Don't leave a component half-written and jump to the next.
- Keep important ids/classes if old styling depends on them, unless refactoring to CSS modules — then update all usages together.
- Plain JS logic (`listsong.js`, `main.js`) → convert to corresponding React hooks/components; don't keep direct DOM manipulation (`document.querySelector`, etc.) unless truly needed (an audio element ref is a reasonable exception).
- Copy assets (images, audio, icons) from `musicpage` into `music-mp3`'s `public/` or `src/assets/` — don't reference paths across repos.

---

## 4. Coding Discipline

- Change only what the task requires. Don't refactor unrelated code along the way.
- Small, single-responsibility components. No speculative abstraction/config for use cases that don't exist yet.
- Clear English names for variables/functions. Comments explain WHY only, never WHAT.
- Before multi-step tasks: state a brief plan (phase → verify).

---

## 5. Hard Rules

- **DO NOT run `git add`, `git commit`, or `git push` automatically** — only when the user explicitly asks.
- Original files in `../musicpage` are reference only, not a place to edit while working on tasks in `music-mp3`.

---

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

**Always prefix commands with `rtk`.**

```bash
# Git
rtk git status / log / diff / show / branch / fetch / stash

# GitHub
rtk gh pr view <num> / rtk gh pr checks / rtk gh run list

# Files & Search
rtk ls <path> / rtk grep <pattern> / rtk find <pattern>

# Analysis
rtk err <cmd> / rtk log <file> / rtk diff / rtk summary <cmd>

# Meta
rtk gain / rtk gain --history / rtk discover
```
<!-- /rtk-instructions -->
