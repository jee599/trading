# saju-shorts

JSON 하나를 받아서 Remotion으로 9:16 쇼츠를 렌더링하고, TTS와 자막을 붙여 최종 MP4를 만드는 워크스페이스입니다.

## Quick Start

```bash
cd shorts
npm install
npx remotion render SajuShort output/fire_many_ko.mp4 --props=props/fire_many.json
./finalize.sh output/fire_many_ko.mp4 props/fire_many.json ko
```

```powershell
Set-Location shorts
npx remotion render SajuShort output/fire_many_ko.mp4 --props=props/fire_many.json
.\finalize.ps1 output/fire_many_ko.mp4 props/fire_many.json ko
```

## Notes

- 샘플 영상은 `props/fire_many.json`을 기준으로 렌더링됩니다.
- `finalize.sh`는 `python`, `ffmpeg`, 그리고 선택적으로 `edge-tts`, `requests`, `whisper-timestamped`를 사용합니다.
- Windows PowerShell 환경에서는 `finalize.ps1`과 `scripts/batch.ps1`을 사용할 수 있습니다.
- `KOKORO_URL` 환경 변수를 설정하면 ko/en/ja/hi 언어에서 Kokoro HTTP 엔드포인트를 먼저 시도합니다.
