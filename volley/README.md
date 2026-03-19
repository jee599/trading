# Spark Volley

`Spark Volley` is a browser-based, Pikachu Volleyball-inspired multiplayer prototype built with Phaser and Socket.IO. The game uses original code-driven electric-creature visuals instead of copyrighted Pokemon sprites, while still aiming for the same quick rally feel.

## Quick Start

```powershell
Set-Location volley
npm install
npm run dev
```

- Client: `http://localhost:5173`
- Socket server: `http://localhost:3001`

Open two browser tabs or two devices on the same network, create a room in one client, and join the same room code in the other.

## Controls

- `A` / `D` or `Left` / `Right`: move
- `W` or `Up`: jump
- `Space` or `Shift`: power hit

## Notes

- The multiplayer model is server-authoritative, so the server owns scores and ball physics.
- Visuals are drawn in code for the MVP, with the bundled `@fontsource/chakra-petch` font providing the techno HUD styling.
- The previous `shorts/` workspace remains in the repo as legacy material but is no longer the active product direction.
