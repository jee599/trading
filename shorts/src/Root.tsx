import type {CalculateMetadataFunction} from "remotion";
import {Composition} from "remotion";
import sampleProps from "../props/fire_many.json";
import {SajuShort} from "./SajuShort";
import {
  DEFAULT_VIDEO_CONFIG,
  type SajuShortProps,
  parseSajuShortProps,
} from "./types";

const defaultSampleProps = parseSajuShortProps(sampleProps);

const calculateMetadata: CalculateMetadataFunction<SajuShortProps> = ({
  props,
}) => {
  const parsed = parseSajuShortProps(props ?? defaultSampleProps);

  return {
    durationInFrames: parsed.totalDurationFrames,
    fps: parsed.fps,
    width: parsed.width,
    height: parsed.height,
  };
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="SajuShort"
      component={SajuShort}
      width={DEFAULT_VIDEO_CONFIG.width}
      height={DEFAULT_VIDEO_CONFIG.height}
      fps={DEFAULT_VIDEO_CONFIG.fps}
      durationInFrames={DEFAULT_VIDEO_CONFIG.durationInFrames}
      defaultProps={defaultSampleProps}
      calculateMetadata={calculateMetadata}
    />
  );
};
