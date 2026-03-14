import type {FC, ReactNode} from "react";

type ShakeEffectProps = {
  frame: number;
  active?: boolean;
  intensity?: number;
  children: ReactNode;
};

export const ShakeEffect: FC<ShakeEffectProps> = ({
  frame,
  active = false,
  intensity = 10,
  children,
}) => {
  const x = active ? Math.sin(frame * 0.9) * intensity : 0;
  const y = active ? Math.cos(frame * 1.1) * intensity * 0.4 : 0;

  return <div style={{transform: `translate(${x}px, ${y}px)`}}>{children}</div>;
};
