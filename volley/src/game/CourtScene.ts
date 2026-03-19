import Phaser from "phaser";

import {
  BallState,
  COURT,
  EMPTY_INPUT,
  InputState,
  PublicPlayerState,
  RoomSnapshot,
  Side,
} from "../../shared/protocol";

class MascotView extends Phaser.GameObjects.Container {
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly aura: Phaser.GameObjects.Ellipse;
  private readonly tail: Phaser.GameObjects.Graphics;
  private readonly torso: Phaser.GameObjects.Ellipse;
  private readonly belly: Phaser.GameObjects.Ellipse;
  private readonly leftEar: Phaser.GameObjects.Triangle;
  private readonly rightEar: Phaser.GameObjects.Triangle;
  private readonly leftCheek: Phaser.GameObjects.Arc;
  private readonly rightCheek: Phaser.GameObjects.Arc;
  private readonly leftEye: Phaser.GameObjects.Rectangle;
  private readonly rightEye: Phaser.GameObjects.Rectangle;
  private readonly nameplate: Phaser.GameObjects.Text;
  private readonly antenna: Phaser.GameObjects.Graphics;
  private readonly side: Side;
  private displayX: number;
  private displayY: number;

  constructor(scene: Phaser.Scene, side: Side) {
    super(scene, 0, 0);
    this.side = side;
    this.displayX = side === "left" ? COURT.leftSpawnX : COURT.rightSpawnX;
    this.displayY = COURT.groundY - COURT.playerRadius;

    this.shadow = scene.add.ellipse(0, 54, 88, 22, 0x07101d, 0.4);
    this.aura = scene.add.ellipse(0, 8, 154, 132, 0xf6d05d, 0.12);
    this.tail = scene.add.graphics();
    this.torso = scene.add.ellipse(
      0,
      2,
      102,
      98,
      side === "left" ? 0xf7d447 : 0xffb627,
    );
    this.belly = scene.add.ellipse(0, 18, 54, 42, 0xfff4be, 0.94);
    this.leftEar = scene.add.triangle(0, 0, -14, 0, 0, -72, 14, 0, 0x221320);
    this.rightEar = scene.add.triangle(0, 0, -14, 0, 0, -72, 14, 0, 0x221320);
    this.leftCheek = scene.add.circle(-20, 10, 8, 0xff7457, 0.95);
    this.rightCheek = scene.add.circle(20, 10, 8, 0xff7457, 0.95);
    this.leftEye = scene.add.rectangle(-12, -10, 8, 20, 0x17161d, 0.96);
    this.rightEye = scene.add.rectangle(12, -10, 8, 20, 0x17161d, 0.96);
    this.antenna = scene.add.graphics();
    this.nameplate = scene.add.text(0, -108, "", {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: "24px",
      color: "#fefaf1",
      stroke: "#0c1224",
      strokeThickness: 5,
    });
    this.nameplate.setOrigin(0.5);

    this.add([
      this.shadow,
      this.aura,
      this.tail,
      this.leftEar,
      this.rightEar,
      this.torso,
      this.belly,
      this.antenna,
      this.leftCheek,
      this.rightCheek,
      this.leftEye,
      this.rightEye,
      this.nameplate,
    ]);

    scene.add.existing(this);
    this.visible = false;
  }

