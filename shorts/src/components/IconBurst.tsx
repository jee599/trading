import type {FC} from "react";
import {AbsoluteFill, interpolate, spring} from "remotion";
import {Countdown321} from "./Countdown321";

const resolveIconGlyph = (icon: string) => {
  const normalized = icon.toLowerCase();

  if (normalized.includes("fire") || normalized.includes("flame")) {
    return "🔥";
  }

  if (normalized.includes("water") || normalized.includes("drop")) {
    return "💧";
  }

  if (
    normalized.includes("tree") ||
    normalized.includes("wood") ||
    normalized.includes("branch") ||
    normalized.includes("root")
  ) {
    return "🌿";
  }

  if (
    normalized.includes("heart") ||
    normalized.includes("flower") ||
    normalized.includes("cherry")
  ) {
    return "💗";
  }

  if (normalized.includes("lightning")) {
    return "⚡";
  }

  if (normalized.includes("gear")) {
    return "⚙️";
  }

  if (normalized.includes("calendar") || normalized.includes("clock")) {
    return "🗓️";
  }

  if (normalized.includes("battery")) {
    return "🔋";
  }

  if (normalized.includes("airplane")) {
    return "✈️";
  }

  if (normalized.includes("map") || normalized.includes("globe")) {
    return "🧭";
  }

  if (normalized.includes("sunrise") || normalized.includes("sun")) {
    return "☀️";
  }

  if (normalized.includes("sunset")) {
    return "🌇";
  }

  if (normalized.includes("shield") || normalized.includes("justice")) {
    return "🛡️";
  }

  if (normalized.includes("rock") || normalized.includes("crack")) {
    return "🪨";
  }

  if (normalized.includes("chair") || normalized.includes("campfire")) {
    return "🏕️";
  }

  if (normalized.includes("crown") || normalized.includes("commander")) {
    return "👑";
  }

  if (normalized.includes("palette")) {
    return "🎨";
  }

  if (normalized.includes("stamp") || normalized.includes("yes")) {
    return "✅";
  }

  if (normalized.includes("moving") || normalized.includes("boxes")) {
    return "📦";
  }

  if (normalized.includes("spotlight")) {
    return "🎭";
  }

  if (normalized.includes("sparkle")) {
    return "✨";
  }

  if (normalized.includes("arrow")) {
    return "🌀";
  }

  if (normalized.includes("flood")) {
    return "🌊";
  }

  return "✨";
};

type IconBurstProps = {
  icon: string;
  animation?: string;
  frame: number;
  fps: number;
  accent: string;
  size?: number;
};

export const IconBurst: FC<IconBurstProps> = ({
  icon,
  animation,
  frame,
  fps,
  accent,
  size = 168,
}) => {
  const burstScale = spring({
    frame,
    fps,
    config: {
      damping:
        animation === "popBounce" || animation === "growIlluminate" ? 12 : 24,
      stiffness:
        animation === "popBounce" || animation === "growIlluminate" ? 160 : 110,
    },
  });
  const glow = interpolate(frame, [0, 15, 30], [0.35, 0.9, 0.5], {
    extrapolateRight: "clamp",
  });
  const iconGlyph = resolveIconGlyph(icon);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        transform: `scale(${0.78 + burstScale * 0.22})`,
      }}
    >
      <AbsoluteFill style={{pointerEvents: "none"}}>
        {Array.from({length: 8}).map((_, index) => {
          const angle = (Math.PI * 2 * index) / 8;
          const distance = 70 + burstScale * 38;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          const opacity = interpolate(frame, [0, 12, 36], [0, 0.85, 0], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 18,
                height: 18,
                marginLeft: -9,
                marginTop: -9,
                borderRadius: 999,
                background: index % 2 === 0 ? accent : "rgba(255, 255, 255, 0.86)",
                opacity,
                transform: `translate(${x}px, ${y}px) scale(${0.4 + glow * 0.8})`,
                boxShadow: `0 0 20px ${accent}`,
              }}
            />
          );
        })}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "38%",
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow: `0 0 32px ${accent}, inset 0 0 24px rgba(255,255,255,0.08)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.42,
          filter:
            animation === "growIlluminate"
              ? `drop-shadow(0 0 18px ${accent})`
              : undefined,
        }}
      >
        {iconGlyph}
      </div>
      {animation === "countdown321" ? (
        <Countdown321 frame={frame} fps={fps} accent={accent} />
      ) : null}
    </div>
  );
};
