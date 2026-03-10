# Unity Setup

## Current State

- This repository now contains the runtime script scaffold for `BLEND IN`.
- It is not yet a complete Unity project root with editor-generated `ProjectSettings`, `Packages`, scenes, prefabs, or ScriptableObject assets.
- To run it in Unity, create or open a Unity 6 URP project first, then place this repository's `Assets/_Project` folder inside that project.

## Recommended Setup Flow

1. Open Unity Hub.
2. Create a new `3D (URP)` project with Unity 6 LTS.
3. Close the editor once the project finishes generating its base folders.
4. Copy this repository's `Assets/_Project` folder into the Unity project's `Assets` folder.
5. Reopen the Unity project.
6. Let Unity reimport scripts and compile.
7. Run `Blend In > Bootstrap Prototype` from the Unity menu.
8. Open `Assets/_Project/Scenes/GameScene.unity`.
9. If the automatic navmesh build did not produce a valid result, bake the NavMesh once in the editor.

## Bootstrap Output

The bootstrap menu creates or refreshes:

- Sample data assets under `Assets/_Project/Data`
- Shared placeholder materials under `Assets/_Project/Art/Materials`
- Placeholder prefabs under `Assets/_Project/Prefabs`
- `MainMenu`, `GameScene`, and `ResultScene`
- A graybox city layout with destination points, spawn zones, mission triggers, a player, a Hunter, managers, and HUD

## Scene Wiring

1. If you are not using the bootstrap menu, create `MainMenu`, `GameScene`, and `ResultScene`.
2. In `GameScene`, add empty GameObjects for:
   - `GameManager`
   - `TimeManager`
   - `ScoreManager`
   - `EventManager`
   - `MissionManager`
   - `RelationshipManager`
   - `CitizenSpawner`
3. Add the matching scripts to those GameObjects.

## Prefabs

### Player

1. Create a `Player` prefab if you are not using the bootstrap menu.
2. Add:
   - `CharacterController`
   - `PlayerController`
   - `SuspicionSystem`
   - `PlayerDisguise`
   - `CharacterVariation`
   - `DisguiseOutfitSwap`
3. If using animations, add an `Animator` child hierarchy and map the `State` int and `Speed` float parameters.

### Citizen

1. Create a `Citizen` prefab if you are not using the bootstrap menu.
2. Add:
   - `NavMeshAgent`
   - `CitizenAI`
   - `CharacterVariation`
3. Add colliders as needed for crowd sensing and scene interaction.

### Hunter

1. Create a `Hunter` prefab if you are not using the bootstrap menu.
2. Add:
   - `NavMeshAgent`
   - `HunterAI`
   - `DetectionSystem`
3. Add patrol route transforms in the scene and assign them to `HunterAI.patrolRoute`.

## Data Assets

Create these ScriptableObject assets under `Assets/_Project/Data`:

- `ArchetypeData`
- `ScheduleTable`
- `HunterConfig`
- `MissionData`
- `GameEvent` derived assets:
  - `RainEvent`
  - `AccidentEvent`
  - `PerformanceEvent`
  - `PoliceCheckEvent`
  - `DeliveryRushEvent`
  - `LunchSaleEvent`
  - `BlackoutEvent`
- `OutfitData`

## World Markers

1. Add `SpawnZone` components to invisible spawn volumes.
2. Add `DestinationPoint` components to offices, cafes, parks, benches, bus stops, shelters, and other schedule targets.
3. Add `MissionTrigger` colliders to mission zones such as the cafe, bench, and bus stop.

## UI Wiring

Create a Canvas and wire:

- `TimerUI`
- `SuspicionMeterUI`
- `MissionUI`
- `DisguiseUI`
- `MinimapUI`
- `GameOverUI`
- `JoystickUI`

Hook the `DisguiseUI` button to `PlayerDisguise.TryStartDisguise()`.

## Required Editor Tasks

- Import URP-compatible free city and character assets.
- Import Mixamo animations and build an Animator Controller.
- Bake NavMesh for the city.
- Assign colliders to mission zones and destination areas.
- Tune all ScriptableObject values in play mode.

## First Playtest Checklist

1. Confirm the game clock runs from 08:00 to 20:00 in 180 seconds.
2. Confirm citizens spawn and move to tagged destinations.
3. Confirm suspicion rises while running, colliding, loitering, or ignoring event rules.
4. Confirm a Hunter transitions through `Patrol`, `Investigate`, `Chase`, and `Lockdown`.
5. Confirm disguise charges decrease and mission rewards add to score.
