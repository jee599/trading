# Agent Workflow Rules

This repository is used by GPT and Claude working sequentially on the same `master` branch.
Do not run concurrent work in the same branch.

## Read Order

Start every task in this order:

1. `git pull origin master`
2. Read `AGENTS.md`
3. Read `PROJECT_BRIEF.md`
4. Read `STATUS.md`
5. Read `ARCHITECTURE.md` if needed

## Working Rules

1. Work on one small task at a time.
2. Do not start work that is not listed in `STATUS.md`.
3. Before coding, review `Current Task` and `Notes for Next Agent` in `STATUS.md`.
4. At task start, update the `Working Session` section in `STATUS.md`.
5. If structure, folders, dependencies, or core design change, update `ARCHITECTURE.md`.
6. If goals, scope, or success criteria change, update `PROJECT_BRIEF.md`.
7. At task end, update `STATUS.md` with completed work, next work, remaining work, blockers, and contribution data.

## Git Rules

1. The default branch is `master`.
2. Commit once per task unit.
3. Push after every commit with `git push origin master`.
4. Use commit messages in the form `agent-version: change summary`.

Examples:

- `gpt-5-codex: add initial project docs`
- `claude-sonnet-4: implement auth page`

## Handoff Rules

At the end of each task, these sections must be current:

- `Done`
- `Next`
- `Blocked`
- `Notes for Next Agent`
- `Agent Contribution`

The next agent must be able to continue from the docs and latest commit only.

## Prohibited

- Do not finish a task without updating the docs.
- Do not let multiple agents work on the same task at the same time.
- Do not do a major refactor without documenting the reason.
- Do not mark incomplete work as done.
