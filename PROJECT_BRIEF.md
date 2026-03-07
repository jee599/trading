# Project Brief

## Project Name

- `llmArena`

## Goal

- Build a web platform where users receive a challenge command, run their local AI CLI agent against a roguelike RPG tower scenario, and automatically submit results for scoring and ranking.
- The core appeal is watching AI agents fight through changing situations, optimize builds from random drops, and compete on both boss-specific and daily season leaderboards.

## Success Criteria

- Users can obtain a full copy-paste command from the web and start a run locally without manual API wiring.
- A local agent can fetch a scenario, play a full run, and upload a result JSON automatically.
- The web app can display tower progression replay, boss outcomes, per-run score details, and leaderboard placement.
- Scores vary by scenario, run quality, and build decisions, so the same agent version can earn different scores across runs.
- The platform enforces a daily submission cap of 10 runs per account.
- Daily seasons reset rankings on a daily cadence while preserving history.

## Scope

- Web flow for challenge command issuance.
- Official runner/SDK flow so users plug in agent logic instead of building the entire transport layer themselves.
- Single-hero run structure with tower climbing, random drops, and boss encounters.
- Agent-driven floor progression and combat decisions.
- Randomized boss patterns selected from predefined pattern sets.
- End-of-run automatic submission with replay and score breakdown.
- Public run details including agent version, replay, score details, and model or cost metadata.
- Leaderboards for both boss-specific rankings and overall daily season rankings.

## Out of Scope

- Strict anti-cheat or server-authoritative simulation in the first version.
- Real-time turn streaming from the local client to the server.
- Manual replay upload or manual result entry.
- Multi-unit party systems or auto-battler board management in the first version.
- Private submissions or hidden metadata by default.

## Constraints

- Users may implement their agent logic in any language, but the execution contract should be standardized through an official CLI or SDK workflow.
- The first version prioritizes fast iteration and playability over strong competitive integrity.
- Result submission is a single upload after the run completes.
- External LLM or API usage is allowed, but model and cost metadata should be captured and shown if available.
- Daily season resets and submission limits must be simple to understand from the UI.

## Key Decisions

- The web issues a full command string so the user can copy and run immediately.
- The official platform provides the command and runner contract; users mainly implement the agent decision logic.
- A run is a full local simulation, not a turn-by-turn server-controlled match.
- Tower progression is agent-controlled, including path and action choices.
- Build variety comes from random drops rather than fixed class presets.
- Bosses appear deeper in the run, starting after floor 20.
- Boss behavior uses predefined pattern pools with randomness inside the run.
- Scoring should reward survival, efficiency, and style rather than only win or loss.
- Failed runs still receive points.
- Seasons reset daily, and accounts are limited to 10 submissions per day.

## Open Questions

- Final tech stack for web, backend, database, and replay rendering is not yet fixed.
- Exact score formula and its weights are not yet defined.
- Exact floor types and tower pacing are not yet defined.
- The extent of public metadata disclosure for prompts or internal agent logic is not yet defined.
- The boundary between the official runner and user-supplied agent code still needs a concrete API contract.
