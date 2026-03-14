import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Dict, List

try:
    import requests
except ImportError:  # pragma: no cover - optional dependency
    requests = None

try:
    import edge_tts
except ImportError:  # pragma: no cover - optional dependency
    edge_tts = None


EDGE_VOICES: Dict[str, str] = {
    "ko": "ko-KR-SunHiNeural",
    "en": "en-US-AvaMultilingualNeural",
    "ja": "ja-JP-NanamiNeural",
    "hi": "hi-IN-SwaraNeural",
    "th": "th-TH-PremwadeeNeural",
    "vi": "vi-VN-HoaiMyNeural",
    "id": "id-ID-GadisNeural",
}

KOKORO_SUPPORTED = {"ko", "en", "ja", "hi"}


def load_props(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def build_script(props: dict, lang: str) -> str:
    lines: List[str] = []
    for scene in props.get("scenes", []):
      tts = scene.get("tts", {})
      text = tts.get(lang) or tts.get("ko") or next(iter(tts.values()), "")
      if text:
          lines.append(text.strip())
    return "\n\n".join(lines)


def infer_output_path(props: dict, lang: str, explicit_path: str | None) -> Path:
    if explicit_path:
        return Path(explicit_path)
    return Path("output") / "audio" / f"{props['id']}_{lang}.mp3"


def try_kokoro(text: str, output_path: Path, lang: str) -> bool:
    base_url = os.environ.get("KOKORO_URL")
    if not base_url or lang not in KOKORO_SUPPORTED or requests is None:
        return False

    voice = (
        os.environ.get(f"KOKORO_VOICE_{lang.upper()}")
        or os.environ.get("KOKORO_VOICE")
        or "af_heart"
    )
    payload = {
        "model": os.environ.get("KOKORO_MODEL", "kokoro"),
        "input": text,
        "voice": voice,
        "response_format": "mp3",
    }

    candidate_paths = [
        base_url.rstrip("/"),
        f"{base_url.rstrip('/')}/v1/audio/speech",
        f"{base_url.rstrip('/')}/audio/speech",
    ]

    for endpoint in candidate_paths:
        try:
            response = requests.post(endpoint, json=payload, timeout=300)
            response.raise_for_status()
        except Exception:
            continue

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(response.content)
        return True

    return False


async def edge_tts_render(text: str, output_path: Path, lang: str) -> None:
    if edge_tts is None:
        raise RuntimeError(
            "edge-tts is not installed. Run `pip install edge-tts requests` or set KOKORO_URL."
        )

    voice = os.environ.get(f"EDGE_TTS_VOICE_{lang.upper()}") or EDGE_VOICES.get(
        lang, EDGE_VOICES["en"]
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text=text, voice=voice)
    await communicate.save(str(output_path))


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: python scripts/tts.py <props.json> <lang> [output.mp3]")
        return 1

    props_path = Path(sys.argv[1])
    lang = sys.argv[2]
    explicit_output = sys.argv[3] if len(sys.argv) > 3 else None

    props = load_props(props_path)
    script = build_script(props, lang)
    if not script:
        raise RuntimeError(f"No narration text found for language: {lang}")

    output_path = infer_output_path(props, lang, explicit_output)

    if try_kokoro(script, output_path, lang):
        print(f"Kokoro narration saved to {output_path}")
        return 0

    asyncio.run(edge_tts_render(script, output_path, lang))
    print(f"edge-tts narration saved to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
