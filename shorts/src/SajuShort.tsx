import type {CSSProperties} from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {FireParticle} from "./components/FireParticle";
import {CtaScene} from "./scenes/CtaScene";
import {EmotionalScene} from "./scenes/EmotionalScene";
import {HookScene} from "./scenes/HookScene";
import {RedemptionScene} from "./scenes/RedemptionScene";
import {TraitScene} from "./scenes/TraitScene";
import {getBodyFont, getDisplayFont} from "./styles/fonts";
import {withThemeDefaults, type ThemeTokens} from "./styles/themes";
import {parseSajuShortProps, type Scene, type SajuShortProps} from "./types";

const renderScene = (scene: Scene, theme: ThemeTokens) => {
  switch (scene.type) {
    case "hook":
      return <HookScene {...scene} theme={theme} />;
    case "trait":
      return <TraitScene {...scene} theme={theme} />;
    case "emotional":
      return <EmotionalScene {...scene} theme={theme} />;
    case "redemption":
      return <RedemptionScene {...scene} theme={theme} />;
    case "cta":
      return <CtaScene {...scene} theme={theme} />;
    default:
      return null;
  }
};

const Backdrop = ({
  background,
  accent,
}: {
  background: string[];
  accent: string;
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  return (
    <>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${background.join(", ")})`,
        }}
      />
      {Array.from({length: 3}).map((_, index) => {
        const driftX = Math.sin((frame + index * 24) / 22) * 60;
        const driftY = Math.cos((frame + index * 36) / 27) * 44;
        const size = width * (0.36 + index * 0.08);
        const style: CSSProperties = {
          position: "absolute",
          left: `${10 + index * 27}%`,
          top: `${8 + index * 18}%`,
          width: size,
          height: size,
          borderRadius: "50%",
          background:
            index === 1
              ? `${accent}22`
              : "rgba(255, 255, 255, 0.06)",
          filter: "blur(60px)",
          transform: `translate(${driftX}px, ${driftY}px)`,
        };

        return <div key={index} style={style} />;
      })}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          maskImage:
            "linear-gradient(180deg, rgba(0,0,0,0.34), rgba(0,0,0,0.8))",
          opacity: 0.22,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.14) 55%, rgba(0,0,0,0.6) 100%)`,
        }}
      />
      <FireParticle frame={frame} accent={accent} count={12} />
      <div
        style={{
          position: "absolute",
          inset: 20,
          border: "1px solid rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(255,255,255,0.08), transparent 18%, transparent 76%, rgba(0,0,0,0.34))`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: width * 0.64,
          height: height * 0.64,
          left: "18%",
          top: "18%",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.08)",
          opacity: interpolate(frame % 150, [0, 75, 149], [0.12, 0.32, 0.12]),
          transform: `scale(${1 + Math.sin(frame / 45) * 0.05})`,
        }}
      />
    </>
  );
};

export const SajuShort = (inputProps: SajuShortProps) => {
  const props = parseSajuShortProps(inputProps);
  const frame = useCurrentFrame();
  const theme = withThemeDefaults(props.theme);
  const displayFont = getDisplayFont("ko");
  const bodyFont = getBodyFont("ko");

  return (
    <AbsoluteFill
      style={{
        fontFamily: bodyFont,
        color: theme.textColor,
        overflow: "hidden",
      }}
    >
      <Backdrop background={theme.bg} accent={theme.accent} />
      <div
        style={{
          position: "absolute",
          top: 68,
          left: 72,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 30,
            letterSpacing: "0.22em",
            color: theme.accent,
          }}
        >
          SAJU SHORTS
        </div>
        <div
          style={{
            fontSize: 24,
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.78)",
            opacity: interpolate(frame, [0, 20], [0, 1], {
              extrapolateRight: "clamp",
            }),
          }}
        >
          {props.title.ko ?? Object.values(props.title)[0]}
        </div>
      </div>
      {props.scenes.map((scene, index) => {
        return (
          <Sequence
            key={`${scene.type}-${scene.startFrame}-${index}`}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
          >
            {renderScene(scene, theme)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
