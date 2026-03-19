import express from "express";
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Server, Socket } from "socket.io";

import {
  BallState,
  clamp,
  ClientToServerEvents,
  COURT,
  EMPTY_INPUT,
  JoinRoomPayload,
  MatchPhase,
  normalizeNickname,
  normalizeRoomCode,
  oppositeSide,
  PublicPlayerState,
  RoomJoinedPayload,
  RoomRequestPayload,
  RoomSnapshot,
  ScoreState,
  ServerToClientEvents,
  Side,
  TUNING,
} from "../shared/protocol";

type PlayerRecord = PublicPlayerState & {
  socketId: string;
  input: typeof EMPTY_INPUT;
  previousInput: typeof EMPTY_INPUT;
  hitCooldown: number;
  justHit: boolean;
};

type RoomRecord = {
  code: string;
  phase: MatchPhase;
  message: string;
  countdown: number;
  pointPause: number;
  serveSide: Side;
  lastBroadcastAt: number;
  players: Record<Side, PlayerRecord | null>;
  scores: ScoreState;
  ball: BallState;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");
const distPath = path.join(workspaceRoot, "dist");
const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

const rooms = new Map<string, RoomRecord>();
const socketRoom = new Map<string, string>();

function createPlayer(socketId: string, side: Side, nickname: string): PlayerRecord {
  return {
    id: socketId,
    socketId,
    nickname,
    side,
    x: side === "left" ? COURT.leftSpawnX : COURT.rightSpawnX,
    y: COURT.groundY - COURT.playerRadius,
    vx: 0,
    vy: 0,
    facing: side === "left" ? 1 : -1,
    grounded: true,
    swing: 0,
    aura: 0,
    connected: true,
    input: { ...EMPTY_INPUT },
    previousInput: { ...EMPTY_INPUT },
    hitCooldown: 0,
    justHit: false,
  };
}

function createBall(serveSide: Side): BallState {
  return {
    x:
      serveSide === "left"
        ? COURT.leftSpawnX + 24
        : COURT.rightSpawnX - 24,
    y: TUNING.serveHeight,
    vx: serveSide === "left" ? 120 : -120,
    vy: -50,
    glow: 0.22,
    lastTouchedSide: null,
  };
}

function createRoom(code: string): RoomRecord {
  return {
    code,
    phase: "waiting",
    message: "상대 플레이어를 기다리는 중입니다.",
    countdown: 0,
    pointPause: 0,
    serveSide: "left",
    lastBroadcastAt: 0,
    players: {
      left: null,
      right: null,
    },
    scores: {
      left: 0,
      right: 0,
      target: TUNING.targetScore,
    },
    ball: createBall("left"),
  };
}

function findOpenSide(room: RoomRecord): Side | null {
  if (!room.players.left) {
    return "left";
  }
  if (!room.players.right) {
    return "right";
  }
  return null;
}

function activePlayerCount(room: RoomRecord): number {
  return Number(Boolean(room.players.left)) + Number(Boolean(room.players.right));
}

function resetPositions(room: RoomRecord) {
  const left = room.players.left;
  const right = room.players.right;
  if (left) {
    left.x = COURT.leftSpawnX;
    left.y = COURT.groundY - COURT.playerRadius;
    left.vx = 0;
    left.vy = 0;
    left.grounded = true;
    left.swing = 0;
    left.aura = 0;
    left.input = { ...EMPTY_INPUT };
    left.previousInput = { ...EMPTY_INPUT };
    left.hitCooldown = 0;
    left.justHit = false;
  }
  if (right) {
    right.x = COURT.rightSpawnX;
    right.y = COURT.groundY - COURT.playerRadius;
    right.vx = 0;
    right.vy = 0;
    right.grounded = true;
    right.swing = 0;
    right.aura = 0;
    right.input = { ...EMPTY_INPUT };
    right.previousInput = { ...EMPTY_INPUT };
    right.hitCooldown = 0;
    right.justHit = false;
  }
}

function startCountdown(room: RoomRecord, serveSide: Side) {
  if (activePlayerCount(room) < 2) {
    room.phase = "waiting";
    room.message = "상대 플레이어를 기다리는 중입니다.";
    room.countdown = 0;
    room.ball = createBall(serveSide);
    return;
  }

  room.serveSide = serveSide;
  room.phase = "countdown";
  room.countdown = TUNING.roundCountdown;
  room.message = "코트 준비 완료. 서브 카운트다운을 시작합니다.";
  room.ball = createBall(serveSide);
  resetPositions(room);
}

function enterWaiting(room: RoomRecord, message: string) {
  room.phase = "waiting";
  room.message = message;
  room.countdown = 0;
  room.pointPause = 0;
  room.scores.left = 0;
  room.scores.right = 0;
  room.serveSide = "left";
  room.ball = createBall("left");
  resetPositions(room);
}

function toSnapshot(room: RoomRecord): RoomSnapshot {
  return {
    roomCode: room.code,
    phase: room.phase,
    message: room.message,
    countdown: room.countdown,
    serverTime: Date.now(),
    scores: room.scores,
    players: {
      left: room.players.left,
      right: room.players.right,
    },
    ball: room.ball,
  };
}

function broadcastRoom(room: RoomRecord) {
  io.to(room.code).emit("game:snapshot", toSnapshot(room));
}

function maybeBroadcast(room: RoomRecord, now: number) {
  if (now - room.lastBroadcastAt >= 1000 / TUNING.broadcastRate) {
    room.lastBroadcastAt = now;
    broadcastRoom(room);
  }
}

function uniqueCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = Array.from({ length: 4 }, () =>
      alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join("");
  } while (rooms.has(code));

  return code;
}

