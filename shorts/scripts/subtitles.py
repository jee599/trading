import json
import os
import sys
import textwrap
from pathlib import Path
from typing import Iterable, List, Tuple

try:
    import whisper_timestamped as whisper
except ImportError:  # pragma: no cover - optional dependency
    whisper = None


DEFAULT_STYLE = """[Script Info]
ScriptType: v4.00+
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Noto Sans KR,56,&H00FFFFFF,&H000000FF,&H00331707,&H78000000,-1,0,0,0,100,100,0,0,1,3,0,2,80,80,120,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def load_props(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def infer_output_path(props: dict, lang: str, explicit_path: str | None) -> Path:
    if explicit_path:
        return Path(explicit_path)
    return Path("output") / "subs" / f"{props['id']}_{lang}.ass"


def to_ass_time(seconds: float) -> str:
    total_centiseconds = int(round(seconds * 100))
    hours = total_centiseconds // 360000
    minutes = (total_centiseconds % 360000) // 6000
    secs = (total_centiseconds % 6000) // 100
    centiseconds = total_centiseconds % 100
    return f"{hours}:{minutes:02d}:{secs:02d}.{centiseconds:02d}"


def pick_text(scene: dict, lang: str) -> str:
    tts = scene.get("tts", {})
    return tts.get(lang) or tts.get("ko") or next(iter(tts.values()), "")


def wrap_dialogue(text: str, width: int = 18) -> str:
    return "\\N".join(textwrap.wrap(text.strip(), width=width, break_long_words=False))


def build_json_timeline(props: dict, lang: str) -> List[Tuple[float, float, str]]:
    fps = props.get("fps", 30)
    items: List[Tuple[float, float, str]] = []
    for scene in props.get("scenes", []):
        text = pick_text(scene, lang)
        if not text:
            continue
        start = scene["startFrame"] / fps
        end = (scene["startFrame"] + scene["durationFrames"]) / fps
        items.append((start, end, wrap_dialogue(text)))
    return items


def build_whisper_timeline(audio_path: Path) -> Iterable[Tuple[float, float, str]]:
    if whisper is None:
        raise RuntimeError(
            "whisper-timestamped is not installed. Either install it or use JSON timing."
        )

    model_name = os.environ.get("WHISPER_MODEL", "tiny")
    model = whisper.load_model(model_name, device="cpu")
    result = whisper.transcribe(model, str(audio_path), language=None)
    for segment in result.get("segments", []):
        text = segment.get("text", "").strip()
        if text:
            yield (float(segment["start"]), float(segment["end"]), wrap_dialogue(text))


def write_ass(events: Iterable[Tuple[float, float, str]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        handle.write(DEFAULT_STYLE)
        for start, end, text in events:
            handle.write(
                f"Dialogue: 0,{to_ass_time(start)},{to_ass_time(end)},Default,,0,0,0,,{text}\n"
            )


def main() -> int:
    if len(sys.argv) < 4:
        print("Usage: python scripts/subtitles.py <audio.mp3> <props.json> <lang> [output.ass]")
        return 1

    audio_path = Path(sys.argv[1])
    props_path = Path(sys.argv[2])
    lang = sys.argv[3]
    explicit_output = sys.argv[4] if len(sys.argv) > 4 else None

    props = load_props(props_path)
    output_path = infer_output_path(props, lang, explicit_output)

    mode = os.environ.get("SUBTITLE_ALIGNMENT", "json").lower()
    if mode == "whisper":
        events = list(build_whisper_timeline(audio_path))
    else:
        events = build_json_timeline(props, lang)

    write_ass(events, output_path)
    print(f"Subtitles saved to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
