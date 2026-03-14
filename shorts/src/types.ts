import {z} from "zod";

export const DEFAULT_VIDEO_CONFIG = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 660,
} as const;

export const textAnimationSchema = z.enum([
  "slideInLeft",
  "popIn",
  "charByCharFire",
  "fadeInSlow",
  "lightUpCharByChar",
  "bounceIn",
  "popInBounce",
]);

const localizedTextSchema = z.record(z.string(), z.string());

export const themeSchema = z.object({
  bg: z.array(z.string()).min(2),
  accent: z.string(),
  textColor: z.string(),
});

const baseSceneSchema = z.object({
  startFrame: z.number().int().nonnegative(),
  durationFrames: z.number().int().positive(),
  tts: localizedTextSchema,
  sfx: z.string().optional(),
});

export const hookSceneSchema = baseSceneSchema.extend({
  type: z.literal("hook"),
  text: z.string(),
  textAnimation: textAnimationSchema,
  lottie: z.string().optional(),
  lottiePosition: z.enum(["center", "top", "bottom"]).optional(),
  cameraEffect: z.string().optional(),
});

export const traitSceneSchema = baseSceneSchema.extend({
  type: z.literal("trait"),
  number: z.number().int().positive(),
  title: z.string(),
  titleAnimation: textAnimationSchema,
  icon: z.string(),
  iconAnimation: z.string().optional(),
  bgEffect: z.string().optional(),
  highlightWord: z.string().optional(),
});

export const emotionalSceneSchema = baseSceneSchema.extend({
  type: z.literal("emotional"),
  number: z.number().int().positive(),
  title: z.string(),
  titleAnimation: textAnimationSchema,
  highlightWord: z.string().optional(),
  icon: z.string(),
  iconAnimation: z.string().optional(),
  bgEffect: z.string().optional(),
  moodShift: z.string().optional(),
});

export const redemptionSceneSchema = baseSceneSchema.extend({
  type: z.literal("redemption"),
  number: z.number().int().positive(),
  title: z.string(),
  titleAnimation: textAnimationSchema,
  icon: z.string(),
  iconAnimation: z.string().optional(),
  bgEffect: z.string().optional(),
  moodShift: z.string().optional(),
});

export const ctaSceneSchema = baseSceneSchema.extend({
  type: z.literal("cta"),
  question: z.string(),
  questionAnimation: textAnimationSchema,
  gaugeLabel: z.string(),
  gaugeRange: z.tuple([z.number(), z.number()]),
  ctaUrl: z.string(),
  ctaAnimation: textAnimationSchema,
  lottie: z.string().optional(),
});

export const sceneSchema = z.discriminatedUnion("type", [
  hookSceneSchema,
  traitSceneSchema,
  emotionalSceneSchema,
  redemptionSceneSchema,
  ctaSceneSchema,
]);

export const sajuShortPropsSchema = z.object({
  id: z.string(),
  title: localizedTextSchema,
  theme: themeSchema,
  totalDurationFrames: z.number().int().positive().default(DEFAULT_VIDEO_CONFIG.durationInFrames),
  fps: z.number().int().positive().default(DEFAULT_VIDEO_CONFIG.fps),
  width: z.number().int().positive().default(DEFAULT_VIDEO_CONFIG.width),
  height: z.number().int().positive().default(DEFAULT_VIDEO_CONFIG.height),
  scenes: z.array(sceneSchema).min(1),
  hashtags: z.record(z.string(), z.array(z.string())).default({}),
});

export type Theme = z.infer<typeof themeSchema>;
export type HookSceneProps = z.infer<typeof hookSceneSchema>;
export type TraitSceneProps = z.infer<typeof traitSceneSchema>;
export type EmotionalSceneProps = z.infer<typeof emotionalSceneSchema>;
export type RedemptionSceneProps = z.infer<typeof redemptionSceneSchema>;
export type CtaSceneProps = z.infer<typeof ctaSceneSchema>;
export type Scene = z.infer<typeof sceneSchema>;
export type SajuShortProps = z.infer<typeof sajuShortPropsSchema>;

export const parseSajuShortProps = (input: unknown): SajuShortProps => {
  return sajuShortPropsSchema.parse(input);
};

export const getNarrationText = (
  scene: Pick<Scene, "tts">,
  lang: string,
): string => {
  return scene.tts[lang] ?? scene.tts.ko ?? Object.values(scene.tts)[0] ?? "";
};
