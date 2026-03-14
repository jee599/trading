# 사주 쇼츠 자동화 파이프라인 — Remotion 모션그래픽

> $0 추가비용. GPU 불필요. JSON 하나 → 쇼츠 MP4 자동 출력.

---

## 원커맨드

```bash
# JSON 생성 (Claude Code)
claude "사주에 불이 많은 사람 특징, 스토리보드 JSON 만들어서 props/ 에 저장해줘"

# 쇼츠 렌더링
npx remotion render SajuShort output/fire_many_ko.mp4 --props=props/fire_many.json

# TTS + 최종 합성
./finalize.sh output/fire_many_ko.mp4 props/fire_many.json ko
```

---

## 비용

```
Claude Code        → 구독 내 포함     $0
Remotion           → 개인용 무료       $0  (GPU 불필요, CPU 렌더링)
Kokoro TTS         → Apache 2.0       $0
edge-tts           → 무료             $0
whisper-timestamped → MIT              $0
FFmpeg             → LGPL             $0
Node.js            → 무료             $0
────────────────────────────────────────
합계                                   $0
```

---

## 파이프라인 흐름

```
Claude Code
  │
  ├─ 1) 스토리보드 JSON 생성 → props/fire_many.json
  │
  ├─ 2) Remotion 렌더링 (CPU)
  │     JSON → React 컴포넌트 → MP4 (무음, 9:16)
  │
  ├─ 3) TTS 음성 생성
  │     Kokoro (ko/en/ja/hi) / edge-tts (th/vi/id)
  │
  ├─ 4) 자막 생성
  │     whisper-timestamped → ASS
  │
  └─ 5) 최종 합성
        FFmpeg (영상 + 음성 + 자막 + BGM)
        │
        ▼
  output/*.mp4 → 수동 업로드
```

---

## 디렉토리 구조

```
saju-shorts/
├── package.json
├── remotion.config.ts
├── tsconfig.json
├── finalize.sh              # TTS + 자막 + 합성 스크립트
│
├── src/
│   ├── Root.tsx              # Remotion 루트 (Composition 등록)
│   ├── SajuShort.tsx         # 메인 쇼츠 컴포넌트
│   │
│   ├── scenes/               # 장면 타입별 컴포넌트
│   │   ├── HookScene.tsx     # 오프닝 후킹 장면
│   │   ├── TraitScene.tsx    # 특징 나열 장면
│   │   ├── EmotionalScene.tsx # 감성 반전 장면
│   │   ├── RedemptionScene.tsx # 반전/감동 장면
│   │   └── CtaScene.tsx      # 마무리 CTA 장면
│   │
│   ├── components/           # 재사용 모션 컴포넌트
│   │   ├── AnimatedText.tsx  # 텍스트 애니메이션 (char-by-char, slide, pop)
│   │   ├── IconBurst.tsx     # 아이콘 터지는 효과
│   │   ├── FireParticle.tsx  # 불꽃 파티클
│   │   ├── ShakeEffect.tsx   # 화면 흔들림
│   │   ├── GaugeBar.tsx      # 게이지 바 (CTA용)
│   │   ├── CounterAnim.tsx   # 숫자 카운터
│   │   ├── SlideTransition.tsx # 장면 전환
│   │   └── Countdown321.tsx  # 3-2-1 카운트다운
│   │
│   ├── styles/               # 테마별 스타일
│   │   ├── themes.ts         # 오행별 컬러/그라데이션
│   │   └── fonts.ts          # 다국어 폰트 설정
│   │
│   └── types.ts              # JSON 스키마 타입 정의
│
├── props/                    # Claude Code가 생성하는 JSON들
│   ├── fire_many.json
│   ├── water_few.json
│   ├── dohwa.json
│   └── ...
│
├── public/
│   ├── fonts/                # Noto Sans 다국어 폰트
│   ├── lottie/               # LottieFiles 무료 애니메이션
│   │   ├── fire.json         # 불꽃 Lottie
│   │   ├── hearts.json       # 하트 날아다니는 Lottie
│   │   ├── sparkle.json      # 반짝이 Lottie
│   │   ├── confetti.json     # 컨페티 Lottie
│   │   └── water_drop.json   # 물방울 Lottie
│   ├── icons/                # SVG 아이콘 (simple, flat)
│   └── bgm/                  # royalty-free 배경음
│
├── scripts/
│   ├── tts.py                # TTS (Kokoro + edge-tts)
│   ├── subtitles.py          # 자막 생성
│   └── batch.sh              # 배치 렌더링
│
└── output/                   # 최종 MP4
```

