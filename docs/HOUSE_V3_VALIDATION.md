# House V3 — validação final

## Ambiente observado

- Node: v22.16.0
- npm: 10.9.2
- TypeScript global: 5.8.3
- Chromium: 144.0.7559.96 (Debian)
- dependências locais: ausentes
- `package-lock.json`: ausente na entrada e não gerado por falta de acesso ao registro

## Gate local executado

Comando:

```bash
npm run validate:local
```

Resultado: **PASS**.

| Etapa | Resultado real |
| --- | --- |
| `check:core` | PASS — TypeScript estrito do núcleo |
| `check:app-offline` | PASS — sintaxe/tipos com stub temporário da forma da API Phaser |
| `check:tests-offline` | PASS — sintaxe de source/tests com stubs temporários de packages |
| `validate:house` | PASS — 43/43 interações alcançáveis, zero issue |
| `test:offline` | PASS — 9/9 cenários |
| `validate:assets` | PASS — 65/65 arquivos, chaves únicas e frames válidos |
| `validate:boundaries` | PASS — seis módulos de cômodo e datasets separados |

Log literal: `docs/_validation/logs/validate-local.txt`.

A forma final de `npm run check` (`tsc -p tsconfig.app.json` seguido de `tsc -p tsconfig.node.json`) também foi exercitada com pacotes de tipos temporários locais para validar a configuração de TypeScript; ela saiu com código 0. Esse ensaio está em `docs/_validation/logs/check-command-shape-offline.txt` e não substitui os packages reais.

## O que os stubs significam

Os scripts offline criam declarações temporárias mínimas apenas para permitir ao TypeScript verificar a estrutura do app quando `phaser`, `vitest` e `@playwright/test` não estão instalados. Eles são removidos no final e **não substituem** os packages reais nem provam compatibilidade de runtime.

## Testes offline aprovados

1. topologia e interações da Casa;
2. mapa de frames e direções;
3. mínimos de conteúdo linguístico;
4. matching natural e rejeição fora de contexto;
5. capacidade da mochila e item único na mão;
6. posições de objetos portáteis e ausência de queda abstrata em `WORLD`;
7. migração de save V1 → V2;
8. roteamento de todas as ações registradas para handlers;
9. ordem do action sequence runner.

## Assets

- imagens: 59;
- spritesheets: 6;
- total: 65;
- texturas estaticamente usadas: 63;
- warnings: `shoes` e `wardrobe` preservados, mas não referenciados estaticamente;
- erros: zero.

Contagem de frames: geladeira 8, forno 6, cafeteira 6, torradeira 11, porta 8 e protagonista 2.296.

## Gates npm não executados

| Comando | Status | Motivo |
| --- | --- | --- |
| `npm ci` | BLOQUEADO | lockfile ausente e registro inacessível |
| `npm run check` | NÃO EXECUTADO | Phaser/Vite/types locais ausentes |
| `npm test` | NÃO EXECUTADO | Vitest ausente |
| `npm run test:e2e` | NÃO EXECUTADO | Playwright package ausente |
| `npm run build` | NÃO EXECUTADO | Vite/Phaser ausentes |
| `npm run preview` | NÃO EXECUTADO | build não gerado |

O Chromium do sistema existe, mas isso não substitui `@playwright/test`.

## Screenshots

Não há screenshots de gameplay alegados. As imagens em `docs/_validation/` são prévias técnicas/contatos gerados de dados e assets. As pastas `screenshots/before`, `screenshots/after` e `screenshots/flows` estão preparadas para a execução futura do E2E real.

## Próximo gate em ambiente com rede

```bash
npm install
rm -rf node_modules
npm ci
npm run check
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

Depois, abrir o preview e inspecionar console, network, profundidade, escala, colisões, todas as direções e screenshots.
