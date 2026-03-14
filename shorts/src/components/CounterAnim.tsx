import type {CSSProperties, FC} from "react";
import {interpolate, spring} from "remotion";

type CounterAnimProps = {
  frame: number;
  fps: number;
  from?: number;
  to: number;
  style?: CSSProperties;
  suffix?: string;
};

export const CounterAnim: FC<CounterAnimProps> = ({
  frame,
  fps,
  from = 0,
  to,
  style,
  suffix = "",
}) => {
  const progress = spring({
    frame,
    fps,
    config: {damping: 24, stiffness: 100},
  });
  const value = Math.round(interpolate(progress, [0, 1], [from, to]));

  return <div style={style}>{`${value}${suffix}`}</div>;
};
