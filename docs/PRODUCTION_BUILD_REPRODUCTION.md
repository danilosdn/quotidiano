# Reprodução da falha de build de produção

Data: 2026-09-24.

## Incidente investigado

Foi informado que o commit `b9f38ef` produziu um deploy falho no Netlify durante `npm run build`, com conflito entre o membro `HomeScene.renderer` e o membro herdado `Phaser.Scene.renderer`.

O alvo desta auditoria foi exclusivamente a cópia local recebida em `QUOTIDIANO_HOUSE_V3_CORRIGIDO_INPUT.zip`:

- SHA-256 da entrada: `ee82ba37de764b88d276f6a91690195bf094b2b5d2cf5893c1329595d6949488`;
- tamanho: 485.771 bytes;
- 246 entradas no arquivo ZIP;
- 196 arquivos após extração;
- sem `.git`, `node_modules`, `dist` ou `package-lock.json`.

Nenhuma operação remota foi executada.

## Ambiente da reprodução inicial

| Campo | Valor observado |
| --- | --- |
| Timestamp UTC | `2026-09-24T17:50:23Z` |
| Timestamp São Paulo | `2026-09-24T14:50:23-0300` |
| Sistema | Linux 6.18.44 x86_64 |
| Node | `v22.16.0` |
| npm | `10.9.2` |
| Diretório | extração imutável da entrada |
| `package-lock.json` | ausente |
| `node_modules` | ausente |

Evidência literal: `docs/_validation/logs/production-build/00-baseline-environment.txt`.

## Reprodução antes de modificar o código

### 1. `npm ci`

- início: `2026-09-24T17:50:23Z`;
- resultado: **exit code 1**;
- erro: `npm ci` recusou a instalação porque não havia `package-lock.json` nem `npm-shrinkwrap.json`.

Evidência: `docs/_validation/logs/production-build/01-baseline-npm-ci.txt`.

### 2. `npm run build`

- executado depois de `npm ci`, ainda antes de qualquer correção;
- resultado: **exit code 2**;
- primeira falha observada: `TS2688: Cannot find type definition file for 'vite/client'`.

O build local não alcançou o erro `HomeScene.renderer`, porque a árvore de dependências não pôde ser instalada e o compilador parou antes ao resolver os tipos do Vite. Isso não foi tratado como prova de que o incidente estava corrigido.

Evidência: `docs/_validation/logs/production-build/02-baseline-npm-run-build.txt`.

## Investigação de `HomeScene.renderer`

Na entrada recebida, `HomeScene` declarava:

```ts
private renderer!: HouseRenderer;
```

`HomeScene` estende `Phaser.Scene`, cuja forma pública inclui um membro homônimo `renderer`. Tornar privado, na subclasse, um membro público herdado é incompatível com a relação de extensão e produz o diagnóstico TypeScript `TS2415`.

A causa foi reproduzida de forma isolada, sem depender dos packages ausentes:

```text
Class 'HomeSceneBroken' incorrectly extends base class 'PhaserSceneShape'.
Property 'renderer' is private in type 'HomeSceneBroken' but not in type 'PhaserSceneShape'.
```

- variante quebrada: exit 2;
- variante renomeada: exit 0.

Evidência: `docs/_validation/logs/production-build/04-renderer-collision-minimal.txt`.

## Correção aplicada

O serviço específico da Casa foi renomeado semanticamente:

```ts
private houseRenderer!: HouseRenderer;
```

Todas as referências da cena foram atualizadas para `houseRenderer`. A busca final encontra `renderer` somente na lista de nomes protegidos do teste de regressão, não como campo da cena.

Também foram auditados estes membros herdados de `Phaser.Scene`:

`renderer`, `game`, `scene`, `sys`, `load`, `input`, `physics`, `cameras`, `textures`, `sound`, `time`, `events`, `registry`, `cache`, `anims`, `children`, `data`, `scale` e `plugins`.

Não foi identificado outro conflito real. O comando `npm run validate:scene-members` passou protegendo os 19 nomes.

Evidência: `docs/_validation/logs/production-build/07-renderer-audit.txt`.

## Proteção contra regressão

Foram adicionados:

- `scripts/audit-scene-member-collisions.mjs`;
- `tests/unit/scene-member-collisions.test.ts`;
- um probe negativo que injeta temporariamente um campo `renderer` e exige falha do auditor.

O probe retornou exit 1 como esperado, e foi removido em seguida. Evidência: `docs/_validation/logs/production-build/03-scene-collision-regression-probe.txt`.

## Auditoria adicional da refatoração House V3

Além do conflito de nome, a cena foi endurecida contra reinicializações e listeners duplicados:

- callbacks de teclado e ponteiro passaram a ser funções nomeadas;
- o evento `Phaser.Scenes.Events.SHUTDOWN` remove os handlers registrados;
- callbacks e painéis da UI são limpos por `UIController.resetHandlers()`;
- a ponte global de debug é removida somente se pertencer à instância atual;
- estados transitórios de diálogo/interação são reinicializados;
- `HouseRenderer.shutdown()` destrói gráficos/labels de debug e limpa referências;
- foi removido o risco de listener duplicado na resposta do telefone.

O teste estático `tests/unit/home-scene-lifecycle.test.ts` cobre esses contratos. A execução Vitest real permaneceu bloqueada pela ausência das dependências, mas a checagem offline de source/tests passou.

## Rodada final obrigatória após a última alteração de código

Ambiente:

- Node `v22.16.0`;
- npm `10.9.2`;
- Linux 6.18.44 x86_64;
- início do gate: `2026-09-24T18:09:45Z` / `2026-09-24T15:09:45-0300`.

| Ordem | Comando | Exit code | Resultado real |
| ---: | --- | ---: | --- |
| 1 | `npm ci` | 1 | bloqueado: lockfile ausente |
| 2 | `npm run check` | 2 | bloqueado: tipos locais `vite/client` ausentes |
| 3 | `npm run check:core` | 0 | **PASS** |
| 4 | `npm test` | 127 | bloqueado: `vitest` não instalado |
| 5 | `npm run test:e2e` | 1 | bloqueado: `@playwright/test` não instalado |
| 6 | `npm run build` | 2 | parou no `npm run check`, tipos Vite ausentes |
| 7 | `npm run preview` | 127 | bloqueado: `vite` não instalado/build inexistente |
| 8 | `npm run validate:local` | 0 | **PASS** |
| 9 | `npm run validate:artifacts` | 0 | **PASS** |
| 10 | `npm run check:readonly` | 2 | check bloqueado, mas 89 arquivos ficaram byte a byte idênticos |

Os logs literais ficam em `docs/_validation/logs/production-build/`.

## BUILD FINAL

```text
comando: npm run build
exit code: 2
timestamp de início UTC: 2026-09-24T18:09:48Z
timestamp de fim UTC: 2026-09-24T18:09:49Z
timestamp de início São Paulo: 2026-09-24T15:09:48-0300
Node: v22.16.0
npm: 10.9.2
primeiro erro: TS2688 — Cannot find type definition file for 'vite/client'
```

Esse resultado significa que a correção de `HomeScene.renderer` e os gates locais estão implementados, mas o build de produção **não está demonstrado como verde** nesta execução. A causa imediata da rodada final é a impossibilidade de instalar a árvore declarada sem lockfile e sem resolução DNS para o registro.
