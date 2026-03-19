# Project Brief

## Project Name

- `spark-volley`

## Goal

- Build a browser-based, Pikachu Volleyball-inspired 2D game with room-based online multiplayer, polished electric-animal visuals, and smooth performance on ordinary laptops.

## Success Criteria

- Running `npm install` and `npm run dev` inside `volley/` starts a local workflow for both the game client and the multiplayer server.
- Two browser clients can create or join the same room and complete rallies with synchronized movement, ball physics, scoring, and serve resets.
- The gameplay includes the expected arcade verbs: move, jump, aerial contesting, and a satisfying power-hit or spike action.
- The presentation is materially better than a bare prototype through layered backgrounds, responsive HUD or menus, squash-and-stretch animation, particles, and free or open online resources where appropriate.
- The project remains handoff-friendly for sequential agents working on `master`.

## Scope

- A top-level `volley/` workspace using TypeScript, Vite, Phaser, and Socket.IO.
- A Node-based authoritative room server that simulates the match and broadcasts snapshots to connected clients.
- Shared protocol and gameplay constants so client and server stay aligned on room flow and court rules.
- A responsive browser UI for room creation, joining, connection state, scores, and match feedback.
- Original electric-creature art direction, plus openly usable online resources such as fonts or permissively licensed inspiration assets.
- Setup and handoff documentation for local playtesting with two browser tabs or two devices on the same network.

## Out of Scope

- Ranked matchmaking, accounts, persistence, or production-scale infrastructure.
- Mobile native packaging, console builds, or app-store deployment.
- Direct reuse of copyrighted commercial Pokemon sprites, sounds, or branding.
- Voice chat, cosmetics, monetization, or tournament systems.

## Constraints

- Use free or open-source tooling only.
- Keep the default local setup practical on Windows with Node.js.
- Target a responsive 16:9 landscape game view that still scales cleanly on smaller laptop screens.
- Favor deterministic, CPU-friendly 2D simulation and avoid heavyweight rendering choices that would hurt frame pacing.
- Document any future structure or dependency changes in the root handoff files.

## Key Decisions

- Use a server-authoritative multiplayer model so scores and physics stay consistent between clients.
- Use Phaser for the render loop and 2D scene management because it is well-suited to high-FPS arcade gameplay in the browser.
- Keep the art direction inspired by the feel of classic Pikachu Volleyball while using original or permissively licensed assets to avoid IP issues.
- Treat the previous `shorts/` Remotion workspace as legacy material and move active development to `volley/`.
- Optimize for an MVP that is immediately playable online first, then expand into deeper match options if the core feel lands well.

## Open Questions

- Whether the next iteration should add a bot opponent so solo tuning is easier when a second human tester is unavailable.
- Which free audio pack or custom-generated sound set should become the permanent default once the visual core is settled.
- Whether hosted deployment should target a simple Node host first or a split static-plus-socket setup later.
