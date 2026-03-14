#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: ./finalize.sh <video.mp4> <props.json> [lang]"
  exit 1
fi

VIDEO="$1"
PROPS="$2"
LANG="${3:-ko}"

PYTHON_BIN="${PYTHON_BIN:-python}"
if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  PYTHON_BIN="python3"
fi

FFMPEG_BIN="${FFMPEG_BIN:-ffmpeg}"
if ! command -v "$FFMPEG_BIN" >/dev/null 2>&1; then
  FFMPEG_BIN="$(
    node -e "const value=require('ffmpeg-static'); if (value) { process.stdout.write(value); }"
  )"
fi

if [[ -z "$FFMPEG_BIN" ]]; then
  echo "ffmpeg binary not found. Install ffmpeg or add ffmpeg-static."
  exit 1
fi

ID="$(
  node -e "const fs=require('fs'); const props=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(props.id);" "$PROPS"
)"

AUDIO="output/audio/${ID}_${LANG}.mp3"
SUBS="output/subs/${ID}_${LANG}.ass"
FINAL="output/final/${ID}_${LANG}.mp4"
BGM="${BGM_PATH:-public/bgm/default.mp3}"

mkdir -p output/audio output/subs output/final

echo "[1/3] TTS 생성"
"$PYTHON_BIN" scripts/tts.py "$PROPS" "$LANG" "$AUDIO"

echo "[2/3] 자막 생성"
"$PYTHON_BIN" scripts/subtitles.py "$AUDIO" "$PROPS" "$LANG" "$SUBS"

echo "[3/3] 최종 합성"
if [[ -f "$BGM" ]]; then
  "$FFMPEG_BIN" -y \
    -i "$VIDEO" \
    -i "$AUDIO" \
    -stream_loop -1 -i "$BGM" \
    -filter_complex "[1:a]volume=1.0[voice];[2:a]volume=0.18[bgm];[voice][bgm]amix=inputs=2:duration=first[aout]" \
    -map 0:v \
    -map "[aout]" \
    -vf "ass=$SUBS" \
    -c:v libx264 \
    -pix_fmt yuv420p \
    -c:a aac \
    -shortest \
    "$FINAL"
else
  "$FFMPEG_BIN" -y \
    -i "$VIDEO" \
    -i "$AUDIO" \
    -filter_complex "[1:a]volume=1.0[aout]" \
    -map 0:v \
    -map "[aout]" \
    -vf "ass=$SUBS" \
    -c:v libx264 \
    -pix_fmt yuv420p \
    -c:a aac \
    -shortest \
    "$FINAL"
fi

echo "완료 -> $FINAL"
