# QUOTIDIANO — handoff House V3 / hotfix de build

## Etapa atual

O conflito `HomeScene.renderer` foi corrigido localmente e protegido por auditor/teste. A House V3 completa foi preservada. O gate de produção permanece bloqueado pela ausência do lockfile e das dependências locais.

## Fonte local

- arquivo de entrada: `QUOTIDIANO_HOUSE_V3_CORRIGIDO_INPUT.zip`;
- SHA-256: `ee82ba37de764b88d276f6a91690195bf094b2b5d2cf5893c1329595d6949488`;
- a árvore final não contém `.git`;
- nenhum commit foi criado.

## O que foi corrigido

- `private renderer!: HouseRenderer` → `private houseRenderer!: HouseRenderer`;
- todas as referências atualizadas;
- auditor de 19 membros herdados de `Phaser.Scene`;
- teste estático de colisão;
- callbacks de input nomeados e removidos no shutdown;
- `UIController.resetHandlers()`;
- `HouseRenderer.shutdown()`;
- ponte de debug e estado transitório limpos;
- auditor de artefatos TypeScript;
- auditor de `npm run check` somente leitura;
- versões Node/npm fixadas.

## Evidência de reprodução

- baseline `npm ci`: exit 1;
- baseline `npm run build`: exit 2 em `vite/client`;
- reprodução mínima do conflito: quebrado exit 2, renomeado exit 0;
- rodada final `npm run build`: exit 2 em `vite/client`.

Tudo está em `docs/_validation/logs/production-build/`.

## O que passa agora

- `npm run check:core`;
- `npm run validate:local`;
- `npm run validate:scene-members`;
- `npm run validate:artifacts`;
- 43/43 interações alcançáveis;
- 9/9 testes offline;
- 65/65 assets válidos.

## O que não está demonstrado

- `package-lock.json` compatível;
- instalação limpa com `npm ci`;
- `npm run check` com packages reais;
- Vitest;
- Playwright E2E;
- build Vite;
- preview de produção;
- screenshots de gameplay pós-hotfix.

## Próximo comando recomendado

Primeiro obtenha ou gere legitimamente o lockfile com Node 22.16.0 e npm 10.9.2. Depois:

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

Se qualquer código for alterado depois do build, repita `npm run build` e o preview.

## Operações remotas

Não houve commit, push, pull, merge, rebase, reset, pull request, deploy, publicação ou alteração de configuração no GitHub/Netlify.
