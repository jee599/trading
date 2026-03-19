# Architecture Notes

## Overview

- Active development now centers on a real-time browser game workspace at `volley/`.
- The game is a Pikachu Volleyball-inspired 1v1 arcade volleyball experience with original electric-creature visuals and room-based online play.
- The architecture separates concerns between a server-authoritative simulation and a lightweight Phaser client that focuses on rendering, input capture, and UI.
- The previous `shorts/` Remotion workspace remains in the repository only as legacy material and is no longer the active product direction.

## Directory Structure

- `volley/package.json`: Workspace manifest and dev, build, and start scripts for the client plus multiplayer server.
- `volley/vite.config.ts`: Client build configuration for the Phaser frontend.
- `volley/index.html`: App shell markup containing the room controls and HUD layout.
- `volley/src/main.ts`: Browser bootstrap, Socket.IO client wiring, room UI events, and Phaser initialization.
- `volley/src/game/CourtScene.ts`: Main Phaser scene with background art, mascot rendering, particles, and local input capture.
- `volley/src/style.css`: Responsive interface styling for the landing panel, HUD, and canvas shell.
- `volley/server/index.ts`: Socket.IO server entry point, room lifecycle, authoritative simulation, and static serving for built assets.
- `volley/shared/protocol.ts`: Shared protocol types, gameplay constants, room helpers, and normalization utilities used by both sides.
- `volley/README.md`: Local setup and playtesting instructions for the multiplayer MVP.

## Runtime Flow

- A browser client loads the Phaser experience, renders the control UI, and connects to the Socket.IO server.
- A player creates a room or joins an existing room code through the overlay UI.
- The server assigns player slots, starts the rally when both slots are filled, and runs the authoritative simulation tick.
- Clients send compact input state updates, not world positions.
- The server simulates player movement, collisions, ball flight, scoring, and match resets, then emits snapshots back to the room.
- The Phaser client interpolates received state, updates animated characters and effects, and renders score or connection feedback.

## Networking Strategy

- Rooms are limited to two active competitors to keep state management simple and deterministic.
- Input messages stay small and event-driven so network overhead remains low.
- The simulation lives on the server to prevent divergent physics between peers.
- Clients smooth remote updates with interpolation rather than trying to own authoritative state.
- Reconnect or disconnect handling should fail safely by pausing or ending the room instead of letting ghost players continue.

## Rendering Strategy

- Use Phaser's 2D render loop for consistent browser performance while keeping the actual physics logic on the server.
- Prefer code-driven vector or generated visuals first so the MVP is not blocked on a large art pipeline.
- Add depth with layered skies, court lighting, shadows, particles, hit flashes, and expressive mascot animation.
- Bundle a free online font resource locally and keep other polish assets optional so the first run stays lightweight.

## Data Model

- Shared room state includes room metadata, player slots, readiness flags, score, serve ownership, and the live rally state.
- Player state tracks position, velocity, facing, grounded status, and transient action flags such as jump or power-hit windows.
- Ball state tracks position, velocity, owner of the last hit when relevant, and scoring-side resolution.
- Snapshot messages are intentionally compact and shaped for frequent broadcast.

## Operational Notes

- Local development should remain Windows-friendly and require only Node.js plus npm.
- If the workspace introduces generated build output or new asset caches, update `.gitignore` alongside the code change.
- If the multiplayer topology, folder structure, or active product direction changes again, update this file and `STATUS.md` in the same task.

## Decisions Log

- 2026-03-07: Adopt a document-driven sequential workflow on `master` for GPT and Claude handoff.
- 2026-03-14: Pivot the repository from the Unity `BLEND IN` prototype to a Remotion-based saju shorts automation workspace.
- 2026-03-19: Pivot the active project again to a browser-based, Pikachu Volleyball-inspired multiplayer game.
- 2026-03-19: Favor a server-authoritative Socket.IO model with a Phaser client to balance simplicity, responsiveness, and browser performance.
