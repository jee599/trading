# Architecture Notes

## Overview

- The platform should be split into three major parts: a web app for challenge issuance and replay viewing, a backend for scenario distribution and submission intake, and an official runner contract that bridges the local user agent with the platform.
- In the first version, run simulation is local and authoritative enough for MVP use, while the server focuses on orchestration, storage, ranking, and replay presentation.

## Directory Structure

- `apps/web`: user-facing website for auth, challenge issuance, leaderboards, replay viewing, and run history.
- `apps/api`: backend for issuing challenge commands, serving run scenarios, receiving submissions, and computing rankings.
- `packages/runner`: official runner or SDK contract used by local user agents.
- `packages/shared`: shared types for scenario JSON, replay events, scoring payloads, and leaderboard records.
- `docs` or root markdown files: product, workflow, and architecture documents.

## Core Modules

- Challenge Issuer: creates a run code or command and binds it to a scenario request.
- Scenario Service: returns tower state, floor generation config, boss pattern pools, and submission metadata.
- Local Runner Contract: fetches the scenario, executes the user agent loop, validates shape, and uploads results.
- Submission Service: stores the run result, replay payload, metadata, and score details.
- Ranking Engine: computes boss-specific and daily season leaderboards.
- Replay Renderer: turns stored floor and combat events into a web-viewable replay timeline.

## Data Flow

- User opens the web app and requests a challenge.
- Web app returns a full command that can be copied and run locally.
- The local official runner uses the command to fetch scenario data from the backend.
- The user agent performs the full run locally, including floor decisions, build evolution, and combat choices.
- At run completion, the runner uploads a result JSON containing replay data, score inputs, metadata, and version details.
- The backend computes or stores the score, updates rankings, and exposes replay data to the web app.

## Dependencies

- Not fixed yet. The final stack should favor strong type-sharing between web, backend, and runner payloads.
- Replay rendering and schema validation libraries will likely be important early.

## Conventions

- Shared payload types should live in one place and be consumed by both the backend and the runner.
- The official runner contract should be versioned so old agent versions remain replayable.
- Submission payloads should include agent version, model metadata, cost metadata when available, and enough replay detail to visualize the run.
- Daily submission limits and daily season boundaries should be treated as first-class backend rules.

## Decisions Log

- 2026-03-07: Use a document-driven sequential workflow on `master` for GPT and Claude handoff.
- 2026-03-07: Use an official runner approach instead of fully free-form submission clients.
- 2026-03-07: Use local full-run simulation for MVP, with end-of-run JSON upload.
- 2026-03-07: Target boss-specific and daily season rankings with public replay visibility.
