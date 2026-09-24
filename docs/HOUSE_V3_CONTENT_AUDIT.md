# House V3 — Content and Architecture Audit

Generated: 2026-09-24T09:42:43+00:00

This report is generated from the checked-out source tree. It is intentionally non-destructive and is meant to make handoff and validation reproducible.

## Summary

- Source/data files scanned: **43**
- TypeScript/TSX files: **35**
- Room action/interaction module candidates: **0**
- Dialogue data module candidates: **1**
- Phone/message/contact data candidates: **0**
- Files over 500 lines: **1**

## Home scene modules

- `src/game/scenes/HomeScene.ts` — 384 lines

## UI controller modules

- `src/ui/UIController.ts` — 75 lines

## Room action modules

- None detected.

## Dialogue data modules

- `src/data/dialogues/home.json` — 45 lines

## Phone/content data modules

- None detected.

## Dutch content candidates

- `scripts/smoke-core.ts` — 47 lines
- `src/data/dialogues/home.json` — 45 lines
- `src/data/interactions/homeInteractions.ts` — 22 lines
- `src/game/scenes/HomeScene.ts` — 384 lines
- `src/ui/UIController.ts` — 75 lines
- `tests/e2e/home.spec.ts` — 123 lines
- `tests/unit/intent-matcher.test.ts` — 15 lines
- `tests/unit/inventory.test.ts` — 16 lines

## Files over 500 lines

- `docs/asset-audit.json` — 878 lines

## Boundary goals

- Scene classes should orchestrate lifecycle and rendering, not own dialogue copy or phone datasets.
- Room-specific physical actions should remain in room modules behind a shared runtime/context contract.
- Dialogue, messages, contacts and agenda entries should be imported from data modules.
- Validation should reject duplicate IDs, missing targets and unreachable approach points before runtime.
