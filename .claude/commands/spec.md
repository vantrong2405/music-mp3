---
description: Start spec-driven development — write a structured specification, then break it into an ordered task plan
---

## Phase 1: Specify

Invoke the `planning-and-task-breakdown` skill and `spec-driven-development` skill.

Begin by understanding what the user wants to build. Ask clarifying questions about:
1. The objective and target users
2. Core features and acceptance criteria
3. Tech stack preferences and constraints
4. Known boundaries (what to always do, ask first about, and never do)

Then generate a structured spec covering all six core areas: objective, commands, project structure, code style, testing strategy, and boundaries.

Save the spec as `spec/<Feature_Name>.md` in the project root in Vietnamese. Confirm with the user before proceeding to Phase 2.

---

## Phase 2: Plan + Task Breakdown

After the user approves the spec, invoke the `planning-and-task-breakdown` skill to:

1. Identify the dependency graph between components
2. Slice work into phases per feature ported from `../musicpage` (e.g. Player → Playlist → Search → Polish), each phase vertical (hook + component + styling together, not layer-by-layer)
3. Write tasks with acceptance criteria and verification steps (manual check in browser, or test command once one is set up)
4. Add checkpoints between phases — **stop and wait for user approval after each phase**
5. Create TodoList via TaskCreate for each task

🛑 **STOP after Phase 2** — present the full plan to the user and wait for approval before any implementation begins.

---

## Next Steps

After plan is approved:
- Run `/build` to implement one task at a time (TDD: RED → GREEN → REFACTOR)
- Run `/review` before marking a phase complete
- Run `/ship` before merging to master
