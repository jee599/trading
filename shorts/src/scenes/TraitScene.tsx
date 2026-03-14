import type {FC} from "react";
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {AnimatedText} from "../components/AnimatedText";
import {IconBurst} from "../components/IconBurst";
import {ShakeEffect} from "../components/ShakeEffect";
import {SlideTransition} from "../components/SlideTransition";
import {getBodyFont, getDisplayFont} from "../styles/fonts";
import type {ThemeTokens} from "../styles/themes";
import {getNarrationText, type TraitSceneProps} from "../types";

type TraitSceneComponentProps = TraitSceneProps & {
  theme: ThemeTokens;
};

export const TraitScene: FC<TraitSceneComponentProps> = ({
  number,
  title,
  titleAnimation,
  icon,
  iconAnimation,
  bgEffect,
  highlightWord,
  tts,
  theme,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const numberScale = spring({frame, fps, config: {damping: 80}});
  const panelOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const activeShake = bgEffect === "screenShake";

  return (
    <AbsoluteFill style={{padding: "200px 72px 120px"}}>
      <ShakeEffect frame={frame} active={activeShake} intensity={12}>
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "50%",
            transform: `translateX(-50%) scale(${0.7 + numberScale * 0.3})`,
            fontFamily: getDisplayFont("en"),
            fontSize: 240,
            fontWeight: 900,
            color: theme.accent,
            opacity: 0.12,
          }}
        >
          {number}
        </div>
        <SlideTransition frame={frame} direction="up" distance={80}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 170,
              marginBottom: 60,
            }}
          >
            <IconBurst
              icon={icon}
              animation={iconAnimation}
              frame={frame}
              fps={fps}
              accent={theme.accent}
            />
          </div>
        </SlideTransition>
        <div
          style={{
            padding: "48px 42px 42px",
            borderRadius: 42,
            background:
              bgEffect === "colorPulse"
                ? `linear-gradient(180deg, ${theme.panel}, rgba(255, 255, 255, 0.08))`
                : theme.panel,
            border: `1px solid ${theme.panelBorder}`,
            boxShadow: `0 24px 64px rgba(0, 0, 0, 0.2), 0 0 24px ${theme.glow}`,
            opacity: panelOpacity,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 26,
              color: theme.accent,
              fontFamily: getDisplayFont("en"),
              fontSize: 28,
              letterSpacing: "0.2em",
            }}
          >
            <span>{`TRAIT ${number}`}</span>
            <span style={{flex: 1, height: 1, background: `${theme.accent}66`}} />
          </div>
          <AnimatedText
            text={title}
            animation={titleAnimation}
            frame={frame}
            fps={fps}
            highlightWord={highlightWord}
            highlightColor={theme.accent}
            style={{
              fontFamily: getDisplayFont("ko"),
              fontSize: 82,
              lineHeight: 0.98,
              fontWeight: 900,
              color: theme.textColor,
              textAlign: "center",
              marginBottom: 30,
            }}
          />
          <div
            style={{
              fontFamily: getBodyFont("ko"),
              fontSize: 34,
              lineHeight: 1.55,
              color: theme.mutedText,
              textAlign: "center",
            }}
          >
            {getNarrationText({tts}, "ko")}
          </div>
        </div>
      </ShakeEffect>
    </AbsoluteFill>
  );
};
