import type {FC} from "react";
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from "remotion";
import {AnimatedText} from "../components/AnimatedText";
import {GaugeBar} from "../components/GaugeBar";
import {IconBurst} from "../components/IconBurst";
import {SlideTransition} from "../components/SlideTransition";
import {getBodyFont, getDisplayFont} from "../styles/fonts";
import type {ThemeTokens} from "../styles/themes";
import type {CtaSceneProps} from "../types";

type CtaSceneComponentProps = CtaSceneProps & {
  theme: ThemeTokens;
};

export const CtaScene: FC<CtaSceneComponentProps> = ({
  question,
  questionAnimation,
  gaugeLabel,
  gaugeRange,
  ctaUrl,
  ctaAnimation,
  lottie,
  theme,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const targetValue = Math.max(
    gaugeRange[0],
    Math.min(gaugeRange[1], gaugeRange[1] - 1),
  );

  return (
    <AbsoluteFill style={{padding: "190px 72px 126px"}}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 46,
        }}
      >
        <IconBurst
          icon={lottie ?? "fire"}
          animation="growIlluminate"
          frame={frame}
          fps={fps}
          accent={theme.accent}
          size={176}
        />
      </div>
      <SlideTransition frame={frame} direction="up" distance={70}>
        <div
          style={{
            padding: "54px 44px 44px",
            borderRadius: 46,
            background: "rgba(8, 10, 18, 0.56)",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: `0 24px 80px rgba(0,0,0,0.22), 0 0 24px ${theme.glow}`,
          }}
        >
          <div
            style={{
              fontFamily: getDisplayFont("en"),
              fontSize: 28,
              letterSpacing: "0.22em",
              color: theme.accent,
              marginBottom: 18,
            }}
          >
            CHECK YOUR CHART
          </div>
          <AnimatedText
            text={question}
            animation={questionAnimation}
            frame={frame}
            fps={fps}
            style={{
              fontFamily: getDisplayFont("ko"),
              fontSize: 86,
              lineHeight: 1,
              fontWeight: 900,
              color: theme.textColor,
              marginBottom: 38,
            }}
          />
          <GaugeBar
            frame={frame}
            fps={fps}
            accent={theme.accent}
            label={gaugeLabel}
            range={gaugeRange}
            targetValue={targetValue}
          />
          <div
            style={{
              marginTop: 38,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
            }}
          >
            <div
              style={{
                flex: 1,
                fontFamily: getBodyFont("ko"),
                fontSize: 30,
                lineHeight: 1.5,
                color: theme.mutedText,
              }}
            >
              내 사주 오행 구성을 바로 확인하고, 부족한 기운까지 한 번에 체크해보세요.
            </div>
            <AnimatedText
              text={ctaUrl}
              animation={ctaAnimation}
              frame={frame}
              fps={fps}
              style={{
                flexShrink: 0,
                padding: "18px 26px",
                borderRadius: 999,
                background: theme.accent,
                fontFamily: getDisplayFont("en"),
                fontSize: 32,
                letterSpacing: "0.08em",
                color: "#160808",
                fontWeight: 900,
              }}
            />
          </div>
        </div>
      </SlideTransition>
    </AbsoluteFill>
  );
};