---

## JSON 스키마 (Claude Code가 생성)

```json
{
  "id": "fire_many_001",
  "title": {
    "ko": "사주에 불이 많은 사람 특징",
    "en": "People with too much Fire",
    "ja": "四柱に火が多い人の特徴"
  },
  "theme": {
    "bg": ["#1a0808", "#6B1515", "#B8372A"],
    "accent": "#FFD700",
    "textColor": "#FFFFFF"
  },
  "totalDurationFrames": 660,
  "fps": 30,
  "width": 1080,
  "height": 1920,

  "scenes": [
    {
      "type": "hook",
      "startFrame": 0,
      "durationFrames": 90,
      "tts": {
        "ko": "사주에 불이 많은 사람 특징",
        "en": "Traits of people with too much fire"
      },
      "text": "사주에 불이 많은 사람 특징",
      "textAnimation": "charByCharFire",
      "lottie": "fire",
      "lottiePosition": "center",
      "cameraEffect": "zoomOut",
      "sfx": "whoosh"
    },
    {
      "type": "trait",
      "startFrame": 90,
      "durationFrames": 120,
      "tts": {
        "ko": "한번 빡치면 자기도 못 멈춤. 회의 중에 반대 의견 나오면 눈에서 불이 남.",
        "en": "Once they snap, even they can't stop."
      },
      "number": 1,
      "title": "한번 빡치면 못 멈춤",
      "titleAnimation": "slideInLeft",
      "icon": "fire_eyes",
      "iconAnimation": "popBounce",
      "bgEffect": "screenShake",
      "sfx": "slam"
    },
    {
      "type": "trait",
      "startFrame": 210,
      "durationFrames": 120,
      "tts": {
        "ko": "열정은 미쳤는데 3일을 못 감. 월요일에 이번엔 진짜! 수요일에 이미 새거 시작.",
        "en": "Insane passion but can't last 3 days."
      },
      "number": 2,
      "title": "열정 MAX... 3일 한계",
      "titleAnimation": "popIn",
      "icon": "calendar_countdown",
      "iconAnimation": "countdown321",
      "bgEffect": "colorPulse",
      "sfx": "deflate"
    },
    {
      "type": "emotional",
      "startFrame": 330,
      "durationFrames": 120,
      "tts": {
        "ko": "주변에 사람이 항상 많은데 다 얕은 관계. 불이 뜨거우니까 가까이 가면 데임.",
        "en": "Always surrounded, but all shallow."
      },
      "number": 3,
      "title": "사람은 많은데... 다 얕은 관계",
      "titleAnimation": "fadeInSlow",
      "highlightWord": "얕은 관계",
      "icon": "campfire_alone",
      "iconAnimation": "fadeInDim",
      "bgEffect": "darken",
      "moodShift": "melancholy",
      "sfx": "silence"
    },
    {
      "type": "redemption",
      "startFrame": 450,
      "durationFrames": 120,
      "tts": {
        "ko": "근데 진짜 위기 오면 제일 먼저 뛰어듦. 불은 어둠 속에서 제일 빛나니까.",
        "en": "But in crisis, they jump in first. Fire shines in the dark."
      },
      "number": 4,
      "title": "위기엔 제일 먼저 뛰어듦",
      "titleAnimation": "lightUpCharByChar",
      "icon": "hero_flame",
      "iconAnimation": "growIlluminate",
      "bgEffect": "darkToLight",
      "moodShift": "epic",
      "sfx": "epicGong"
    },
    {
      "type": "cta",
      "startFrame": 570,
      "durationFrames": 90,
      "tts": {
        "ko": "나의 사주에 불이 몇 개일까?",
        "en": "How much fire is in YOUR chart?"
      },
      "question": "나의 사주에 불이 몇 개?",
      "questionAnimation": "bounceIn",
      "gaugeLabel": "불",
      "gaugeRange": [0, 5],
      "ctaUrl": "fortunlab.store",
      "ctaAnimation": "popInBounce",
      "lottie": "fire",
      "sfx": "chime"
    }
  ],

  "hashtags": {
    "ko": ["#사주", "#오행", "#불많은사람", "#사주특징", "#MBTI사주"],
    "en": ["#astrology", "#fire", "#personality", "#fiveelements"]
  }
}
```

