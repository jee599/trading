import type {Theme} from "../types";

export type ThemeTokens = Theme & {
  panel: string;
  panelBorder: string;
  mutedText: string;
  glow: string;
  overlay: string;
};

export const withThemeDefaults = (theme: Theme): ThemeTokens => {
  return {
    ...theme,
    panel: "rgba(10, 10, 16, 0.46)",
    panelBorder: "rgba(255, 255, 255, 0.16)",
    mutedText: "rgba(255, 255, 255, 0.78)",
    glow: `${theme.accent}66`,
    overlay: "rgba(255, 255, 255, 0.04)",
  };
};
