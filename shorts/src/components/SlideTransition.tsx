import type {FC, ReactNode} from "react";
import {interpolate} from "remotion";

type SlideTransitionProps = {
  frame: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  children: ReactNode;
};

export const SlideTransition: FC<SlideTransitionProps> = ({
  frame,
  direction = "up",
  distance = 90,
  children,
}) => {
  const offset = interpolate(frame, [0, 14], [distance, 0], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  const transform =
    direction === "left"
      ? `translateX(${-offset}px)`
      : direction === "right"
        ? `translateX(${offset}px)`
        : direction === "down"
          ? `translateY(${offset}px)`
          : `translateY(${-offset}px)`;

  return <div style={{transform, opacity}}>{children}</div>;
};