---

## Remotion 핵심 코드

### `src/Root.tsx`

```tsx
import { Composition } from "remotion";
import { SajuShort } from "./SajuShort";
import { SajuShortProps } from "./types";

export const RemotionRoot = () => {
  return (
    <Composition<SajuShortProps>
      id="SajuShort"
      component={SajuShort}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={660}
      defaultProps={{} as SajuShortProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.totalDurationFrames || 660,
        fps: props.fps || 30,
        width: props.width || 1080,
        height: props.height || 1920,
      })}
    />
  );
};
```

### `src/SajuShort.tsx`

```tsx
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { HookScene } from "./scenes/HookScene";
import { TraitScene } from "./scenes/TraitScene";
import { EmotionalScene } from "./scenes/EmotionalScene";
import { RedemptionScene } from "./scenes/RedemptionScene";
import { CtaScene } from "./scenes/CtaScene";
import { SajuShortProps } from "./types";

export const SajuShort: React.FC<SajuShortProps> = (props) => {
  const { scenes, theme } = props;

  const bgGradient = `linear-gradient(180deg, ${theme.bg.join(", ")})`;

  return (
    <AbsoluteFill style={{ background: bgGradient }}>
      {scenes.map((scene, i) => {
        const Component = {
          hook: HookScene,
          trait: TraitScene,
          emotional: EmotionalScene,
          redemption: RedemptionScene,
          cta: CtaScene,
        }[scene.type];

        return (
          <Sequence
            key={i}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
          >
            <Component {...scene} theme={theme} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
```

### `src/scenes/TraitScene.tsx` (예시)

```tsx
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { IconBurst } from "../components/IconBurst";
import { ShakeEffect } from "../components/ShakeEffect";

export const TraitScene: React.FC<TraitSceneProps> = ({
  number,
  title,
  titleAnimation,
  icon,
  iconAnimation,
  bgEffect,
  theme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 숫자 등장
  const numberScale = spring({ frame, fps, config: { damping: 80 } });

  // 화면 흔들림 (bgEffect === "screenShake")
  const shakeX = bgEffect === "screenShake"
    ? interpolate(frame, [30, 35, 40, 45, 50], [0, -8, 6, -4, 0])
    : 0;

  return (
    <AbsoluteFill style={{ transform: `translateX(${shakeX}px)` }}>
      {/* 특징 번호 */}
      <div style={{
        position: "absolute",
        top: "12%",
        left: "50%",
        transform: `translateX(-50%) scale(${numberScale})`,
        fontSize: 120,
        fontWeight: 900,
        color: theme.accent,
        opacity: 0.15,
      }}>
        {number}
      </div>

      {/* 아이콘 */}
      <div style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: "translateX(-50%)",
      }}>
        <IconBurst icon={icon} animation={iconAnimation} frame={frame} fps={fps} />
      </div>

      {/* 타이틀 텍스트 */}
      <div style={{
        position: "absolute",
        top: "55%",
        width: "100%",
        padding: "0 60px",
      }}>
        <AnimatedText
          text={title}
          animation={titleAnimation}
          frame={frame}
          fps={fps}
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: theme.textColor,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
```

