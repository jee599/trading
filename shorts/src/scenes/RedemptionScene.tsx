import type {FC} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {AnimatedText} from "../components/AnimatedText";
import {CounterAnim} from "../components/CounterAnim";
import {IconBurst} from "../components/IconBurst";
import {SlideTransition} from "../components/SlideTransition";
import {getBodyFont, getDisplayFont} from "../styles/fonts";
import type {ThemeTokens} from "../styles/themes";
import {getNarrationText, type RedemptionSceneProps} from "../types";

type RedemptionSceneComponentProps = RedemptionSceneProps & {
  theme: ThemeTokens;
};

export const RedemptionScene: FC<RedemptionSceneComponentProps> = ({
  number,
  title,
  titleAnimation,
  icon,
  iconAnimation,
  tts,
  theme,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const haloOpacity = interpolate(frame, [0, 18, 44], [0.1, 0.4, 0.24], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{padding: "170px 72px 120px"}}>
      <div
        style={{
          position: "absolute",
          width: 820,
          height: 820,
          left: "12%",
          top: "6%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.accent}28 0%, rgba(255,255,255,0.05) 45%, transparent 72%)`,
          filter: "blur(8px)",
          opacity: haloOpacity,
        }}
      />
      <SlideTransition frame={frame} direction="up" distance={64}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 44,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: getDisplayFont("en"),
                fontSize: 28,
                letterSpacing: "0.24em",
                color: theme.accent,
                marginBottom: 10,
              }}
            >
              TURNING POINT
            </div>
            <CounterAnim
              frame={frame}
              fps={fps}
              to={number}
              style={{
                fontFamily: getDisplayFont("en"),
                fontSize: 118,
                lineHeight: 1,
                fontWeight: 900,
                color: theme.textColor,
              }}
            />
          </div>
          <IconBurst
            icon={icon}
            animation={iconAnimation}
            frame={frame}
            fps={fps}
            accent={theme.accent}
            size={190}
          />
        </div>
      </SlideTransition>
      <div
        style={{
          padding: "52px 46px 46px",
          borderRadius: 46,
          background:
            "linear-gradient(180deg, rgba(10,12,18,0.3), rgba(255,255,255,0.08))",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: `0 18px 70px rgba(0, 0, 0, 0.18), 0 0 30px ${theme.glow}`,
        }}
      >
        <AnimatedText
          text={title}
          animation={titleAnimation}
          frame={frame}
          fps={fps}
          style={{
            fontFamily: getDisplayFont("ko"),
            fontSize: 88,
            lineHeight: 1,
            fontWeight: 900,
            color: theme.textColor,
            marginBottom: 34,
          }}
        />
        <div
          style={{
            fontFamily: getBodyFont("ko"),
            fontSize: 36,
            lineHeight: 1.58,
            color: theme.mutedText,
          }}
        >
          {getNarrationText({tts}, "ko")}
        </div>
      </div>
    </AbsoluteFill>
  );
};
