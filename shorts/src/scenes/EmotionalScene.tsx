import type {FC} from "react";
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {AnimatedText} from "../components/AnimatedText";
import {IconBurst} from "../components/IconBurst";
import {SlideTransition} from "../components/SlideTransition";
import {getBodyFont, getDisplayFont} from "../styles/fonts";
import type {ThemeTokens} from "../styles/themes";
import {getNarrationText, type EmotionalSceneProps} from "../types";

type EmotionalSceneComponentProps = EmotionalSceneProps & {
  theme: ThemeTokens;
};

export const EmotionalScene: FC<EmotionalSceneComponentProps> = ({
  title,
  titleAnimation,
  highlightWord,
  icon,
  iconAnimation,
  tts,
  theme,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const overlayOpacity = interpolate(frame, [0, 24], [0.2, 0.68], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{padding: "210px 72px 120px"}}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.54) 40%, rgba(0,0,0,0.78) 100%)",
          opacity: overlayOpacity,
        }}
      />
      <SlideTransition frame={frame} direction="down" distance={80}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 42,
          }}
        >
          <IconBurst
            icon={icon}
            animation={iconAnimation}
            frame={frame}
            fps={fps}
            accent={theme.accent}
            size={180}
          />
        </div>
      </SlideTransition>
      <div
        style={{
          marginTop: 180,
          padding: "54px 44px 48px",
          borderRadius: 46,
          background: "rgba(6, 6, 12, 0.56)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.28)",
        }}
      >
        <div
          style={{
            fontFamily: getDisplayFont("en"),
            fontSize: 28,
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.68)",
            marginBottom: 22,
          }}
        >
          PRIVATE COST
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
            fontSize: 88,
            lineHeight: 1,
            fontWeight: 900,
            color: theme.textColor,
            textAlign: "left",
            marginBottom: 34,
          }}
        />
        <div
          style={{
            width: 120,
            height: 8,
            borderRadius: 999,
            background: `linear-gradient(90deg, ${theme.accent}, transparent)`,
            marginBottom: 30,
          }}
        />
        <div
          style={{
            fontFamily: getBodyFont("ko"),
            fontSize: 36,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.84)",
          }}
        >
          {getNarrationText({tts}, "ko")}
        </div>
      </div>
    </AbsoluteFill>
  );
};
