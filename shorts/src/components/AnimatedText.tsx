import type {CSSProperties, ReactNode} from "react";
import {interpolate, spring} from "remotion";
import type {z} from "zod";
import {textAnimationSchema} from "../types";

type Animation = z.infer<typeof textAnimationSchema>;

type AnimatedTextProps = {
  text: string;
  animation: Animation;
  frame: number;
  fps: number;
  style?: CSSProperties;
  highlightWord?: string;
  highlightColor?: string;
};

const renderHighlighted = (
  text: string,
  highlightWord?: string,
  highlightColor?: string,
): ReactNode => {
  if (!highlightWord || !text.includes(highlightWord)) {
    return text;
  }

  const parts = text.split(highlightWord);

  return parts.flatMap((part, index) => {
    const chunk: ReactNode[] = [part];
    if (index < parts.length - 1) {
      chunk.push(
        <span
          key={`highlight-${index}`}
          style={{color: highlightColor ?? "#ffd700"}}
        >
          {highlightWord}
        </span>,
      );
    }

    return chunk;
  });
};

export const AnimatedText = ({
  text,
  animation,
  frame,
  fps,
  style,
  highlightWord,
  highlightColor,
}: AnimatedTextProps) => {
  if (animation === "charByCharFire" || animation === "lightUpCharByChar") {
    const isLight = animation === "lightUpCharByChar";

    return (
      <div style={style}>
        {text.split("").map((char, index) => {
          const delay = index * 2;
          const localFrame = Math.max(0, frame - delay);
          const opacity = interpolate(localFrame, [0, 5], [0, 1], {
            extrapolateRight: "clamp",
          });
          const scale = spring({
            frame: localFrame,
            fps,
            config: {damping: isLight ? 70 : 85, stiffness: isLight ? 120 : 90},
          });

          return (
            <span
              key={`${char}-${index}`}
              style={{
                opacity,
                display: "inline-block",
                transform: `translateY(${(1 - scale) * 28}px) scale(${0.75 + scale * 0.25})`,
                textShadow:
                  opacity > 0.5
                    ? isLight
                      ? "0 0 28px rgba(255, 235, 142, 0.8)"
                      : "0 0 24px rgba(255, 107, 53, 0.78)"
                    : "none",
                filter: isLight ? "brightness(1.15)" : undefined,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </div>
    );
  }

  if (animation === "slideInLeft") {
    const x = interpolate(frame, [0, 14], [-240, 0], {
      extrapolateRight: "clamp",
    });
    const opacity = interpolate(frame, [0, 9], [0, 1], {
      extrapolateRight: "clamp",
    });

    return (
      <div style={{...style, transform: `translateX(${x}px)`, opacity}}>
        {renderHighlighted(text, highlightWord, highlightColor)}
      </div>
    );
  }

  if (animation === "popIn" || animation === "popInBounce") {
    const scale = spring({
      frame,
      fps,
      config: {
        damping: animation === "popInBounce" ? 10 : 28,
        stiffness: animation === "popInBounce" ? 170 : 120,
      },
    });
    const opacity = interpolate(frame, [0, 6], [0, 1], {
      extrapolateRight: "clamp",
    });

    return (
      <div style={{...style, transform: `scale(${scale})`, opacity}}>
        {renderHighlighted(text, highlightWord, highlightColor)}
      </div>
    );
  }

  if (animation === "fadeInSlow") {
    const opacity = interpolate(frame, [0, 26], [0, 1], {
      extrapolateRight: "clamp",
    });
    const y = interpolate(frame, [0, 26], [24, 0], {
      extrapolateRight: "clamp",
    });

    return (
      <div style={{...style, opacity, transform: `translateY(${y}px)`}}>
        {renderHighlighted(text, highlightWord, highlightColor)}
      </div>
    );
  }

  if (animation === "bounceIn") {
    const scale = spring({
      frame,
      fps,
      config: {damping: 12, stiffness: 180},
    });
    const rotate = interpolate(frame, [0, 18], [8, 0], {
      extrapolateRight: "clamp",
    });

    return (
      <div style={{...style, transform: `scale(${scale}) rotate(${rotate}deg)`}}>
        {renderHighlighted(text, highlightWord, highlightColor)}
      </div>
    );
  }

  return <div style={style}>{renderHighlighted(text, highlightWord, highlightColor)}</div>;
};
