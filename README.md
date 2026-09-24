# QUOTIDIANO

Vertical slice foundation for a 2D linguistic life simulator. The current implementation deliberately stops at **Phase 1: Casa** until the required quality gate can be executed successfully.

## Stack

- Phaser **4.2.1** (exact version)
- TypeScript
- Vite
- Vitest
- Playwright

## Current playable scope

The Home scene contains six spatial zones (bedroom, bathroom, kitchen/dining, living room, entrance/corridor and laundry), a custom protagonist derived from the provided LimeZu character assets, keyboard and click movement, data-driven interactions, persistent state/autosave, an 8-slot inventory, a stateful breakfast sequence, a simple phone UI, contextual Dutch dialogue and progressive time.

Implemented household flows include sleeping, making the bed, wardrobe state, showering, sink/toilet actions, refrigerator state, making toast and coffee, sitting/eating at the dining table, sofa/TV use, switching a real LimeZu floor lamp, taking/reading/returning a book, taking/placing keys, reading/replying to a Dutch message, unlocking the front door, and running the washing machine.

Street and Café are intentionally **not enabled** yet because the Casa quality gate has not been executed in this sandbox.

## Controls

- `WASD` / arrow keys: move
- mouse click: walk to point; clicking near an interaction walks toward its approach point
- `E` / `Space`: interact with nearest object
- `I`: backpack / inventory
- `P`: phone
- `Esc`: close overlays / return to free state

## Setup

```bash
npm install --package-lock-only
npm ci
npm run check
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

A `package-lock.json` is intentionally not fabricated in this handoff: the execution environment used for this build cannot resolve the npm registry. Generate it once networking is available with `npm install --package-lock-only`, then immediately run `npm ci` and commit it.

## Asset audit

The supplied ZIPs were catalogued without assuming their internal layout. The generated report is `docs/asset-audit.json`. To re-run with ZIPs placed in `incoming-assets/`:

```bash
npm run audit:assets
```

The asset browser is a local static tool in `tools/asset-browser/`; open `tools/asset-browser/index.html` directly or serve the repository with any local static server.

## Validation status

See `docs/VALIDATION.md`. Core dependency-free logic passes a strict TypeScript check and Node smoke test, and all TypeScript files pass Node's syntax parser. The Playwright suite is prepared for the full morning flow and all required Casa screenshot filenames, but the full Phaser/Vite/Vitest/Playwright gates remain pending because dependencies could not be downloaded in this environment.
