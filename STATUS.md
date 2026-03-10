# Project Status

## Current Goal

- Turn the `BLEND IN` specification into a Unity-ready connected prototype scaffold.

## Current Task

- Verify the same-repository Unity workflow by opening this folder in Unity and regenerating the bootstrap scenes.

## Working Session

- Agent: GPT
- Version: GPT-5 Codex
- Started At: 2026-03-10
- Scope: Unity project-root setup and dependency cleanup for the shared-repo workflow
- Expected Output: Unity can open this repository directly, compile without extra package assumptions, and expose the `Blend In` bootstrap menu

## Done

- Replaced the previous product direction with the `BLEND IN` prototype specification.
- Rewrote the project brief and architecture notes around a Unity 6 plus URP mobile stealth prototype.
- Added a Unity-focused repository baseline with a `.gitignore`.
- Added gameplay scripts for game state, in-game time, score, mission assignment, event scheduling, and result flow.
- Added citizen archetype, personality, schedule, relationship, behavior tree, spawning, and destination systems.
- Added player movement, suspicion accumulation, disguise flow, and basic touch joystick support.
- Added Hunter detection plus patrol, investigate, chase, and lockdown state handling.
- Added HUD scripts for timer, suspicion, mission, disguise, minimap, and game over display.
- Added `UNITY_SETUP.md` so the current code scaffold can be wired into a real Unity project.
- Added Unity editor bootstrap scripts that generate sample data assets, placeholder prefabs, graybox scenes, markers, systems, and HUD with one menu command.
- Restored the missing shared `CitizenAnimationState` enum so Unity runtime and event scripts can compile again.
- Added Unity project-root files under `Packages` and `ProjectSettings` so this repository can be opened directly in Unity Hub.
- Removed the bootstrap and HUD scripts' TextMesh Pro dependency so first compile no longer assumes TMP is installed.
- Added a safer material-shader fallback in the bootstrapper so placeholder assets use `Standard` when no render pipeline asset is active yet.

## Next

- Open this repository root directly in Unity Hub.
- Let Unity restore packages and confirm the `Blend In` menu appears without compile errors.
- Run `Blend In > Bootstrap Prototype` and verify the generated `GameScene` after NavMesh bake.
- Replace placeholder meshes and materials with the free asset pack content.
- Add Animator controllers and connect actual character rig clips.

## Remaining

- Validate and tune the generated Unity scenes, prefabs, ScriptableObject instances, animator controllers, and NavMesh data.
- Import and configure the free environment, character, and animation assets.
- Tune suspicion values, Hunter speeds, schedule tables, mission rewards, and event frequency through playtests.
- Add frame-spread AI updates, better crowd sensing, and deeper event-specific citizen behaviors.

## Blocked

- Direct validation of package restore, first import, scene generation, and NavMesh bake still requires the Unity editor.

## Recent Changes

- Product brief pivoted to `BLEND IN`.
- Architecture notes pivoted to Unity gameplay systems.
- Added the full first-pass runtime scaffold under `Assets/_Project/Scripts`.
- Added editor bootstrap automation under `Assets/_Project/Editor`.
- Added the missing shared animation-state enum required by citizen and event scripts.
- Promoted the repository itself to a minimal Unity project root with `Packages/manifest.json` and `ProjectSettings/ProjectVersion.txt`.
- Replaced remaining TMP-based bootstrap UI generation with `UnityEngine.UI.Text`.

## Notes for Next Agent

- The next highest-value work is validating the direct-open Unity workflow inside the editor, not expanding systems blindly.
- Keep ScriptableObject-driven data and lightweight scene components as the default pattern.
- Open this repository root directly instead of copying `Assets/_Project` into another Unity project.
- The bootstrapper no longer requires TMP and now falls back to `Standard` materials if no active render pipeline asset exists yet.
- If you add new top-level folders or dependencies, update `ARCHITECTURE.md`.
- Update the `Working Session`, `Done`, `Next`, `Blocked`, and `Agent Contribution` sections again before ending the next task.

## Agent Contribution

### Current Session

| Agent | Version | Scope | Key Contribution | Approx. Contribution |
| --- | --- | --- | --- | --- |
| GPT | GPT-5 Codex | Product pivot, runtime gameplay scaffold, editor bootstrap, and Unity project-root setup | Reframed the repo around `BLEND IN`, added the first end-to-end Unity runtime plus auto-setup pass, and converted the repo into a directly openable Unity project | 100% |
| Claude | | | | |

### Cumulative

| Agent | Version | Tasks Completed | Key Areas | Approx. Contribution |
| --- | --- | --- | --- | --- |
| GPT | GPT-5 Codex | 6 | Workflow rules, project docs, status tracking, architecture notes, DEV tooling, Unity prototype pivot, runtime scaffold, editor bootstrap, and Unity project-root setup | 100% |
| Claude | | | | |

Contribution values are rough operational notes, not exact metrics.
Keep totals near 100 percent when possible, but use judgment.