function leaveExistingRoom(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
) {
  const existingCode = socketRoom.get(socket.id);
  if (!existingCode) {
    return;
  }

  socket.leave(existingCode);
  socketRoom.delete(socket.id);
  const room = rooms.get(existingCode);
  if (!room) {
    return;
  }

  for (const side of ["left", "right"] as Side[]) {
    if (room.players[side]?.socketId === socket.id) {
      room.players[side] = null;
    }
  }

  if (activePlayerCount(room) === 0) {
    rooms.delete(existingCode);
    return;
  }

  enterWaiting(room, "플레이어 구성이 바뀌었습니다. 새 상대를 기다립니다.");
  broadcastRoom(room);
}

function joinRoom(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  room: RoomRecord,
  requestedSide: Side,
  nickname: string,
) {
  const player = createPlayer(socket.id, requestedSide, nickname);
  room.players[requestedSide] = player;
  socket.join(room.code);
  socketRoom.set(socket.id, room.code);

  const payload: RoomJoinedPayload = {
    roomCode: room.code,
    playerId: player.id,
    side: requestedSide,
    nickname: player.nickname,
  };
  socket.emit("room:joined", payload);

  if (activePlayerCount(room) === 2) {
    startCountdown(room, room.serveSide);
  } else {
    enterWaiting(room, "상대 플레이어를 기다리는 중입니다.");
  }

  broadcastRoom(room);
}

function awardPoint(room: RoomRecord, scoringSide: Side) {
  room.scores[scoringSide] += 1;
  room.phase = "point";
  room.pointPause = TUNING.pointPause;
  room.serveSide = scoringSide;
  const scorer = room.players[scoringSide];

  if (room.scores[scoringSide] >= room.scores.target) {
    room.message = `${scorer?.nickname ?? "Player"} wins the set. 새 세트를 준비합니다.`;
    room.pointPause = TUNING.pointPause + 1;
  } else {
    room.message = `${scorer?.nickname ?? "Player"} scores!`;
  }
}

function clampToHalf(player: PlayerRecord) {
  const minX =
    player.side === "left"
      ? COURT.playerRadius + 30
      : COURT.netX + COURT.netWidth / 2 + COURT.playerRadius + 16;
  const maxX =
    player.side === "left"
      ? COURT.netX - COURT.netWidth / 2 - COURT.playerRadius - 16
      : COURT.width - COURT.playerRadius - 30;

  player.x = clamp(player.x, minX, maxX);
}

function movePlayers(room: RoomRecord, dt: number) {
  for (const side of ["left", "right"] as Side[]) {
    const player = room.players[side];
    if (!player) {
      continue;
    }

    const axis = Number(player.input.right) - Number(player.input.left);
    player.vx = axis * TUNING.playerSpeed;
    if (axis !== 0) {
      player.facing = axis > 0 ? 1 : -1;
    }

    const jumpPressed = player.input.jump && !player.previousInput.jump;
    player.justHit = player.input.hit && !player.previousInput.hit;

    if (jumpPressed && player.grounded) {
      player.vy = TUNING.jumpVelocity;
      player.grounded = false;
    }

    player.vy += TUNING.gravity * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    clampToHalf(player);

    const floorY = COURT.groundY - COURT.playerRadius;
    if (player.y >= floorY) {
      player.y = floorY;
      player.vy = 0;
      player.grounded = true;
    }

    player.y = Math.max(COURT.topLimit + COURT.playerRadius, player.y);
    player.hitCooldown = Math.max(0, player.hitCooldown - dt);
    player.swing = Math.max(0, player.swing - dt / TUNING.swingDuration);
    player.aura = Math.max(0, player.aura - dt * 2.2);
  }
}

