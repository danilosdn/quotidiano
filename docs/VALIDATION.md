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


## Continuation validation — 2026-09-24T09:42:43+00:00

- Root: `/mnt/data/QUOTIDIANO_CONTINUED_WORK`
- Branch: `feature/house-v3-architecture-interactions`
- Starting HEAD: `f0b0fdf`

### `git init` — PASS (0.01s)

```text
hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint:
hint: 	git config --global init.defaultBranch <name>
hint:
hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
hint: 'development'. The just-created branch can be renamed via this command:
hint:
hint: 	git branch -m <name>
Initialized empty Git repository in /mnt/data/QUOTIDIANO_CONTINUED_WORK/.git/
```

### `git config user.email local-agent@localhost` — PASS (0.0s)

```text
[no output]
```

### `git config user.name Local Build Agent` — PASS (0.0s)

```text
[no output]
```

### `git add -A` — PASS (0.02s)

```text
[no output]
```

### `git commit -m chore: import provided project state` — PASS (0.01s)

```text
[master (root-commit) f0b0fdf] chore: import provided project state
 79 files changed, 2898 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 README.md
 create mode 100644 docs/GIT_LOG.txt
 create mode 100644 docs/HANDOFF.md
 create mode 100644 docs/PROGRESS.md
 create mode 100644 docs/THIRD_PARTY_LICENSES.md
 create mode 100644 docs/VALIDATION.md
 create mode 100644 docs/asset-audit.json
 create mode 100644 index.html
 create mode 100644 package.json
 create mode 100644 playwright.config.ts
 create mode 100644 public/assets/runtime/characters/player_quotidiano.png
 create mode 100644 public/assets/runtime/environment/floor_parquet.png
 create mode 100644 public/assets/runtime/environment/floor_tile.png
 create mode 100644 public/assets/runtime/environment/floor_wood.png
 create mode 100644 public/assets/runtime/environment/wall_light.png
 create mode 100644 public/assets/runtime/objects/bathroom_sink.png
 create mode 100644 public/assets/runtime/objects/bed.png
 create mode 100644 public/assets/runtime/objects/bookshelf.png
 create mode 100644 public/assets/runtime/objects/breakfast_plate.png
 create mode 100644 public/assets/runtime/objects/coffee.png
 create mode 100644 public/assets/runtime/objects/coffee_serving.png
 create mode 100644 public/assets/runtime/objects/dining_chair.png
 create mode 100644 public/assets/runtime/objects/dining_table.png
 create mode 100644 public/assets/runtime/objects/floor_lamp.png
 create mode 100644 public/assets/runtime/objects/fridge.png
 create mode 100644 public/assets/runtime/objects/front_door.png
 create mode 100644 public/assets/runtime/objects/kitchen_counter.png
 create mode 100644 public/assets/runtime/objects/oven.png
 create mode 100644 public/assets/runtime/objects/shower.png
 create mode 100644 public/assets/runtime/objects/sofa.png
 create mode 100644 public/assets/runtime/objects/toaster.png
 create mode 100644 public/assets/runtime/objects/toilet.png
 create mode 100644 public/assets/runtime/objects/tv.png
 create mode 100644 public/assets/runtime/objects/wardrobe.png
 create mode 100644 public/assets/runtime/objects/washing_machine.png
 create mode 100644 scripts/audit-assets.ts
 create mode 100644 scripts/smoke-core.ts
 create mode 100644 src/data/dialogues/home.json
 create mode 100644 src/data/interactions/homeInteractions.ts
 create mode 100644 src/game/config/constants.ts
 create mode 100644 src/game/config/gameConfig.ts
 create mode 100644 src/game/dialogue/IntentMatcher.ts
 create mode 100644 src/game/dialogue/ScriptedDialogueProvider.ts
 create mode 100644 src/game/dialogue/types.ts
 create mode 100644 src/game/entities/Player.ts
 create mode 100644 src/game/interactions/InteractionRegistry.ts
 create mode 100644 src/game/interactions/types.ts
 create mode 100644 src/game/inventory/InventoryManager.ts
 create mode 100644 src/game/language/HintSystem.ts
 create mode 100644 src/game/navigation/NavigationManager.ts
 create mode 100644 src/game/navigation/PathFinder.ts
 create mode 100644 src/game/navigation/houseNavigation.ts
 create mode 100644 src/game/persistence/SaveManager.ts
 create mode 100644 src/game/scenes/BootScene.ts
 create mode 100644 src/game/scenes/HomeScene.ts
 create mode 100644 src/game/state/PlayerState.ts
 create mode 100644 src/game/state/WorldState.ts
 create mode 100644 src/game/state/types.ts
 create mode 100644 src/game/time/GameClock.ts
 create mode 100644 src/main.ts
 create mode 100644 src/style.css
 create mode 100644 src/ui/UIController.ts
 create mode 100644 tests/e2e/home.spec.ts
 create mode 100644 tests/unit/game-clock.test.ts
 create mode 100644 tests/unit/home-interactions.test.ts
 create mode 100644 tests/unit/intent-matcher.test.ts
 create mode 100644 tests/unit/interactions.test.ts
 create mode 100644 tests/unit/inventory.test.ts
 create mode 100644 tests/unit/path-finder.test.ts
 create mode 100644 tools/asset-browser/index.html
 create mode 100644 tools/asset-browser/main.js
 create mode 100644 tsconfig.app.json
 create mode 100644 tsconfig.core.json
 create mode 100644 tsconfig.json
 create mode 100644 tsconfig.node.json
 create mode 100644 vendor-assets/limezu/selected/Modern_Interiors_LICENSE.txt
 create mode 100644 vite.config.ts
 create mode 100644 vitest.config.ts
```

### `git switch -c feature/house-v3-architecture-interactions` — PASS (0.0s)

```text
Switched to a new branch 'feature/house-v3-architecture-interactions'
```

### `node scripts/validate-house-content-boundaries.mjs` — FAIL (1) (0.08s)

```text
{
  "filesScanned": 31,
  "homeScenes": [
    "src/game/scenes/HomeScene.ts"
  ],
  "uiControllers": [
    "src/ui/UIController.ts"
  ],
  "roomModules": [],
  "dialogueData": [
    "src/data/dialogues/home.json"
  ],
  "phoneData": [],
  "failures": [
    "Expected at least 4 room action modules; found 0."
  ]
}
```

### Environment notes

- node_modules was not present; dependency-backed checks were not run in this pass.
- package-lock.json was absent, so npm ci was intentionally not attempted.
