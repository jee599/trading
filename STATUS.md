# Project Status

## Current Goal

- Rebuild this repository as a zero-cost Remotion workspace that can turn saju storyboard JSON into vertical shorts MP4 outputs.

## Current Task

- Apply the provided finalized Remotion pipeline reference and import the supplied storyboard JSON files into the `shorts/` workspace.

## Working Session

- Agent: GPT
- Version: GPT-5 Codex
- Started At: 2026-03-14
- Scope: Align the `shorts/` workspace with the provided finalized pipeline spec and add the supplied storyboard JSON set
- Expected Output: The provided pipeline reference is reflected where needed in code/docs and the supplied JSON files are usable under `shorts/props`

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
- Imported the provided reference file as `shorts/SHORTS_PIPELINE_REMOTION_FINAL.md`.
- Replaced the broken sample storyboard text with the provided UTF-8 JSON source files under `shorts/props`.
- Added the provided storyboard set: `byung_daymaster`, `dohwa`, `fire_many`, `gwaegang`, `metal_few`, `water_few`, `wood_many`, and `yeokma`.
- Relaxed the JSON animation schema so the supplied finalized storyboard variants are accepted without parse failures.
- Added broader animation fallbacks and icon keyword mapping so the new storyboard set renders meaningfully even when a motion name is not custom-implemented yet.
- Verified an imported storyboard render with `npx remotion render SajuShort output/water_few_ko.mp4 --props=props/water_few.json`.
- Verified imported-storyboard finalization with `powershell -ExecutionPolicy Bypass -File .\\finalize.ps1 output/water_few_ko.mp4 props/water_few.json ko`.

## Next

- Continue filling out the remaining saju catalog beyond the eight imported storyboard files.
- Drop real branded fonts, optional Lottie files, and royalty-free BGM into `shorts/public` to replace the current graceful fallbacks.
- Decide whether Whisper alignment should become the default subtitle mode once the local install cost is acceptable.
- Implement richer per-animation variants for the newly allowed storyboard motion names if higher visual fidelity is needed.

## Remaining

- Expand content coverage, polish assets, and tune subtitle styling with real production media.
- Add more language presets and voice selection rules if quality needs differ by market.

## Blocked

- None for the verified sample pipeline.

## Recent Changes

- Repository direction pivoted from a Unity prototype to a Remotion-based shorts automation workspace.
- `PROJECT_BRIEF.md` and `ARCHITECTURE.md` were rewritten for the new pipeline.
- The sample pipeline now renders and finalizes a Korean `fire_many` short end to end inside `shorts/`.
- The provided finalized pipeline reference and eight storyboard JSON files were imported into `shorts/`.
- The renderer now accepts wider animation-name inputs from automation-generated storyboard files.

## Notes for Next Agent

- The user explicitly wants the old implementation replaced, not layered on top.
- Keep the new project under a top-level `shorts/` folder and retain the sequential-agent documentation workflow at the repo root.
- Preserve zero-cost, CPU-friendly defaults and graceful fallbacks when optional media assets are missing.
- `finalize.sh` matches the requested Bash workflow, but the current machine does not have `bash`, so `finalize.ps1` was added and used for real verification.
- Remotion required `zod` version `4.3.6`; the package versions are now pinned to avoid future mismatch warnings.
- The provided JSON set introduced many more animation labels than the first sample; the schema now accepts free-form names and `AnimatedText` falls back heuristically for unknown variants.
- `shorts/SHORTS_PIPELINE_REMOTION_FINAL.md` is the imported reference document that matches the user's supplied pipeline write-up.
- Update `Done`, `Next`, `Blocked`, and `Agent Contribution` again before ending the task.

## Agent Contribution

### Current Session

| Agent | Version | Scope | Key Contribution | Approx. Contribution |
| --- | --- | --- | --- | --- |
| GPT | GPT-5 Codex | Integrate supplied finalized pipeline assets and storyboard set | Imported the provided reference and eight JSONs, widened schema compatibility, and re-verified render/finalize paths | 100% |
| Claude | | | | |

### Cumulative

| Agent | Version | Tasks Completed | Key Areas | Approx. Contribution |
| --- | --- | --- | --- | --- |
| GPT | GPT-5 Codex | 9 | Workflow rules, repo docs, status tracking, Unity scaffold, repository pivot, Remotion pipeline, storyboard import, render automation, and verification | 100% |
| Claude | | | | |

Contribution values are rough operational notes, not exact metrics.
Keep totals near 100 percent when possible, but use judgment.