function tryPowerHit(player: PlayerRecord, ball: BallState) {
  if (!player.justHit || player.hitCooldown > 0) {
    return;
  }

  const dx = ball.x - player.x;
  const dy = ball.y - player.y;
  const dist = Math.hypot(dx, dy);
  const direction = player.side === "left" ? 1 : -1;
  const forward = dx * direction;

  player.swing = 1;
  player.hitCooldown = TUNING.hitCooldown;

  if (dist > TUNING.hitRange || forward < -42) {
    return;
  }

  const airborneSpike = !player.grounded && ball.y < player.y - 18;
  ball.vx = direction * (airborneSpike ? 980 : 860) + player.vx * 0.22;
  ball.vy = airborneSpike ? 180 : -840;
  ball.glow = 1;
  ball.lastTouchedSide = player.side;
  player.aura = 1;
}

function resolveCircleRectCollision(ball: BallState) {
  const minX = COURT.netX - COURT.netWidth / 2;
  const maxX = COURT.netX + COURT.netWidth / 2;
  const minY = COURT.groundY - COURT.netHeight;
  const maxY = COURT.groundY;

  const closestX = clamp(ball.x, minX, maxX);
  const closestY = clamp(ball.y, minY, maxY);
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  const distSq = dx * dx + dy * dy;
  const radiusSq = COURT.ballRadius * COURT.ballRadius;

  if (distSq >= radiusSq) {
    return;
  }

  const dist = Math.sqrt(distSq) || 0.0001;
  const nx = dx / dist;
  const ny = dy / dist;
  const penetration = COURT.ballRadius - dist;
  ball.x += nx * penetration;
  ball.y += ny * penetration;

  const velocityAlongNormal = ball.vx * nx + ball.vy * ny;
  if (velocityAlongNormal < 0) {
    ball.vx -= (1 + TUNING.wallBounce) * velocityAlongNormal * nx;
    ball.vy -= (1 + TUNING.wallBounce) * velocityAlongNormal * ny;
  }
}

function collideBallWithPlayers(room: RoomRecord) {
  for (const side of ["left", "right"] as Side[]) {
    const player = room.players[side];
    if (!player) {
      continue;
    }

    tryPowerHit(player, room.ball);

    const dx = room.ball.x - player.x;
    const dy = room.ball.y - player.y;
    const distance = Math.hypot(dx, dy);
    const minDistance = COURT.playerRadius + COURT.ballRadius;

    if (distance >= minDistance) {
      continue;
    }

    const nx = dx / (distance || 0.0001);
    const ny = dy / (distance || 0.0001);
    const penetration = minDistance - distance;
    room.ball.x += nx * penetration;
    room.ball.y += ny * penetration;

    const relativeVx = room.ball.vx - player.vx;
    const relativeVy = room.ball.vy - player.vy;
    const velocityAlongNormal = relativeVx * nx + relativeVy * ny;

    if (velocityAlongNormal < 0) {
      room.ball.vx -= (1 + TUNING.playerBounce) * velocityAlongNormal * nx;
      room.ball.vy -= (1 + TUNING.playerBounce) * velocityAlongNormal * ny;
    }

    room.ball.vx += player.vx * 0.18 + (side === "left" ? 70 : -70);
    room.ball.vy += player.vy * 0.08 - 24;

    const speed = Math.hypot(room.ball.vx, room.ball.vy);
    if (speed < 520) {
      const boost = 520 / Math.max(speed, 1);
      room.ball.vx *= boost;
      room.ball.vy *= boost;
    }

    room.ball.glow = Math.max(room.ball.glow, 0.48);
    room.ball.lastTouchedSide = side;
  }
}

function moveBall(room: RoomRecord, dt: number) {
  const ball = room.ball;
  ball.vy += TUNING.ballGravity * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.glow = Math.max(0.1, ball.glow - dt * 1.3);

  if (ball.x <= COURT.ballRadius) {
    ball.x = COURT.ballRadius;
    ball.vx = Math.abs(ball.vx) * TUNING.wallBounce;
  }
  if (ball.x >= COURT.width - COURT.ballRadius) {
    ball.x = COURT.width - COURT.ballRadius;
    ball.vx = -Math.abs(ball.vx) * TUNING.wallBounce;
  }
  if (ball.y <= COURT.topLimit + COURT.ballRadius) {
    ball.y = COURT.topLimit + COURT.ballRadius;
    ball.vy = Math.abs(ball.vy) * TUNING.wallBounce;
  }

  resolveCircleRectCollision(ball);
  collideBallWithPlayers(room);

  if (ball.y >= COURT.groundY - COURT.ballRadius) {
    ball.y = COURT.groundY - COURT.ballRadius;
    const landingSide: Side = ball.x < COURT.netX ? "left" : "right";
    awardPoint(room, oppositeSide(landingSide));
  }
}

