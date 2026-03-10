# Architecture Notes

## Overview

- The prototype is a Unity 6 LTS plus URP mobile project centered on one self-contained gameplay loop: observe citizens, blend into routines, disguise when safe, complete small missions, and evade Hunters.
- Runtime logic is split into thin gameplay domains so the first playable slice can be assembled incrementally inside the editor.

## Directory Structure

- `Packages/manifest.json`: Unity package manifest for the shared repo project root.
- `ProjectSettings/ProjectVersion.txt`: Unity editor version pin so the repository opens directly in Unity Hub.
- `Assets/_Project/Scenes`: Unity scenes for menu, gameplay, and results.
- `Assets/_Project/Editor`: Unity editor automation such as the prototype bootstrapper.
- `Assets/_Project/Scripts/Core`: game state and game-time orchestration.
- `Assets/_Project/Scripts/AI`: citizen data, behavior trees, and spawning.
- `Assets/_Project/Scripts/Character`: shared character appearance systems.
- `Assets/_Project/Scripts/World`: destination and spawn-point scene components.
- `Assets/_Project/Data`: ScriptableObject assets for archetypes, schedules, missions, events, and Hunters.

## Implemented Slice

- `GameManager` owns high-level game state transitions for `Ready`, `Playing`, and `GameOver`.
- `TimeManager` maps 180 real seconds to the in-game 08:00 to 20:00 timeline and raises time events.
- `ScoreManager` tracks mission rewards, survival bonus, and end-of-run score output.
- `ArchetypeData`, `PersonalityProfile`, and `ScheduleTable` define citizen behavior inputs.
- `CitizenAI` runs a custom behavior tree and consumes schedule data plus destination points.
- `BehaviorTreeBuilder` assembles lightweight archetype-specific routines from reusable nodes.
- `CitizenSpawner` instantiates citizens from archetype counts and matching spawn zones.
- `DestinationPoint` and `SpawnZone` mark map locations used by schedules and spawning.
- `CharacterVariation` currently provides a lightweight color-randomization path that preserves shared materials.
- `PlayerController`, `SuspicionSystem`, and `PlayerDisguise` cover movement, suspicion accumulation, and the disguise loop.
- `HunterAI`, `DetectionSystem`, and per-state classes cover patrol, investigate, chase, and lockdown flow.
- `EventManager` and `GameEvent` assets now provide runtime event scheduling and citizen or player reactions.
- `MissionManager` plus `MissionTrigger` provide one-active-mission prototype logic and score payout.
- HUD scripts now exist for timer, suspicion, mission, disguise, minimap, game over, and touch joystick controls.
- `BlendInBootstrapper` can generate placeholder assets, prefabs, and scenes from inside the Unity editor to reduce manual hookup.

## Runtime Flow

- `GameManager` enters `Playing`.
- `TimeManager` advances the shared game clock.
- `CitizenSpawner` creates citizens from archetype data and `RelationshipManager` pairs part of the crowd.
- `MissionManager` assigns one mission and `EventManager` schedules 2 to 3 random events.
- Each `CitizenAI` samples or refreshes its active schedule slot from `ScheduleTable`.
- The citizen behavior tree prioritizes event reaction, social or phone interruptions, then movement and waiting at schedule destinations.
- The player moves through the city, manages suspicion, optionally disguises, and completes mission waits.
- Hunters interpret suspicion thresholds through their state machine and attempt capture during lockdown.
- Destination selection resolves against tagged `DestinationPoint` scene components.

## Data Model

- Archetypes own spawn-zone tags, counts, behavior presets, schedule tables, and personality ranges.
- Personalities are generated at runtime from archetype-defined ranges rather than stored per citizen asset.
- Schedule slots are keyed by game hour and produce weighted destination choices.
- Scene-authored world markers stay simple: string tags plus stand or sit transforms and optional capacity metadata.

## Performance Direction

- The architecture assumes a future AI LOD layer that reduces tick rates based on distance and visibility.
- Shared materials plus `MaterialPropertyBlock` color overrides remain the default character-variation strategy.
- Frame-spread updates will be added above the current per-agent tick loop once Hunter, suspicion, and events are in place.
- The current code already applies simple citizen tick-rate LOD, but scene-side culling and frame spreading are still pending.
- The editor bootstrap intentionally generates graybox content only; imported free assets should replace these placeholders later without changing the runtime contracts.

## Decisions Log

- 2026-03-07: Adopt a document-driven sequential workflow on `master` for GPT and Claude handoff.
- 2026-03-10: Pivot the repository from the earlier web-platform concept to the `BLEND IN` Unity prototype specification.
- 2026-03-10: Prioritize the first playable systems slice over scene polish or asset import automation.
- 2026-03-10: Implement the first runtime-complete code scaffold across core, player, AI, Hunter, event, mission, and HUD layers.
- 2026-03-10: Add an editor bootstrap path so Unity can auto-generate a connected graybox prototype scene.
- 2026-03-10: Promote the repository itself to the Unity project root and remove the bootstrapper's TextMesh Pro dependency so editor setup works in the same folder.
