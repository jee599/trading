const DISPLAY_FONTS: Record<string, string> = {
  ko: "\"Bebas Neue\", \"Noto Sans KR\", \"Oswald\", sans-serif",
  en: "\"Bebas Neue\", \"Montserrat\", sans-serif",
  ja: "\"Bebas Neue\", \"Noto Sans JP\", sans-serif",
  default: "\"Bebas Neue\", \"Montserrat\", sans-serif",
};

const BODY_FONTS: Record<string, string> = {
  ko: "\"SUIT\", \"Noto Sans KR\", \"Pretendard\", sans-serif",
  en: "\"Space Grotesk\", \"Montserrat\", sans-serif",
  ja: "\"Zen Kaku Gothic New\", \"Noto Sans JP\", sans-serif",
  default: "\"Space Grotesk\", \"Noto Sans KR\", sans-serif",
};

export const getDisplayFont = (lang = "ko") => {
  return DISPLAY_FONTS[lang] ?? DISPLAY_FONTS.default;
};

export const getBodyFont = (lang = "ko") => {
  return BODY_FONTS[lang] ?? BODY_FONTS.default;
};