function stepRoom(room: RoomRecord, dt: number, now: number) {
  if (room.phase === "waiting") {
    room.ball.glow = Math.max(0.16, room.ball.glow - dt * 0.4);
    return;
  }

  if (room.phase === "countdown") {
    room.countdown = Math.max(0, room.countdown - dt);
    room.ball = createBall(room.serveSide);
    resetPositions(room);

    if (room.countdown <= 0) {
      room.phase = "live";
      room.message = "Rally live. 타이밍 맞춰서 파워 히트를 넣어보세요.";
      room.ball = createBall(room.serveSide);
      room.ball.vx = room.serveSide === "left" ? 220 : -220;
      room.ball.vy = -140;
    }
    maybeBroadcast(room, now);
    return;
  }

  if (room.phase === "point") {
    room.pointPause = Math.max(0, room.pointPause - dt);
    room.ball.glow = Math.min(1, room.ball.glow + dt * 0.4);

    if (room.pointPause <= 0) {
      if (
        room.scores.left >= room.scores.target ||
        room.scores.right >= room.scores.target
      ) {
        room.scores.left = 0;
        room.scores.right = 0;
      }
      startCountdown(room, room.serveSide);
    }
    maybeBroadcast(room, now);
    return;
  }

  movePlayers(room, dt);
  moveBall(room, dt);

  for (const side of ["left", "right"] as Side[]) {
    const player = room.players[side];
    if (!player) {
      continue;
    }
    player.previousInput = { ...player.input };
    player.justHit = false;
  }

  maybeBroadcast(room, now);
}

function handleCreateRoom(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  payload: RoomRequestPayload,
) {
  leaveExistingRoom(socket);
  const code = uniqueCode();
  const room = createRoom(code);
  rooms.set(code, room);
  joinRoom(socket, room, "left", normalizeNickname(payload.nickname));
}

function handleJoinRoomRequest(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  payload: JoinRoomPayload,
) {
  leaveExistingRoom(socket);
  const code = normalizeRoomCode(payload.roomCode);
  const room = rooms.get(code);
  if (!room) {
    socket.emit("room:error", {
      message: "해당 룸 코드를 찾지 못했습니다.",
    });
    return;
  }

  const side = findOpenSide(room);
  if (!side) {
    socket.emit("room:error", {
      message: "이미 두 명이 입장한 방입니다.",
    });
    return;
  }

  joinRoom(socket, room, side, normalizeNickname(payload.nickname));
}

function handleDisconnect(socketId: string) {
  const roomCode = socketRoom.get(socketId);
  if (!roomCode) {
    return;
  }

  socketRoom.delete(socketId);
  const room = rooms.get(roomCode);
  if (!room) {
    return;
  }

  for (const side of ["left", "right"] as Side[]) {
    if (room.players[side]?.socketId === socketId) {
      room.players[side] = null;
    }
  }

  if (activePlayerCount(room) === 0) {
    rooms.delete(roomCode);
    return;
  }

  enterWaiting(room, "상대 플레이어가 나갔습니다. 새 플레이어를 기다립니다.");
  broadcastRoom(room);
}

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    rooms: rooms.size,
    timestamp: Date.now(),
  });
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/socket\.io).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

io.on("connection", (socket) => {
  socket.on("room:create", (payload) => handleCreateRoom(socket, payload));
  socket.on("room:join", (payload) => handleJoinRoomRequest(socket, payload));
  socket.on("player:input", (payload) => {
    const roomCode = socketRoom.get(socket.id);
    if (!roomCode) {
      return;
    }

    const room = rooms.get(roomCode);
    if (!room) {
      return;
    }

    for (const side of ["left", "right"] as Side[]) {
      if (room.players[side]?.socketId === socket.id) {
        room.players[side]!.input = {
          left: Boolean(payload.left),
          right: Boolean(payload.right),
          jump: Boolean(payload.jump),
          hit: Boolean(payload.hit),
        };
      }
    }
  });

  socket.on("disconnect", () => {
    handleDisconnect(socket.id);
  });
});

const tickRate = 1000 / 60;
setInterval(() => {
  const now = Date.now();
  const dt = tickRate / 1000;
  for (const room of rooms.values()) {
    stepRoom(room, dt, now);
  }
}, tickRate);

const port = Number(process.env.PORT || 3001);
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Spark Volley server listening on http://localhost:${port}`);
});
