# VALIDATION

Date: 2026-09-23
Environment detected:

- Node: `v22.16.0`
- npm: `10.9.2`
- Git: `2.47.3`
- Globally available TypeScript used for dependency-free check: `5.8.3`

## Commands actually executed

### Asset archives

```bash
unzip -t moderninteriors-win.zip
unzip -t modernexteriors-win.zip
unzip -t Modern_Exteriors_RPG_Maker_MV.zip
```

Result: all pass.

### Asset audit

```bash
node --experimental-strip-types scripts/audit-assets.ts \
  /mnt/data/moderninteriors-win.zip \
  /mnt/data/modernexteriors-win.zip \
  /mnt/data/Modern_Exteriors_RPG_Maker_MV.zip
```

Result: pass. Report saved to `docs/asset-audit.json`.

### Source syntax

```bash
find src scripts tests -name '*.ts' -print0 | xargs -0 -n1 node --experimental-strip-types --check
node --check tools/asset-browser/main.js
```

Result: pass.

### Strict dependency-free TypeScript check

```bash
tsc -p tsconfig.core.json --pretty false
```

Result: pass. This validates the dependency-free gameplay/data/navigation modules with `strict: true`. It is supplemental and does **not** replace the mandatory full `npm run check` once Phaser/Vite dependencies are installed.

### Core smoke test

```bash
node --experimental-strip-types scripts/smoke-core.ts
```

Result: `core smoke tests: PASS`.

Covered without external dependencies:

- clock rollover;
- inventory location changes;
- Dutch intent normalization/matching;
- interaction priority;
- A* obstacle routing;
- every current Home interaction approach point is walkable and routeable from spawn;
- action IDs are unique per interaction;
- declared persistent-state keys exist in the initial WorldState.

## Browser / screenshot status

No browser screenshot is claimed as a gameplay screenshot yet. The sandbox cannot currently resolve the npm registry, so Phaser/Vite/Playwright dependencies are unavailable and the game cannot honestly be launched here.

`tests/e2e/home.spec.ts` is now prepared to create these paths from real Playwright output:

```text
screenshots/home_bedroom.png
screenshots/home_bathroom.png
screenshots/home_kitchen.png
screenshots/home_livingroom.png
screenshots/home_entry.png
screenshots/home_sleep.png
screenshots/home_shower.png
screenshots/home_breakfast.png
```

The E2E source covers phone dialogue and a complete morning path through showering, dressing, preparing breakfast, eating, collecting keys and unlocking/attempting the front door. This coverage is **prepared, not yet executed**.

## Mandatory gate status

The following remain **pending, not passed**:

```bash
npm ci
npm run check
npm test
npm run test:e2e
npm run build
npm run preview
```

Reason: npm registry DNS/network access is unavailable in this execution environment. Direct `curl` attempts could not resolve npm/CDN hosts. The latest `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` attempt was terminated after an 18-second timeout without producing `package-lock.json`.

## Known risks to inspect first once dependencies are installed

- Phaser 4.2.1 runtime rendering of the large 48x48 character spritesheet.
- Exact animation frame groups for all four player directions.
- Visual depth/lighting of the living-room shade against the y-sorted player sprite.
- Walkable-topology and approach-point tuning after actual browser rendering.
- Rendering scale on small browser windows.
- Timing/reliability of the prepared E2E click-to-move sequence.
- Actual appearance of the eight required screenshots.
