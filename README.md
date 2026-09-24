# QUOTIDIANO — House V3 corrigida + hotfix de build

**QUOTIDIANO** é um life simulator linguístico 2D em que o holandês é aprendido pela necessidade de viver e agir no cotidiano. Esta entrega trabalha somente a **Casa**. Rua, Café e cidade continuam fora do escopo.

## Estado desta entrega

A House V3 preserva a implementação profunda já existente e acrescenta um hotfix de compilação e uma auditoria de produção:

- `HomeScene.renderer` foi renomeado para `houseRenderer`, removendo o conflito com o membro herdado de `Phaser.Scene`;
- um auditor protege 19 nomes herdados para impedir a regressão;
- o ciclo de shutdown remove listeners de teclado/ponteiro, reseta handlers da UI, limpa a ponte de debug e encerra o renderer;
- a configuração TypeScript permanece `noEmit` e agora existe um auditor contra `.js`, `.d.ts` e `*.tsbuildinfo` acidentais;
- Node/npm foram fixados em `22.16.0` / `10.9.2`;
- os comandos de baseline e os gates finais foram executados e registrados literalmente.

A Casa contém **54 objetos**, **43 pontos de interação**, **108 ações domésticas**, **12 microcenários**, **30 intenções locais**, **95 variações de frase**, **60 nós de diálogo** e **65 assets runtime**.

## Resultado de build — importante

A correção do conflito foi implementada e reproduzida em um caso TypeScript mínimo, mas o build de produção não pôde ser demonstrado como verde nesta execução:

```text
npm run build
exit code: 2
início: 2026-09-24T18:09:48Z
Node: v22.16.0
npm: 10.9.2
erro imediato: tipos locais vite/client ausentes
```

A entrada não continha `package-lock.json`; `npm ci` falhou por isso. Tentativas legítimas de gerar o lockfile falharam com `EAI_AGAIN` no registro. O arquivo não foi fabricado.

Leia primeiro:

- `docs/PRODUCTION_BUILD_REPRODUCTION.md`;
- `docs/PACKAGE_LOCK_AUDIT.md`;
- `docs/BUILD_ENVIRONMENT.md`;
- `docs/LOCAL_VS_PRODUCTION_BUILD.md`;
- `docs/HOUSE_V3_VALIDATION.md`.

## Controles

| Entrada | Ação |
| --- | --- |
| `WASD` / setas | movimentação manual |
| clique | caminhar; clique próximo de objeto usa o `approachPoint` |
| `E` / `Espaço` | interagir |
| `I` | abrir/fechar mochila |
| `P` | abrir/fechar telefone |
| `Esc` | fechar painel ou cancelar rota |
| `F3` | alternar debug de layout/navegação |

## Ambiente fixado

```text
Node 22.16.0
npm 10.9.2
Phaser 4.2.1
TypeScript 5.7.3
Vite 6.1.0
Vitest 3.0.5
Playwright Test 1.50.1
```

Arquivos de paridade: `.nvmrc`, `.node-version`, `package.json#packageManager` e `package.json#engines`.

## Gate completo requerido

O projeto deve receber o `package-lock.json` compatível e então ser validado em árvore limpa:

```bash
rm -rf node_modules dist
npm ci
npm run check
npm run check:core
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

Não considere o runtime aprovado até abrir o preview de produção e inspecionar console, network, assets, movimento, quatro direções, interação, save e reload.

## Validação disponível sem dependências

```bash
npm run validate:local
```

Resultado registrado depois da última alteração de código:

- `check:core`: PASS;
- checagem offline de app/tests: PASS;
- auditor de membros de Scene: PASS;
- auditor de artefatos: PASS;
- topologia: 43/43 interações alcançáveis;
- testes offline: 9/9;
- assets: 65/65;
- limites arquiteturais: PASS.

Esse gate não substitui Phaser, Vitest, Playwright ou Vite reais.

## Estrutura principal

```text
src/game/house/                 planta, registro, renderer, colisões, validação e estado
src/game/house/rooms/           ações por cômodo
src/game/house/actions/         executor de sequências físicas
src/data/                       diálogos, intenções, telefone e microcenários
public/assets/runtime/          subset runtime necessário
scripts/                        gates offline e auditorias de produção
tests/unit/ e tests/e2e/        testes Vitest e Playwright preparados
docs/_validation/logs/          saídas literais dos comandos
```

## Licença dos assets

Os assets LimeZu selecionados permanecem sujeitos à licença incluída em `vendor-assets/limezu/selected/Modern_Interiors_LICENSE.txt`. Crédito: **LimeZu — limezu.itch.io**. Os packs completos e raw não fazem parte da entrega.