  renderFromState(player: PublicPlayerState | null, deltaMs: number) {
    if (!player) {
      this.visible = false;
      return;
    }

    this.visible = true;
    const smoothing = 1 - Math.exp(-deltaMs / 58);
    this.displayX = Phaser.Math.Linear(this.displayX, player.x, smoothing);
    this.displayY = Phaser.Math.Linear(this.displayY, player.y, smoothing);

    this.x = this.displayX;
    this.y = this.displayY;
    this.scaleX = player.facing >= 0 ? 1 : -1;

    const speed = Math.abs(player.vx);
    const airborne = player.grounded ? 0 : 1;
    const squash = Phaser.Math.Clamp(speed / 650, 0, 0.15);
    const stretch = airborne ? 0.1 : squash;
    const bounce = Math.sin(this.scene.time.now / 130) * 1.5;
    const swing = player.swing;

    this.torso.scaleX = 1.02 + squash * 0.8;
    this.torso.scaleY = 1.02 - stretch * 0.8;
    this.belly.scaleX = this.torso.scaleX * 0.92;
    this.belly.scaleY = this.torso.scaleY * 0.92;
    this.leftEye.scaleY = 1 + swing * 0.25;
    this.rightEye.scaleY = 1 + swing * 0.25;
    this.leftCheek.scale = 1 + player.aura * 0.15;
    this.rightCheek.scale = 1 + player.aura * 0.15;
    this.aura.alpha = 0.08 + player.aura * 0.18;
    this.aura.scale = 1 + player.aura * 0.12;
    this.nameplate.setText(player.nickname.toUpperCase());
    this.nameplate.y = -112 - airborne * 8;
    this.shadow.width = 82 - airborne * 16;
    this.shadow.alpha = 0.36 - airborne * 0.12;
    this.torso.y = bounce - airborne * 12;
    this.belly.y = 18 + bounce - airborne * 12;
    this.leftCheek.y = 10 + bounce - airborne * 12;
    this.rightCheek.y = 10 + bounce - airborne * 12;
    this.leftEye.y = -10 + bounce - airborne * 12;
    this.rightEye.y = -10 + bounce - airborne * 12;

    const earSwing = 0.1 + squash * 0.25 + swing * 0.3;
    this.leftEar.x = -22;
    this.leftEar.y = -34 + bounce - airborne * 12;
    this.leftEar.rotation = -0.08 - earSwing;
    this.rightEar.x = 22;
    this.rightEar.y = -34 + bounce - airborne * 12;
    this.rightEar.rotation = 0.08 + earSwing;

    this.tail.clear();
    this.tail.fillStyle(this.side === "left" ? 0xb27a10 : 0xc16a00, 1);
    this.tail.beginPath();
    this.tail.moveTo(-44, 18 + bounce);
    this.tail.lineTo(-86, 2 + bounce);
    this.tail.lineTo(-62, -14 + bounce);
    this.tail.lineTo(-92, -42 + bounce);
    this.tail.lineTo(-40, -12 + bounce);
    this.tail.lineTo(-56, 8 + bounce);
    this.tail.closePath();
    this.tail.fillPath();

    this.antenna.clear();
    this.antenna.lineStyle(6, 0xfdf4d0, 0.9);
    this.antenna.beginPath();
    this.antenna.moveTo(-6, -34 + bounce - airborne * 12);
    this.antenna.lineTo(0, -54 + bounce - airborne * 12);
    this.antenna.lineTo(10, -62 + bounce - airborne * 12);
    this.antenna.strokePath();
    this.antenna.fillStyle(0xfff6d5, 0.95);
    this.antenna.fillCircle(12, -64 + bounce - airborne * 12, 7 + player.aura * 2);
  }
}

class BallView extends Phaser.GameObjects.Container {
  private readonly trail: Phaser.GameObjects.Arc[];
  private readonly outerGlow: Phaser.GameObjects.Arc;
  private readonly ring: Phaser.GameObjects.Arc;
  private readonly core: Phaser.GameObjects.Arc;
  private readonly highlight: Phaser.GameObjects.Arc;
  private displayX: number = COURT.netX;
  private displayY: number = 240;

  constructor(scene: Phaser.Scene) {
    super(scene, COURT.netX, 240);
    this.trail = Array.from({ length: 7 }, (_, index) =>
      scene.add.circle(0, 0, 16 - index * 1.6, 0x7ee7ff, 0.08),
    );
    this.outerGlow = scene.add.circle(0, 0, 44, 0x6fe8ff, 0.16);
    this.ring = scene.add.circle(0, 0, 31, 0xfff4bb, 0.35);
    this.core = scene.add.circle(0, 0, 24, 0xfffef8, 0.96);
    this.highlight = scene.add.circle(-8, -10, 6, 0xffffff, 0.8);

    this.add([
      ...this.trail,
      this.outerGlow,
      this.ring,
      this.core,
      this.highlight,
    ]);

    scene.add.existing(this);
  }

  renderFromState(ball: BallState, deltaMs: number) {
    const smoothing = 1 - Math.exp(-deltaMs / 46);
    this.displayX = Phaser.Math.Linear(this.displayX, ball.x, smoothing);
    this.displayY = Phaser.Math.Linear(this.displayY, ball.y, smoothing);
    this.x = this.displayX;
    this.y = this.displayY;

    const speed = Math.hypot(ball.vx, ball.vy);
    this.rotation = ball.vx * 0.0008;
    this.outerGlow.alpha = 0.14 + ball.glow * 0.24;
    this.outerGlow.scale = 1 + ball.glow * 0.2;
    this.ring.scale = 1 + speed / 1900;

    this.trail.forEach((orb, index) => {
      orb.x = -ball.vx * 0.008 * (index + 1);
      orb.y = -ball.vy * 0.008 * (index + 1);
      orb.alpha = Phaser.Math.Clamp(ball.glow * 0.18 - index * 0.016, 0.02, 0.18);
    });
  }
}

export class CourtScene extends Phaser.Scene {
  onInputChange?: (input: InputState) => void;