### `src/components/AnimatedText.tsx` (예시)

```tsx
import { interpolate, spring } from "remotion";

type Animation = "slideInLeft" | "popIn" | "charByCharFire" | "fadeInSlow" | "lightUpCharByChar" | "bounceIn";

export const AnimatedText: React.FC<{
  text: string;
  animation: Animation;
  frame: number;
  fps: number;
  style?: React.CSSProperties;
  highlightWord?: string;
  highlightColor?: string;
}> = ({ text, animation, frame, fps, style, highlightWord, highlightColor }) => {

  if (animation === "charByCharFire") {
    return (
      <div style={style}>
        {text.split("").map((char, i) => {
          const delay = i * 2;
          const opacity = interpolate(frame - delay, [0, 5], [0, 1], { extrapolateRight: "clamp" });
          const scale = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 80 } });
          return (
            <span key={i} style={{
              opacity,
              display: "inline-block",
              transform: `scale(${scale})`,
              textShadow: opacity > 0.5 ? "0 0 20px #FF6B35" : "none",
            }}>
              {char === " " ? "\u00A0" : char}
            </span>
          );
        })}
      </div>
    );
  }

  if (animation === "slideInLeft") {
    const x = interpolate(frame, [0, 15], [-400, 0], { extrapolateRight: "clamp" });
    const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
    return <div style={{ ...style, transform: `translateX(${x}px)`, opacity }}>{renderHighlight(text, highlightWord, highlightColor)}</div>;
  }

  if (animation === "popIn") {
    const scale = spring({ frame, fps, config: { damping: 60 } });
    return <div style={{ ...style, transform: `scale(${scale})` }}>{renderHighlight(text, highlightWord, highlightColor)}</div>;
  }

  if (animation === "fadeInSlow") {
    const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
    return <div style={{ ...style, opacity }}>{renderHighlight(text, highlightWord, highlightColor)}</div>;
  }

  return <div style={style}>{text}</div>;
};

function renderHighlight(text: string, word?: string, color?: string) {
  if (!word) return text;
  const parts = text.split(word);
  return <>{parts[0]}<span style={{ color: color || "#FFD700" }}>{word}</span>{parts[1]}</>;
}
```

---

## TTS + 합성 스크립트

### `finalize.sh`

```bash
#!/bin/bash
set -e

VIDEO=$1        # output/fire_many_ko.mp4 (무음 영상)
PROPS=$2        # props/fire_many.json
LANG=${3:-ko}

ID=$(jq -r '.id' "$PROPS")
AUDIO="output/audio/${ID}_${LANG}.mp3"
SUBS="output/subs/${ID}_${LANG}.ass"
FINAL="output/final/${ID}_${LANG}.mp4"

mkdir -p output/audio output/subs output/final

echo "[1/3] TTS 생성"
python scripts/tts.py "$PROPS" "$LANG"

echo "[2/3] 자막 생성"
python scripts/subtitles.py "$AUDIO" "$LANG"

echo "[3/3] 최종 합성"
ffmpeg -y \
  -i "$VIDEO" \
  -i "$AUDIO" \
  -filter_complex \
    "[1:a]volume=1.0[voice];[voice]apad[voicepad]" \
  -map 0:v -map "[voicepad]" \
  -vf "ass=$SUBS" \
  -c:v libx264 -c:a aac -shortest \
  "$FINAL"

echo "✓ 완료 → $FINAL"
```

---

## 배치 실행

### `scripts/batch.sh`

