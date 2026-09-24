# House V3 — validação final do hotfix

Data: 2026-09-24.

## Escopo

Esta validação cobre:

- a correção do conflito `HomeScene.renderer`;
- a higiene de lifecycle/listeners da cena;
- a prevenção de artefatos TypeScript emitidos no source tree;
- a propriedade de somente leitura de `npm run check`;
- a preservação dos validadores e conteúdos da House V3;
- a tentativa real dos gates de produção na ordem exigida.

## Ambiente observado

- sistema: Linux 6.18.44 x86_64;
- Node: `v22.16.0`;
- npm: `10.9.2`;
- TypeScript global disponível: `5.8.3`;
- Chromium do sistema: `144.0.7559.96`;
- dependências locais: ausentes;
- `package-lock.json`: ausente na entrada e não gerado;
- `node_modules`: ausente;
- `dist`: ausente.

## Reprodução da baseline

| Comando antes da correção | Exit | Resultado |
| --- | ---: | --- |
| `npm ci` | 1 | lockfile ausente |
| `npm run build` | 2 | `TS2688`, `vite/client` ausente |

Como o compilador parou antes, o conflito reportado não foi reproduzido pelo build completo. Ele foi confirmado pela declaração presente no source e reproduzido por um caso TypeScript mínimo com o mesmo contrato de visibilidade:

- variante com `private renderer`: exit 2 / `TS2415`;
- variante com `private houseRenderer`: exit 0.

## Gates adicionados

| Gate | Finalidade |
| --- | --- |
| `validate:scene-members` | impedir campos de Scene que colidam com 19 membros herdados |
| `validate:artifacts` | impedir configs `.js/.d.ts` e `*.tsbuildinfo` acidentais |
| `check:readonly` | comparar hashes antes/depois de `npm run check` |
| teste `scene-member-collisions` | regressão Vitest para o nome do campo |
| teste `home-scene-lifecycle` | contratos de shutdown e remoção de handlers |

O probe negativo do auditor detectou corretamente um `renderer` temporário e saiu com código 1.

## Gate local sem packages externos

Comando:

```bash
npm run validate:local
```

Resultado final: **PASS, exit 0**.

| Etapa | Resultado real |
| --- | --- |
| `check:core` | PASS — TypeScript estrito do núcleo |
| `check:app-offline` | PASS — source do app com stub temporário de forma Phaser |
| `check:tests-offline` | PASS — source/tests com stubs temporários de packages |
| `validate:scene-members` | PASS — 19 nomes protegidos |
| `validate:artifacts` | PASS — nenhum emit/config artefato |
| `validate:house` | PASS — 43/43 interações alcançáveis, zero issue |
| `test:offline` | PASS — 9/9 |
| `validate:assets` | PASS — 65/65; dois assets não referenciados estaticamente |
| `validate:boundaries` | PASS — seis módulos de cômodo, dados separados |

Os stubs temporários não substituem os packages reais nem provam compatibilidade de runtime.

## Testes offline aprovados

1. topologia e interações da Casa;
2. mapa de frames e direções;
3. mínimos de conteúdo linguístico;
4. matching natural e rejeição fora de contexto;
5. capacidade da mochila e item único na mão;
6. posições de objetos portáteis e estado físico coerente;
7. migração de save V1 para V2;
8. roteamento de todas as ações para handlers;
9. ordem do action sequence runner.

## Rodada final obrigatória

Executada depois da última alteração de código:

| Ordem | Comando | Exit | Interpretação |
| ---: | --- | ---: | --- |
| 1 | `npm ci` | 1 | **FAIL/BLOQUEADO** — lockfile ausente |
| 2 | `npm run check` | 2 | **FAIL/BLOQUEADO** — `vite/client` ausente |
| 3 | `npm run check:core` | 0 | **PASS** |
| 4 | `npm test` | 127 | **FAIL/BLOQUEADO** — `vitest` ausente |
| 5 | `npm run test:e2e` | 1 | **FAIL/BLOQUEADO** — runner Playwright do projeto ausente |
| 6 | `npm run build` | 2 | **FAIL/BLOQUEADO** — parou no check |
| 7 | `npm run preview` | 127 | **FAIL/BLOQUEADO** — `vite` ausente |
| 8 | `npm run validate:local` | 0 | **PASS** |
| 9 | `npm run validate:artifacts` | 0 | **PASS** |
| 10 | `npm run check:readonly` | 2 | check falhou, mas 89 arquivos permaneceram byte-idênticos |

## BUILD FINAL — evidência exata

```text
npm run build
exit code: 2
start UTC: 2026-09-24T18:09:48Z
end UTC: 2026-09-24T18:09:49Z
start America/Sao_Paulo: 2026-09-24T15:09:48-0300
Node: v22.16.0
npm: 10.9.2
erro: TS2688 — Cannot find type definition file for 'vite/client'
```

Não há declaração de “build corrigido” ou “produção aprovada”.

## Auditoria de artefatos e read-only

Depois da rodada:

- nenhum `vite.config.js/.d.ts`;
- nenhum `vitest.config.js/.d.ts`;
- nenhum `playwright.config.js/.d.ts`;
- nenhum `*.tsbuildinfo`;
- nenhum `dist`;
- nenhum `node_modules`;
- nenhum lockfile parcial;
- 89 arquivos relevantes permaneceram com os mesmos hashes durante `npm run check`.

## Screenshots

Não foram produzidos screenshots novos de gameplay/preview porque o build e o servidor Vite não puderam executar. As imagens existentes em `docs/_validation/` são prévias técnicas, não prova visual do build de produção.

## Conclusão

A causa de código `HomeScene.renderer` foi corrigida e possui regressão automatizada. A House V3 continua estruturalmente válida nos gates locais. A aceitação de produção permanece pendente até recuperar/gerar um lockfile legítimo, executar `npm ci` e repetir TypeScript, Vitest, E2E, build e preview com os packages reais.
