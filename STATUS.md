# Project Status

## Current Goal

- Lock the product direction and prepare the first implementation slice.

## Current Task

- Define the initial system architecture and the official runner contract.

## Working Session

- Agent: GPT
- Version: GPT-5 Codex
- Started At: 2026-03-08
- Scope: DEV Community bulk content maintenance for `ji_ai`
- Expected Output: All published DEV posts end with a `jidonglab.com` link without duplicates

## Done

- Created `AGENTS.md`, `PROJECT_BRIEF.md`, `STATUS.md`, and `ARCHITECTURE.md`
- Defined the sequential workflow rules for `master`
- Added per-agent-version contribution tracking
- Filled the initial product brief for the AI tower battle platform
- Clarified the official runner direction instead of fully free-form CLI submissions
- Fixed the Git remote and pushed `master` to `origin`
- Added a DEV footer sync script for `ji_ai` posts
- Appended a `jidonglab.com` footer link to all 38 published DEV posts
- Repaired the first post after a non-UTF-8 update path corrupted Korean and symbol characters

## Next

- Define the official runner input and output contract
- Choose the web and backend stack
- Create the initial repository structure for web, backend, and runner
- Draft the score formula and replay data model
- Reuse `scripts/devto_footer_sync.py` if another bulk footer sync is needed

## Remaining

- Confirm implementation stack
- Define formal API contracts
- Build the codebase and features

## Blocked

- None

## Recent Changes

- Added four collaboration docs
- Added agent handoff rules
- Added contribution tracking tables
- Added product-level direction for the RPG tower challenge platform
- Confirmed daily seasons, daily submission limits, and public replay visibility
- Added `scripts/devto_footer_sync.py` for authenticated DEV post footer updates
- Verified all published `ji_ai` posts now end with `jidonglab.com`

## Notes for Next Agent

- The next high-value task is the runner contract, not UI polish.
- Keep the first version server-light: local full-run simulation with end-of-run upload.
- Preserve the official runner approach so users only need to implement agent logic.
- Update `Working Session` before doing any task.
- Update `Agent Contribution` at the end of every task.
- If the DEV footer task comes up again, use `DEVTO_API_KEY` with `scripts/devto_footer_sync.py` to avoid Unicode corruption from ad hoc PowerShell updates.

## Agent Contribution

### Current Session

| Agent | Version | Scope | Key Contribution | Approx. Contribution |
| --- | --- | --- | --- | --- |
| GPT | GPT-5 Codex | Product direction plus DEV content maintenance | Defined the project direction, architecture direction, workflow docs, contribution tracking, and DEV footer sync automation | 100% |
| Claude | | | | |

### Cumulative

| Agent | Version | Tasks Completed | Key Areas | Approx. Contribution |
| --- | --- | --- | --- | --- |
| GPT | GPT-5 Codex | 3 | Workflow rules, product brief, status tracking, architecture notes, DEV content maintenance | 100% |
| Claude | | | | |

Contribution values are rough operational notes, not exact metrics.
Keep totals near 100 percent when possible, but use judgment.
