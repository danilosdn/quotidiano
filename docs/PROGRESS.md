# QUOTIDIANO — progresso House V3 / hotfix de produção

Atualizado em 2026-09-24.

## Entrada e segurança

- alvo: cópia local de `QUOTIDIANO_HOUSE_V3_CORRIGIDO_INPUT.zip`;
- SHA-256 da entrada: `ee82ba37de764b88d276f6a91690195bf094b2b5d2cf5893c1329595d6949488`;
- entrada sem `.git`, `package-lock.json`, `node_modules` ou `dist`;
- nenhuma operação remota realizada.

## Reprodução concluída

Antes de modificar código:

- `npm ci`: exit 1, lockfile ausente;
- `npm run build`: exit 2, tipos `vite/client` ausentes;
- o build não chegou ao conflito reportado porque as dependências não estavam instaladas.

A causa de `HomeScene.renderer` foi reproduzida separadamente como `TS2415` e documentada.

## Hotfix concluído

- `renderer` renomeado para `houseRenderer` em `HomeScene`;
- proteção automatizada de 19 nomes herdados de `Phaser.Scene`;
- teste unitário de regressão adicionado;
- shutdown da cena remove listeners e reseta a UI;
- renderer limpa recursos de debug no shutdown;
- risco de listener duplicado da resposta do telefone removido;
- Node/npm fixados em 22.16.0/10.9.2;
- auditoria de artefatos TypeScript e typecheck somente leitura adicionadas.

## House V3 preservada

- 54 objetos;
- 43 interações, todas alcançáveis no validador;
- 108 ações;
- inventário físico e save V2;
- 12 microcenários, 30 intenções, 95 variações e 60 diálogos;
- 65 assets runtime;
- Rua e Café não iniciados.

## Validação final disponível

`npm run validate:local`: exit 0.

`npm run validate:artifacts`: exit 0.

`npm run check:readonly`: exit 2 por dependência ausente, mas confirmou que 89 arquivos relevantes permaneceram byte a byte idênticos.

## Bloqueios restantes

- `package-lock.json` não pôde ser recuperado ou gerado;
- `npm ci` permanece bloqueado;
- Vitest, Playwright, Vite e Phaser reais não puderam ser instalados;
- build, preview e screenshots reais de produção não estão aprovados.

Consulte `PRODUCTION_BUILD_REPRODUCTION.md` e `PACKAGE_LOCK_AUDIT.md`.
