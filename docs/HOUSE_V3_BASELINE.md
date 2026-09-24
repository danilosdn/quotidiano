# House V3 — baseline do hotfix

## Baseline local

A baseline efetiva é a extração imutável de `QUOTIDIANO_HOUSE_V3_CORRIGIDO_INPUT.zip`, SHA-256 `ee82ba37de764b88d276f6a91690195bf094b2b5d2cf5893c1329595d6949488`.

Ela já continha a House V3 profunda, com layout e interações data-driven. O objetivo deste bloco não foi redesenhar a Casa novamente, mas reproduzir e corrigir o incidente de build sem perder a implementação.

## Estado antes da correção

- `HomeScene` declarava `private renderer!: HouseRenderer`;
- não havia teardown explícito dos listeners de input;
- UI e renderer não expunham limpeza completa para shutdown;
- não havia auditor de colisão de membros herdados;
- Node/npm não estavam fixados;
- `package-lock.json` e `node_modules` não existiam.

## Reprodução literal

Antes de alterar qualquer arquivo:

```text
npm ci       -> exit 1 (lockfile ausente)
npm run build -> exit 2 (vite/client ausente)
```

Datas:

- `npm ci`: 2026-09-24T17:50:34Z;
- `npm run build`: 2026-09-24T17:50:34Z–17:50:35Z.

A falha completa de `renderer` não pôde ser alcançada pelo build local sem os packages. A declaração incompatível foi, contudo, confirmada diretamente e reproduzida por um caso TypeScript mínimo.

## Evidências

- `docs/_validation/logs/production-build/00-baseline-environment.txt`;
- `docs/_validation/logs/production-build/01-baseline-npm-ci.txt`;
- `docs/_validation/logs/production-build/02-baseline-npm-run-build.txt`;
- `docs/_validation/logs/production-build/04-renderer-collision-minimal.txt`.

## Baseline pública informada

- repositório: `https://github.com/danilosdn/quotidiano`;
- branch: `https://github.com/danilosdn/quotidiano/tree/feature/house-v2-limezu`;
- commit: `https://github.com/danilosdn/quotidiano/commit/0c01f8f`;
- site: `https://quotidiano-game.netlify.app`.

Essas referências não foram destino de nenhuma modificação.
