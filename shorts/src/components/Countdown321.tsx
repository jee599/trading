import type {FC} from "react";
import {AbsoluteFill, interpolate, spring} from "remotion";

type Countdown321Props = {
  frame: number;
  fps: number;
  accent: string;
};

export const Countdown321: FC<Countdown321Props> = ({frame, fps, accent}) => {
  const value = 3 - Math.min(2, Math.floor(frame / 12));
  const localFrame = frame % 12;
  const scale = spring({
    frame: localFrame,
    fps,
    config: {damping: 12, stiffness: 150},
  });
  const opacity = interpolate(localFrame, [0, 10], [0.25, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: 112,
          fontWeight: 900,
          color: accent,
          opacity,
          transform: `scale(${0.7 + scale * 0.3})`,
          textShadow: `0 0 24px ${accent}`,
        }}
      >
        {value}
      </div>
    </AbsoluteFill>
  );
};
