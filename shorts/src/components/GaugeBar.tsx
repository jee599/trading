import type {FC} from "react";
import {interpolate, spring} from "remotion";

type GaugeBarProps = {
  frame: number;
  fps: number;
  accent: string;
  label: string;
  range: [number, number];
  targetValue: number;
};

export const GaugeBar: FC<GaugeBarProps> = ({
  frame,
  fps,
  accent,
  label,
  range,
  targetValue,
}) => {
  const [min, max] = range;
  const progress = spring({
    frame,
    fps,
    config: {damping: 20, stiffness: 110},
  });
  const ratio = interpolate(targetValue, [min, max], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fillRatio = ratio * progress;

  return (
    <div style={{width: "100%"}}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 14,
          color: "rgba(255, 255, 255, 0.86)",
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
      >
        <span>{label}</span>
        <span>{`${targetValue}/${max}`}</span>
      </div>
      <div
        style={{
          position: "relative",
          height: 22,
          borderRadius: 999,
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.12)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        <div
          style={{
            width: `${fillRatio * 100}%`,
            height: "100%",
            borderRadius: 999,
            background: `linear-gradient(90deg, ${accent}, #ffffff)`,
            boxShadow: `0 0 28px ${accent}`,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 10,
          fontSize: 20,
          color: "rgba(255, 255, 255, 0.66)",
        }}
      >
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
