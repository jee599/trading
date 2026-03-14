import type {FC} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {AnimatedText} from "../components/AnimatedText";
import {IconBurst} from "../components/IconBurst";
import {SlideTransition} from "../components/SlideTransition";
import {getBodyFont, getDisplayFont} from "../styles/fonts";
import type {ThemeTokens} from "../styles/themes";
import type {HookSceneProps} from "../types";

type HookSceneComponentProps = HookSceneProps & {
  theme: ThemeTokens;
};

export const HookScene: FC<HookSceneComponentProps> = ({
  text,
  textAnimation,
  lottie,
  theme,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const subtitleOpacity = interpolate(frame, [10, 28], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{padding: "190px 72px 120px"}}>
      <SlideTransition frame={frame} direction="up" distance={120}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 18,
            padding: "14px 22px",
            borderRadius: 999,
            alignSelf: "center",
            background: "rgba(255,255,255,0.1)",
            border: `1px solid ${theme.panelBorder}`,
            boxShadow: `0 0 24px ${theme.glow}`,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: theme.accent,
              boxShadow: `0 0 18px ${theme.accent}`,
            }}
          />
          <div
            style={{
              fontFamily: getDisplayFont("ko"),
              fontSize: 28,
              letterSpacing: "0.18em",
              color: theme.textColor,
            }}
          >
            FIVE ELEMENT SNAPSHOT
          </div>
        </div>
      </SlideTransition>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 48,
        }}
      >
        <IconBurst
          icon={lottie ?? "fire"}
          animation="growIlluminate"
          frame={frame}
          fps={fps}
          accent={theme.accent}
          size={210}
        />
        <div
          style={{
            maxWidth: 860,
            textAlign: "center",
            fontFamily: getDisplayFont("ko"),
            textTransform: "uppercase",
          }}
        >
          <AnimatedText
            text={text}
            animation={textAnimation}
            frame={frame}
            fps={fps}
            style={{
              fontSize: 122,
              lineHeight: 0.92,
              letterSpacing: "-0.03em",
              fontWeight: 900,
              color: theme.textColor,
            }}
          />
        </div>
      </div>
      <div
        style={{
          alignSelf: "center",
          maxWidth: 720,
          padding: "22px 28px",
          borderRadius: 32,
          background: theme.panel,
          border: `1px solid ${theme.panelBorder}`,
          opacity: subtitleOpacity,
          textAlign: "center",
          fontFamily: getBodyFont("ko"),
          fontSize: 32,
          lineHeight: 1.45,
          color: theme.mutedText,
        }}
      >
        뜨거운 추진력, 짧은 지속력, 그리고 위기에서 더 빛나는 타입.
      </div>
    </AbsoluteFill>
  );
};
