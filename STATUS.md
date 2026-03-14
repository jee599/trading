# Project Status

## Current Goal

- Rebuild this repository as a zero-cost Remotion workspace that can turn saju storyboard JSON into vertical shorts MP4 outputs.

## Current Task

- Deliver the first working `shorts/` workspace handoff, including verified render and finalize paths for the sample saju short.

## Working Session

- Agent: GPT
- Version: GPT-5 Codex
- Started At: 2026-03-14
- Scope: Repository pivot to `shorts/`, including docs, render code, sample assets, and verification
- Expected Output: `shorts/` contains a working Remotion-based saju shorts pipeline and at least one verified sample render path

## Done

- Archived the previous Unity-specific direction in favor of the requested saju shorts automation pivot.
- Updated the project brief and architecture notes to match the new Remotion-based pipeline direction.
- Removed the previous Unity-specific tracked code, setup files, and root-side tooling that no longer fit the new project.
- Added a new `shorts/` Remotion workspace with package config, TS config, composition registration, scene components, shared motion components, styles, and sample `props/fire_many.json`.
- Added Bash and PowerShell finalize and batch scripts so the workspace can run in both the requested shell style and the current Windows environment.
- Added Python narration and subtitle scripts with `edge-tts` fallback, optional Kokoro support, JSON-timed ASS subtitle generation, and optional Whisper alignment mode.
- Updated `.gitignore` for Node, Remotion, and generated video outputs.
- Verified `npm run typecheck` passes in `shorts/`.
- Verified sample render output with `npx remotion render SajuShort output/fire_many_ko.mp4 --props=props/fire_many.json`.
- Verified finalization output with `powershell -ExecutionPolicy Bypass -File .\\finalize.ps1 output/fire_many_ko.mp4 props/fire_many.json ko`.

## Next

- Add more storyboard JSON files for the broader saju content catalog beyond `fire_many`.
- Drop real branded fonts, optional Lottie files, and royalty-free BGM into `shorts/public` to replace the current graceful fallbacks.
- Decide whether Whisper alignment should become the default subtitle mode once the local install cost is acceptable.
- Consider cleaning up the now-empty legacy root folders if the team wants the filesystem itself to be as minimal as the git history.

## Remaining

- Expand content coverage, polish assets, and tune subtitle styling with real production media.
- Add more language presets and voice selection rules if quality needs differ by market.

## Blocked

- None for the verified sample pipeline.

## Recent Changes

- Repository direction pivoted from a Unity prototype to a Remotion-based shorts automation workspace.
- `PROJECT_BRIEF.md` and `ARCHITECTURE.md` were rewritten for the new pipeline.
- The sample pipeline now renders and finalizes a Korean `fire_many` short end to end inside `shorts/`.

## Notes for Next Agent

- The user explicitly wants the old implementation replaced, not layered on top.
- Keep the new project under a top-level `shorts/` folder and retain the sequential-agent documentation workflow at the repo root.
- Preserve zero-cost, CPU-friendly defaults and graceful fallbacks when optional media assets are missing.
- `finalize.sh` matches the requested Bash workflow, but the current machine does not have `bash`, so `finalize.ps1` was added and used for real verification.
- Remotion required `zod` version `4.3.6`; the package versions are now pinned to avoid future mismatch warnings.
- Update `Done`, `Next`, `Blocked`, and `Agent Contribution` again before ending the task.

## Agent Contribution

### Current Session

| Agent | Version | Scope | Key Contribution | Approx. Contribution |
| --- | --- | --- | --- | --- |
| GPT | GPT-5 Codex | Full repository pivot to the `shorts/` Remotion pipeline | Replaced the Unity codebase with a working saju shorts workspace, post-processing scripts, docs, and verification | 100% |
| Claude | | | | |

### Cumulative

| Agent | Version | Tasks Completed | Key Areas | Approx. Contribution |
| --- | --- | --- | --- | --- |
| GPT | GPT-5 Codex | 8 | Workflow rules, repo docs, status tracking, Unity scaffold, repository pivot, Remotion pipeline, render automation, and verification | 100% |
| Claude | | | | |

Contribution values are rough operational notes, not exact metrics.
Keep totals near 100 percent when possible, but use judgment.
