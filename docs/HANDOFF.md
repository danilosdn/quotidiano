# QUOTIDIANO — Handoff

Updated: 2026-09-24T09:42:43+00:00

## Current stage

House V3 architecture/interactions. Street and Café remain gated until the Casa quality gate passes with dependency-backed tests and the complete morning flow.

## Branch and base

- Working branch: `feature/house-v3-architecture-interactions`
- HEAD before this continuation pass: `f0b0fdf`
- Origin of working tree: `extracted QUOTIDIANO_PHASE1_CANDIDATE.zip`

## What works / what is present

- Existing House V3 source and previous refactoring were preserved without reset.
- A generated architecture/content audit is available at `docs/HOUSE_V3_CONTENT_AUDIT.md`.
- A dependency-free boundary validator is available at `scripts/validate-house-content-boundaries.mjs`.
- Exact command outputs for this pass are in `docs/VALIDATION.md`.

## Partial / unresolved

- node_modules was not present; dependency-backed checks were not run in this pass.
- package-lock.json was absent, so npm ci was intentionally not attempted.

## Next recommended command

```bash
npm ci && npm run check && npm test -- --run && npm run test:e2e && npm run build
```

## Previous handoff content (preserved)

# HANDOFF

## Etapa atual

FASE 1 - Casa, implementation candidate awaiting the mandatory real Phaser/browser quality gate.

## Último commit

Branch: `feature/quotidiano-foundation`.

Latest implementation/test commits before this documentation update:

- `92a9364 feat: deepen living room interactions`
- `21c600b test: cover casa morning flow`

Run `git log -1 --oneline` for the packaged HEAD.

## O que funciona / foi verificado sem dependências externas

- Asset audit script over all supplied ZIPs.
- Selected 48x48 LimeZu runtime assets and edited protagonist derivative.
- Core data model: time, inventory, interaction selection, dialogue intents and persistent WorldState.
- Shared A* topology reaches every current Home interaction approach point.
- `tsc -p tsconfig.core.json --pretty false` passes using the available global TypeScript compiler.
- Core smoke tests pass under Node 22.
- Every TypeScript file passes Node's syntax parser.
- Asset-browser JavaScript passes `node --check`.

## O que está implementado mas ainda precisa ser executado em Phaser real

- Phaser 4.2.1 BootScene + HomeScene.
- Six-room house rendering with real LimeZu objects.
- Keyboard movement and indoor A* click-to-move through defined room openings/furniture blockers.
- Stateful interactions including bed/rest, hygiene, clothes, breakfast, living room, keys/door, laundry, phone, Dutch dialogue and autosave.
- Vitest suite, including Home interaction topology/data validation.
- Playwright phone test and complete morning-flow E2E through the unlocked front door.
- Required screenshot capture paths for bedroom, bathroom, kitchen, living room, entry, sleep, shower and breakfast.

## O que falta

1. Obtain npm registry access.
2. Generate and commit a real `package-lock.json`; do not hand-author one.
3. Run `npm ci` and fix any TypeScript/Phaser 4.2.1 API issues.
4. Install Chromium and execute Playwright.
5. Inspect the actual rendered home and tune layout, depths, animation frames, walkable topology and approach points if browser output reveals issues.
6. Confirm the complete morning-flow E2E passes rather than merely being statically prepared.
7. Generate and inspect the required real screenshots (`home_bedroom.png`, `home_bathroom.png`, `home_kitchen.png`, `home_livingroom.png`, `home_entry.png`, `home_sleep.png`, `home_shower.png`, `home_breakfast.png`).
8. Run the production build/preview gate.
9. Only after all Casa gates pass: begin StreetScene using Modern Exteriors.

## Testes que passaram

```text
unzip -t (3 supplied ZIPs) -> PASS
tsc -p tsconfig.core.json --pretty false -> PASS
node --experimental-strip-types --check (all .ts) -> PASS
node --experimental-strip-types scripts/smoke-core.ts -> PASS
node --check tools/asset-browser/main.js -> PASS
```

## Testes que não puderam ser executados

```text
npm ci                 -> BLOCKED: no generated package-lock and registry DNS/network unavailable
npm run check          -> pending installed dependencies
npm test               -> pending installed dependencies
npm run test:e2e       -> pending installed dependencies + Chromium
npm run build          -> pending installed dependencies
npm run preview        -> pending production build
```

Latest network retry in this execution:

```text
timeout 18s npm install --package-lock-only --ignore-scripts --no-audit --no-fund
-> timeout, no package-lock.json produced
```

## Próximo comando recomendado

```bash
npm install --package-lock-only && npm ci && npm run check && npm test && npx playwright install chromium && npm run test:e2e && npm run build && npm run preview
```

