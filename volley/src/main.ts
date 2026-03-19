import "@fontsource/chakra-petch/400.css";
import "@fontsource/chakra-petch/500.css";
import "@fontsource/chakra-petch/700.css";
import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

import {
  ClientToServerEvents,
  COURT,
  InputState,
  normalizeNickname,
  normalizeRoomCode,
  RoomJoinedPayload,
  RoomSnapshot,
  ServerToClientEvents,
} from "../shared/protocol";
import { CourtScene } from "./game/CourtScene";
import "./style.css";

const nicknameInput = document.querySelector<HTMLInputElement>("#nickname-input");
const roomCodeInput = document.querySelector<HTMLInputElement>("#room-code-input");
const statusText = document.querySelector<HTMLElement>("#status-text");
const roomCodeLabel = document.querySelector<HTMLElement>("#room-code-label");
const sideLabel = document.querySelector<HTMLElement>("#side-label");
const scoreLabel = document.querySelector<HTMLElement>("#score-label");
const phaseLabel = document.querySelector<HTMLElement>("#phase-label");
const createRoomButton =
  document.querySelector<HTMLButtonElement>("#create-room-button");
const joinRoomButton =
  document.querySelector<HTMLButtonElement>("#join-room-button");
const copyRoomButton =
  document.querySelector<HTMLButtonElement>("#copy-room-button");

if (
  !nicknameInput ||
  !roomCodeInput ||
  !statusText ||
  !roomCodeLabel ||
  !sideLabel ||
  !scoreLabel ||
  !phaseLabel ||
  !createRoomButton ||
  !joinRoomButton ||
  !copyRoomButton
) {
  throw new Error("Expected UI elements were not found.");
}

const ui = {
  nicknameInput,
  roomCodeInput,
  statusText,
  roomCodeLabel,
  sideLabel,
  scoreLabel,
  phaseLabel,
  createRoomButton,
  joinRoomButton,
  copyRoomButton,
};

const scene = new CourtScene();

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-shell",
  transparent: false,
  width: COURT.width,
  height: COURT.height,
  backgroundColor: "#09111f",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: COURT.width,
    height: COURT.height,
  },
  scene: [scene],
});

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let currentRoomCode = "";
let currentSnapshot: RoomSnapshot | null = null;

scene.onInputChange = (input: InputState) => {
  socket?.emit("player:input", input);
};

const phaseLabelMap: Record<RoomSnapshot["phase"], string> = {
  waiting: "WAITING",
  countdown: "READY",
  live: "LIVE",
  point: "POINT",
};

function createSocketUrl(): string {
  const host = window.location.hostname || "localhost";
  return `${window.location.protocol}//${host}:3001`;
}

function setStatus(message: string, tone: "info" | "success" | "warn" | "error") {
  ui.statusText.textContent = message;
  ui.statusText.dataset.tone = tone;
}

function updateHud(snapshot: RoomSnapshot | null) {
  if (!snapshot) {
    ui.scoreLabel.textContent = "0 : 0";
    ui.phaseLabel.textContent = "LOBBY";
    return;
  }

  ui.scoreLabel.textContent = `${snapshot.scores.left} : ${snapshot.scores.right}`;
  ui.phaseLabel.textContent = phaseLabelMap[snapshot.phase];
}

function updateRoomCode(code: string) {
  currentRoomCode = code;
  ui.roomCodeLabel.textContent = code || "----";
}

function ensureSocket() {
  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(createSocketUrl(), {
    autoConnect: false,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    scene.setConnectionState(true);
    setStatus("서버 연결 완료. 방을 만들거나 룸 코드로 입장하세요.", "success");
  });

  socket.on("disconnect", () => {
    scene.setConnectionState(false);
    setStatus("서버와 연결이 끊겼습니다. 다시 시도해 주세요.", "warn");
    ui.sideLabel.textContent = "재접속 필요";
  });

  socket.on("room:joined", (payload: RoomJoinedPayload) => {
    updateRoomCode(payload.roomCode);
    ui.sideLabel.textContent = payload.side === "left" ? "LEFT" : "RIGHT";
    scene.setIdentity(payload.playerId, payload.side, payload.nickname);
    setStatus(
      `${payload.roomCode} 방에 입장했습니다. 다른 플레이어가 오면 랠리가 시작됩니다.`,
      "success",
    );
  });

  socket.on("room:error", ({ message }) => {
    setStatus(message, "error");
  });

  socket.on("game:snapshot", (snapshot: RoomSnapshot) => {
    currentSnapshot = snapshot;
    updateRoomCode(snapshot.roomCode);
    updateHud(snapshot);
    scene.setSnapshot(snapshot);
  });

  socket.connect();
  return socket;
}

function getNickname(): string {
  const normalized = normalizeNickname(ui.nicknameInput.value);
  ui.nicknameInput.value = normalized;
  return normalized;
}

function handleCreateRoom() {
  const activeSocket = ensureSocket();
  activeSocket.emit("room:create", {
    nickname: getNickname(),
  });
  setStatus("새 방을 만드는 중입니다...", "info");
}

function handleJoinRoom() {
  const roomCode = normalizeRoomCode(ui.roomCodeInput.value);
  ui.roomCodeInput.value = roomCode;

  if (!roomCode) {
    setStatus("입장하려면 룸 코드를 입력해 주세요.", "warn");
    return;
  }

  const activeSocket = ensureSocket();
  activeSocket.emit("room:join", {
    nickname: getNickname(),
    roomCode,
  });
  setStatus(`${roomCode} 방에 입장 요청 중입니다...`, "info");
}

async function handleCopyRoomCode() {
  const code = currentRoomCode || ui.roomCodeInput.value.trim();

  if (!code) {
    setStatus("복사할 룸 코드가 없습니다.", "warn");
    return;
  }

  try {
    await navigator.clipboard.writeText(code);
    setStatus(`룸 코드 ${code} 를 클립보드에 복사했습니다.`, "success");
  } catch {
    setStatus("클립보드 복사에 실패했습니다.", "error");
  }
}

ui.createRoomButton.addEventListener("click", handleCreateRoom);
ui.joinRoomButton.addEventListener("click", handleJoinRoom);
ui.copyRoomButton.addEventListener("click", () => {
  void handleCopyRoomCode();
});

ui.roomCodeInput.addEventListener("input", () => {
  ui.roomCodeInput.value = normalizeRoomCode(ui.roomCodeInput.value);
});

ui.roomCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleJoinRoom();
  }
});

ui.nicknameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    if (currentRoomCode || currentSnapshot?.roomCode) {
      handleJoinRoom();
    } else {
      handleCreateRoom();
    }
  }
});

setStatus("서버에 연결하고 방을 만들면 바로 시작할 수 있습니다.", "info");
updateHud(null);
scene.setConnectionState(false);
