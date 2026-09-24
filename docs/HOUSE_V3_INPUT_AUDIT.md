# House V3 — auditoria da entrada do hotfix

Data: 2026-09-24.

## Alvo efetivamente modificado

O trabalho foi realizado sobre a extração local preservada de `QUOTIDIANO_HOUSE_V3_CORRIGIDO_INPUT.zip`.

| Propriedade | Valor |
| --- | --- |
| SHA-256 | `ee82ba37de764b88d276f6a91690195bf094b2b5d2cf5893c1329595d6949488` |
| tamanho | 485.771 bytes |
| entradas ZIP | 246 |
| arquivos extraídos | 196 |
| `.git` | ausente |
| `package-lock.json` | ausente |
| `node_modules` | ausente |
| `dist` | ausente |

A entrada já continha a implementação extensa da House V3: arquitetura data-driven, assets runtime, testes, conteúdo linguístico e documentação. Ela não foi substituída por um projeto novo.

## Dependências declaradas na entrada

| Tipo | Pacote | Versão |
| --- | --- | --- |
| runtime | Phaser | `4.2.1` |
| dev | TypeScript | `5.7.3` |
| dev | Vite | `6.1.0` |
| teste | Vitest | `3.0.5` |
| E2E | Playwright Test | `1.50.1` |
| tipos | `@types/node` | `22.10.10` |

## Problema de produção confirmado no source

`src/game/scenes/HomeScene.ts` declarava um campo privado chamado `renderer` enquanto a classe estende `Phaser.Scene`. Esse nome faz parte da API herdada. O conflito foi corrigido sem reescrever a arquitetura House V3.

## Delta de código do hotfix

Antes da atualização documental/evidências, a comparação com a extração imutável mostrou:

### Arquivos alterados

- `.gitignore`;
- `package.json`;
- `scripts/check-app-offline.mjs`;
- `scripts/check-tests-offline.mjs`;
- `src/game/house/HouseRenderer.ts`;
- `src/game/scenes/HomeScene.ts`;
- `src/ui/UIController.ts`.

### Arquivos adicionados

- `.nvmrc`;
- `.node-version`;
- `scripts/audit-scene-member-collisions.mjs`;
- `scripts/audit-typescript-artifacts.mjs`;
- `scripts/check-readonly-typecheck.mjs`;
- `tests/unit/home-scene-lifecycle.test.ts`;
- `tests/unit/scene-member-collisions.test.ts`;
- documentação e logs de auditoria.

Nenhum source existente foi removido.

## Problemas evidentes encontrados

1. lockfile ausente;
2. dependências ausentes;
3. campo `renderer` incompatível com o membro herdado;
4. listeners da cena sem teardown explícito;
5. handlers da UI persistentes entre reinicializações;
6. ausência de gate contra membros herdados;
7. ausência de gate contra configs TypeScript emitidos;
8. ambiente Node/npm não fixado no projeto.

## Referências públicas

As URLs públicas fornecidas foram tratadas somente como referências. O target permaneceu o ZIP local. Tentativas automatizadas de recuperar o lockfile remoto não produziram conteúdo utilizável; nenhum arquivo remoto foi usado para sobrescrever a cópia.