  private snapshot: RoomSnapshot | null = null;
  private inputState: InputState = { ...EMPTY_INPUT };
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private leftPlayer!: MascotView;
  private rightPlayer!: MascotView;
  private ball!: BallView;
  private phaseTitle!: Phaser.GameObjects.Text;
  private phaseBody!: Phaser.GameObjects.Text;
  private connectionText!: Phaser.GameObjects.Text;
  private sparkLayer!: Phaser.GameObjects.Container;
  private lastBallGlow = 0;

  constructor() {
    super("CourtScene");
  }

  setConnectionState(connected: boolean) {
    if (!this.connectionText) {
      return;
    }

    this.connectionText.setText(connected ? "ONLINE" : "OFFLINE");
    this.connectionText.setColor(connected ? "#7dffb1" : "#ffd06e");
  }

  setIdentity(_playerId: string, _side: Side, _nickname: string) {
    return;
  }

  setSnapshot(snapshot: RoomSnapshot) {
    const previousGlow = this.lastBallGlow;
    this.snapshot = snapshot;
    this.lastBallGlow = snapshot.ball.glow;

    if (snapshot.ball.glow > 0.85 && previousGlow <= 0.85) {
      this.spawnSparkBurst(snapshot.ball.x, snapshot.ball.y, 0xf7e37e);
    }

    if (snapshot.phase === "point") {
      this.phaseTitle.setText("POINT");
      this.phaseBody.setText(snapshot.message);
    } else if (snapshot.phase === "countdown") {
      this.phaseTitle.setText(`READY ${Math.max(1, Math.ceil(snapshot.countdown))}`);
      this.phaseBody.setText("두 플레이어가 연결되었습니다. 곧 서브가 시작됩니다.");
    } else if (snapshot.phase === "waiting") {
      this.phaseTitle.setText("WAITING");
      this.phaseBody.setText(snapshot.message || "상대방을 기다리는 중입니다.");
    } else {
      this.phaseTitle.setText("LIVE");
      this.phaseBody.setText(snapshot.message || "랠리를 이어가고 점수를 먼저 7점까지 올리세요.");
    }
  }

