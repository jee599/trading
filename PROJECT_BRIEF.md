# Project Brief

## Project Name

- `saju-shorts`

## Goal

- Build a zero-cost, CPU-friendly automation workspace that turns one storyboard JSON file into a vertical short-form MP4 using Remotion, optional local or free TTS, subtitle generation, and FFmpeg finishing.

## Success Criteria

- A creator can render a 9:16 silent base video from `shorts/props/*.json` with one `remotion render` command.
- The workspace ships a sample storyboard JSON and a default `SajuShort` composition that renders without paid assets or GPU-specific requirements.
- The finalize step can generate narration audio, create subtitle timing data, and mux video plus audio plus subtitles into a final MP4 with one script entry point.
- The implementation remains data-driven so additional saju topics can be created by adding new JSON files instead of editing React code.
- The project stays practical on a Windows-friendly local setup with Node.js, Python, and FFmpeg.

## Scope

- A top-level `shorts/` workspace using Remotion, TypeScript, and React.
- Scene-based motion-graphics rendering for hook, trait, emotional, redemption, and CTA beats.
- Shared motion components for animated text, icon bursts, particles, transitions, countdowns, and gauges.
- JSON schema and TypeScript validation helpers for storyboard props.
- Python scripts for TTS selection and subtitle timing generation.
- A shell-based finalization script and a batch rendering script.
- Placeholder public assets and sample props sufficient for local rendering.

## Out of Scope

- Automatic social upload or scheduling integrations.
- Paid APIs, GPU-only rendering, or cloud infrastructure.
- A CMS, web dashboard, or hosted backend.
- Advanced AI-generated art pipelines beyond local JSON-driven video assembly.

## Constraints

- Total software cost should stay at zero using free or open-source tooling only.
- The default path should work on CPU rendering without GPU acceleration.
- The rendered format targets 1080x1920 vertical shorts at 30 FPS by default.
- The pipeline must support multilingual copy inside the same JSON model.
- The repository should stay handoff-friendly for sequential agents working on `master`.

## Key Decisions

- Keep the render layer declarative through a single storyboard JSON contract per short.
- Use Remotion for layout, motion, and MP4 generation instead of game-engine or canvas tooling.
- Keep scene styling thematic and reusable through centralized theme tokens and font mapping.
- Prefer optional assets and graceful fallbacks so the sample render works even before custom fonts, Lottie files, or BGM are added.
- Treat TTS, subtitles, and muxing as separate post-render steps so each layer can be swapped independently.

## Open Questions

- Which exact free TTS voices should be the defaults per language once the user validates quality preferences.
- Whether the batch workflow should prioritize Bash compatibility only or also ship a first-class PowerShell wrapper.
- How strict the JSON schema should become for future automation-generated props validation.
