# Architecture Notes

## Overview

- The repository now centers on a single content workspace at `shorts/`.
- `shorts/` turns a storyboard JSON document into a silent base MP4 with Remotion, then finishes the asset with narration, subtitles, and FFmpeg muxing.
- The architecture stays data-driven so content expansion mostly means adding new JSON files under `shorts/props`.

## Directory Structure

- `shorts/package.json`: Node workspace manifest and Remotion scripts.
- `shorts/remotion.config.ts`: Remotion bundling and render defaults.
- `shorts/tsconfig.json`: TypeScript settings for React plus Remotion.
- `shorts/finalize.sh`: Post-render orchestration for TTS, subtitles, and final muxing.
- `shorts/src/Root.tsx`: Composition registration entry point.
- `shorts/src/SajuShort.tsx`: Top-level composition that maps scene JSON to scene components.
- `shorts/src/scenes`: Scene implementations for hook, trait, emotional, redemption, and CTA beats.
- `shorts/src/components`: Shared motion primitives such as animated text, icon bursts, particles, gauges, and transitions.
- `shorts/src/styles`: Theme tokens and language-aware font helpers.
- `shorts/src/types.ts`: Storyboard schema types and default helpers.
- `shorts/props`: Storyboard JSON inputs created by a writing agent.
- `shorts/public`: Optional fonts, icons, BGM, and Lottie files with safe rendering fallbacks.
- `shorts/scripts/tts.py`: Narration generation using a local Kokoro endpoint when available and `edge-tts` as fallback.
- `shorts/scripts/subtitles.py`: Subtitle timing generation that prefers Whisper alignment when installed and falls back to deterministic segment timing.
- `shorts/scripts/batch.sh`: Batch loop across props files and configured languages.

## Runtime Flow

- A JSON file is passed to `npx remotion render SajuShort ... --props=...`.
- `Root.tsx` registers the `SajuShort` composition and derives metadata from the JSON payload.
- `SajuShort.tsx` computes the background theme and renders each scene inside a `Sequence`.
- Scene components consume typed props and delegate repeated animation patterns to shared motion components.
- `finalize.sh` reads the same JSON, asks `tts.py` for narration audio, asks `subtitles.py` for `.ass` subtitles, and runs FFmpeg to create the final MP4.

## Rendering Strategy

- Scene components avoid external paid dependencies and degrade gracefully when optional assets are missing.
- Motion is created with Remotion primitives such as `spring`, `interpolate`, `Sequence`, and frame-based transforms.
- The visual system emphasizes high-contrast typography, bold gradients, particle overlays, and icon-driven storytelling optimized for 9:16 phone viewing.

## Data Model

- The root JSON contains composition metadata, multilingual titles, a theme object, scene arrays, and hashtag bundles.
- Each scene contains its own timing window, narration text, animation choices, and optional effect fields.
- The TypeScript types define a discriminated union keyed by `type` so scene components receive strongly typed props.

## Operational Notes

- The sample implementation is Windows-hosted but keeps Bash scripts because the user requested `finalize.sh` and `batch.sh`.
- Public assets are optional at bootstrap time; missing fonts or Lottie files should not block the default render.
- If dependencies or folder structure change again, update this file and `STATUS.md` in the same task.

## Decisions Log

- 2026-03-07: Adopt a document-driven sequential workflow on `master` for GPT and Claude handoff.
- 2026-03-14: Pivot the repository from the Unity `BLEND IN` prototype to a Remotion-based saju shorts automation workspace.
- 2026-03-14: Keep the video pipeline inside a dedicated `shorts/` workspace rather than mixing it with root-level tooling files.
- 2026-03-14: Design for optional assets and CPU-safe defaults so the first render works with minimal local setup.