  create() {
    this.drawBackdrop();

    this.leftPlayer = new MascotView(this, "left");
    this.rightPlayer = new MascotView(this, "right");
    this.ball = new BallView(this);
    this.sparkLayer = this.add.container(0, 0);

    this.phaseTitle = this.add.text(50, 42, "LOBBY", {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: "36px",
      fontStyle: "700",
      color: "#fff4c9",
      stroke: "#0a1020",
      strokeThickness: 6,
    });
    this.phaseBody = this.add.text(
      50,
      84,
      "서버에 연결하고 방을 만들면 랠리 준비가 끝납니다.",
      {
        fontFamily: '"Chakra Petch", sans-serif',
        fontSize: "22px",
        color: "#d4e6ff",
        wordWrap: { width: 520 },
      },
    );
    this.connectionText = this.add.text(1094, 40, "OFFLINE", {
      fontFamily: '"Chakra Petch", sans-serif',
      fontSize: "26px",
      fontStyle: "700",
      color: "#ffd06e",
    });

    this.keys = this.input.keyboard?.addKeys({
      leftA: Phaser.Input.Keyboard.KeyCodes.A,
      rightD: Phaser.Input.Keyboard.KeyCodes.D,
      jumpW: Phaser.Input.Keyboard.KeyCodes.W,
      leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      jumpArrow: Phaser.Input.Keyboard.KeyCodes.UP,
      hitSpace: Phaser.Input.Keyboard.KeyCodes.SPACE,
      hitShift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
  }

  update(_time: number, deltaMs: number) {
    this.pushInputIfChanged();

    const snapshot = this.snapshot;
    if (!snapshot) {
      return;
    }

    this.leftPlayer.renderFromState(snapshot.players.left, deltaMs);
    this.rightPlayer.renderFromState(snapshot.players.right, deltaMs);
    this.ball.renderFromState(snapshot.ball, deltaMs);
  }

  private pushInputIfChanged() {
    if (!this.keys) {
      return;
    }

    const nextInput: InputState = {
      left: this.keys.leftA.isDown || this.keys.leftArrow.isDown,
      right: this.keys.rightD.isDown || this.keys.rightArrow.isDown,
      jump: this.keys.jumpW.isDown || this.keys.jumpArrow.isDown,
      hit: this.keys.hitSpace.isDown || this.keys.hitShift.isDown,
    };

    const changed =
      nextInput.left !== this.inputState.left ||
      nextInput.right !== this.inputState.right ||
      nextInput.jump !== this.inputState.jump ||
      nextInput.hit !== this.inputState.hit;

    if (!changed) {
      return;
    }

    this.inputState = nextInput;
    this.onInputChange?.(nextInput);
  }

  private drawBackdrop() {
    this.add.rectangle(640, 360, 1280, 720, 0x0a1327, 1);
    this.add.circle(1030, 118, 154, 0xffcd6c, 0.12);
    this.add.circle(1030, 118, 110, 0xffef9e, 0.18);
    this.add.circle(994, 144, 38, 0xfff5ca, 0.24);

    const cloudTint = 0xeff7ff;
    this.makeCloud(212, 162, cloudTint, 0.18, 30);
    this.makeCloud(512, 112, cloudTint, 0.14, 45);
    this.makeCloud(910, 214, cloudTint, 0.12, 36);

    const ridgeFar = this.add.graphics();
    ridgeFar.fillStyle(0x22385d, 1);
    ridgeFar.beginPath();
    ridgeFar.moveTo(0, 490);
    ridgeFar.lineTo(118, 396);
    ridgeFar.lineTo(236, 474);
    ridgeFar.lineTo(402, 314);
    ridgeFar.lineTo(566, 500);
    ridgeFar.lineTo(730, 352);
    ridgeFar.lineTo(914, 504);
    ridgeFar.lineTo(1090, 324);
    ridgeFar.lineTo(1280, 472);
    ridgeFar.lineTo(1280, 720);
    ridgeFar.lineTo(0, 720);
    ridgeFar.closePath();
    ridgeFar.fillPath();

    const ridgeNear = this.add.graphics();
    ridgeNear.fillStyle(0x15263f, 1);
    ridgeNear.beginPath();
    ridgeNear.moveTo(0, 560);
    ridgeNear.lineTo(158, 474);
    ridgeNear.lineTo(318, 538);
    ridgeNear.lineTo(480, 408);
    ridgeNear.lineTo(680, 574);
    ridgeNear.lineTo(872, 414);
    ridgeNear.lineTo(1054, 554);
    ridgeNear.lineTo(1280, 432);
    ridgeNear.lineTo(1280, 720);
    ridgeNear.lineTo(0, 720);
    ridgeNear.closePath();
    ridgeNear.fillPath();

    this.add.rectangle(640, 642, 1280, 156, 0x172736, 1);
    this.add.rectangle(640, 614, 1280, 8, 0xb8fff1, 0.3);

    const court = this.add.graphics();
    court.lineStyle(8, 0xeefff7, 0.92);
    court.strokeRect(100, 400, 1080, 220);
    court.lineBetween(COURT.netX, 620, COURT.netX, 400);
    court.lineBetween(100, 620, 1180, 620);
    court.lineBetween(100, 510, 1180, 510);

    const floorGlow = this.add.graphics();
    floorGlow.fillStyle(0x49f1d6, 0.07);
    floorGlow.fillEllipse(640, 606, 840, 96);

    const crowd = this.add.graphics();
    crowd.fillStyle(0x0e1b2a, 0.8);
    for (let x = 140; x < 1140; x += 44) {
      const height = 26 + ((x / 44) % 4) * 10;
      crowd.fillRoundedRect(x, 356 - height, 26, height, 6);
      crowd.fillStyle(0x3ce4f6, 0.18 + ((x / 44) % 3) * 0.08);
      crowd.fillRect(x + 4, 352 - height, 18, 4);
      crowd.fillStyle(0x0e1b2a, 0.8);
    }

    const net = this.add.graphics();
    net.fillStyle(0xfff4ce, 1);
    net.fillRoundedRect(COURT.netX - 18, 402, 36, 218, 14);
    net.fillStyle(0x0b121c, 0.16);
    for (let y = 414; y < 610; y += 18) {
      net.fillRect(COURT.netX - 17, y, 34, 2);
    }
    for (let x = COURT.netX - 10; x <= COURT.netX + 8; x += 10) {
      net.fillRect(x, 404, 2, 212);
    }
    this.add.circle(COURT.netX, 400, 20, 0xfff7d9, 1);
  }

  private makeCloud(
    x: number,
    y: number,
    tint: number,
    alpha: number,
    span: number,
  ) {
    const cloud = this.add.container(x, y, [
      this.add.ellipse(-34, 6, 72, 48, tint, alpha),
      this.add.ellipse(10, -4, 98, 58, tint, alpha),
      this.add.ellipse(54, 10, 74, 46, tint, alpha),
      this.add.ellipse(0, 18, 140, 42, tint, alpha * 0.8),
    ]);

    this.tweens.add({
      targets: cloud,
      x: x + span,
      duration: 6400 + span * 50,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });
  }

  private spawnSparkBurst(x: number, y: number, tint: number) {
    for (let index = 0; index < 9; index += 1) {
      const spark = this.add.circle(x, y, 5, tint, 0.95);
      this.sparkLayer.add(spark);
      const angle = Phaser.Math.DegToRad(40 * index + Phaser.Math.Between(-12, 12));
      const distance = Phaser.Math.Between(34, 76);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.2,
        duration: 320,
        ease: "Cubic.out",
        onComplete: () => spark.destroy(),
      });
    }
  }
}
