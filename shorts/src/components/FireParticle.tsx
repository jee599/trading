import type {FC} from "react";
import {AbsoluteFill, interpolate} from "remotion";

type FireParticleProps = {
  frame: number;
  accent: string;
  count?: number;
};

const palette = ["#ffd166", "#ff9f1c", "#ff6b35", "#ff3d00"];

export const FireParticle: FC<FireParticleProps> = ({
  frame,
  accent,
  count = 14,
}) => {
  return (
    <AbsoluteFill style={{pointerEvents: "none"}}>
      {Array.from({length: count}).map((_, index) => {
        const cycle = (frame + index * 5) % 70;
        const progress = cycle / 70;
        const x = (index * 73) % 100;
        const yStart = 104 + (index % 3) * 8;
        const y = yStart - progress * 92;
        const scale = interpolate(progress, [0, 1], [0.4, 1.2]);
        const opacity = interpolate(progress, [0, 0.2, 1], [0, 0.75, 0], {
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 14 + (index % 4) * 8,
              height: 18 + (index % 4) * 10,
              borderRadius: "50% 50% 50% 50%",
              background:
                index % 4 === 0
                  ? accent
                  : palette[index % palette.length],
              opacity,
              transform: `translate(-50%, -50%) scale(${scale}) rotate(${index * 17}deg)`,
              filter: "blur(1px)",
              boxShadow: `0 0 22px ${accent}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
