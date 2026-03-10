# Project Brief

## Project Name

- `BLEND IN`

## Goal

- Build a mobile-first Unity prototype where the player hides among 100 AI citizens in a small city by mimicking daily routines, completing small social actions, and avoiding detection by AI Hunters.

## Success Criteria

- The prototype delivers a full 3 to 5 minute session with a readable day flow from 08:00 to 20:00.
- Citizens visibly follow time-based routines strongly enough that the player can observe and imitate them.
- Suspicion, disguise, and Hunter pressure create sustained stealth tension through the run.
- The prototype is replayable because archetypes, events, and mission timing create different crowd patterns each session.
- The mobile target remains practical for a prototype build, with 30 FPS as the operating performance target.

## Scope

- Unity 6 LTS plus URP mobile prototype.
- One small city map with housing, commercial street, plaza, park, office or school, and bus stop zones.
- One player character with mobile movement and disguise actions.
- Up to 100 AI citizens driven by schedule data, archetypes, simple social reactions, and a lightweight in-house behavior tree.
- One or more Hunter agents driven by a state machine and suspicion thresholds.
- Three initial event types and three initial mission types.
- HUD for timer, suspicion, mission, disguise count, joystick, and minimap.

## Out of Scope

- Multiplayer or online features.
- Monetization or live operations.
- Server-backed progression.
- Large-scale content pipelines beyond the first city and prototype archetypes.
- Final animation polish, voice, advanced facial systems, or authored narrative content.

## Constraints

- Budget is zero, so the prototype must use free assets only.
- The target platform is iOS and Android, so systems must be designed with mobile performance limits in mind.
- The first version should prefer simple and explainable AI over deep simulation complexity.
- The full in-game day must map to roughly 180 real seconds.
- The prototype should stay editor-friendly and data-driven through ScriptableObjects where practical.

## Key Decisions

- Citizens are built from archetypes plus randomized personality ranges instead of bespoke per-agent authored logic.
- The behavior stack uses a small custom behavior tree instead of a third-party AI asset.
- Detection pressure is centralized around a player suspicion score that Hunters interpret through thresholds.
- The first implementation slice focuses on foundation systems: time flow, citizen schedule data, behavior execution, and spawning.
- Free modular characters and low-poly city assets are the baseline content assumption.

## Open Questions

- Exact camera model and touch control feel still need playtest validation.
- The final suspicion balance numbers will need iteration after Hunter and event systems are wired together.
- The first map layout exists only as a paper design and must still be assembled in the Unity editor.
- Animation controller structure and which Mixamo clips become required defaults are not finalized yet.