```bash
#!/bin/bash
# 전체 콘텐츠 배치 렌더링

LANGS="ko en ja"

for props_file in props/*.json; do
  id=$(jq -r '.id' "$props_file")
  echo "━━━ $id ━━━"

  # Remotion 렌더링 (무음)
  npx remotion render SajuShort "output/${id}.mp4" \
    --props="$props_file"

  # 언어별 TTS + 합성
  for lang in $LANGS; do
    ./finalize.sh "output/${id}.mp4" "$props_file" "$lang"
  done
done

echo "━━━ 전체 완료 ━━━"
echo "output/final/ 확인"
```

```bash
chmod +x scripts/batch.sh finalize.sh
./scripts/batch.sh
```

---

## 콘텐츠 카테고리 (전체)

```yaml
오행_시리즈: # 10개
  - fire_many:  "불이 많은 사람 특징"
  - fire_few:   "불이 없는 사람 특징"
  - water_many: "물이 많은 사람 특징"
  - water_few:  "물이 없는 사람 특징"
  - wood_many:  "나무가 많은 사람 특징"
  - wood_few:   "나무가 없는 사람 특징"
  - metal_many: "금이 많은 사람 특징"
  - metal_few:  "금이 없는 사람 특징"
  - earth_many: "흙이 많은 사람 특징"
  - earth_few:  "흙이 없는 사람 특징"

신살_시리즈: # 7개
  - dohwa:      "도화살 있는 사람 특징"
  - yeokma:     "역마살 있는 사람 특징"
  - gwaegang:   "괴강살 있는 사람 특징"
  - hwagae:     "화개살 있는 사람 특징"
  - gongmang:   "공망 있는 사람 특징"
  - wongjin:    "원진살 있는 사람 특징"
  - yukhaeng:   "육해살 있는 사람 특징"

일간_시리즈: # 10개
  - gap:   "갑목 일간 특징"
  - eul:   "을목 일간 특징"
  - byung: "병화 일간 특징"
  - jung:  "정화 일간 특징"
  - mu:    "무토 일간 특징"
  - gi:    "기토 일간 특징"
  - gyung: "경금 일간 특징"
  - shin:  "신금 일간 특징"
  - im:    "임수 일간 특징"
  - gye:   "계수 일간 특징"

궁합_시리즈: # 5개+
  - fire_water:  "불 vs 물"
  - wood_metal:  "나무 vs 금"
  - ...

# 총 32+ 콘텐츠 × 7개 언어 = 224+ 쇼츠
```

---

## 셋업 (1회)

```bash
# Node.js (18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# FFmpeg
sudo apt install -y ffmpeg

# 프로젝트 초기화
npx create-video@latest saju-shorts
cd saju-shorts

# Python (TTS + 자막)
pip install edge-tts whisper-timestamped requests

# Kokoro TTS (Docker, 선택)
docker run -d -p 8880:8880 --name kokoro \
  ghcr.io/remsky/kokoro-fastapi-cpu:latest

# 폰트 (public/fonts/ 에 배치)
# → Google Fonts: NotoSansKR, NotoSansJP, Montserrat 등

# Lottie 에셋 (public/lottie/ 에 배치)
# → lottiefiles.com 에서 무료 다운로드
#   fire, hearts, sparkle, confetti, water_drop 등

# 테스트
npx remotion studio  # 브라우저에서 미리보기
npx remotion render SajuShort test.mp4 --props=props/fire_many.json
```

---

## 도구 요약

| 단계 | 도구 | 비용 | GPU |
|------|------|------|-----|
| 스토리보드 JSON | Claude Code | $0 | 불필요 |
| 모션그래픽 렌더링 | Remotion (React → MP4) | $0 | **불필요** |
| TTS (ko/en/ja/hi) | Kokoro TTS (Docker) | $0 | 불필요(CPU) |
| TTS (th/vi/id) | edge-tts | $0 | 불필요 |
| 자막 | whisper-timestamped | $0 | 불필요(CPU) |
| 합성 | FFmpeg | $0 | 불필요 |
| 업로드 | 수동 | $0 | - |
| **합계** | | **$0** | **GPU 없어도 됨** |
