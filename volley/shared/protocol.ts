export type Side = "left" | "right";
export type MatchPhase = "waiting" | "countdown" | "live" | "point";

export const COURT = {
  width: 1280,
  height: 720,
  groundY: 620,
  netX: 640,
  netWidth: 28,
  netHeight: 220,
  playerRadius: 56,
  ballRadius: 26,
  leftSpawnX: 280,
  rightSpawnX: 1000,
  topLimit: 24,
} as const;

export const TUNING = {
  gravity: 2150,
  ballGravity: 1720,
  playerSpeed: 430,
  jumpVelocity: -970,
  playerBounce: 0.86,
  wallBounce: 0.92,
  groundBounce: 0.82,
  serveHeight: 240,
  hitRange: 128,
  hitCooldown: 0.28,
  swingDuration: 0.18,
  roundCountdown: 2.2,
  pointPause: 1.5,
  targetScore: 7,
  broadcastRate: 30,
} as const;

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  hit: boolean;
}

export interface PublicPlayerState {
  id: string;
  nickname: string;
  side: Side;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: number;
  grounded: boolean;
  swing: number;
  aura: number;
  connected: boolean;
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  glow: number;
  lastTouchedSide: Side | null;
}

export interface ScoreState {
  left: number;
  right: number;
  target: number;
}

export interface RoomSnapshot {
  roomCode: string;
  phase: MatchPhase;
  message: string;
  countdown: number;
  serverTime: number;
  scores: ScoreState;
  players: {
    left: PublicPlayerState | null;
    right: PublicPlayerState | null;
  };
  ball: BallState;
}

export interface RoomRequestPayload {
  nickname: string;
}

export interface JoinRoomPayload extends RoomRequestPayload {
  roomCode: string;
}

export interface RoomJoinedPayload {
  roomCode: string;
  playerId: string;
  side: Side;
  nickname: string;
}

export interface ErrorPayload {
  message: string;
}

export interface ClientToServerEvents {
  "room:create": (payload: RoomRequestPayload) => void;
  "room:join": (payload: JoinRoomPayload) => void;
  "player:input": (payload: InputState) => void;
}

export interface ServerToClientEvents {
  "room:joined": (payload: RoomJoinedPayload) => void;
  "room:error": (payload: ErrorPayload) => void;
  "game:snapshot": (payload: RoomSnapshot) => void;
}

export const EMPTY_INPUT: InputState = {
  left: false,
  right: false,
  jump: false,
  hit: false,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function oppositeSide(side: Side): Side {
  return side === "left" ? "right" : "left";
}

export function normalizeNickname(input: string): string {
  const normalized = input.replace(/\s+/g, " ").trim();
  return normalized.slice(0, 16) || "Spark Ace";
}

export function normalizeRoomCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}
