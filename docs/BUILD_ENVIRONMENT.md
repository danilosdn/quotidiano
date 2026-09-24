# Ambiente de build

Data da auditoria: 2026-09-24.

## Ambiente efetivamente observado

| Componente | Valor |
| --- | --- |
| Sistema operacional | Linux 6.18.44 x86_64 |
| Node | `v22.16.0` |
| npm | `10.9.2` |
| TypeScript global usado pelos gates offline | `5.8.3` |
| Chromium do sistema | `144.0.7559.96` (Debian) |
| Python | `3.13.5` |
| Timezone dos registros | UTC e America/Sao_Paulo |

Evidência: `docs/_validation/logs/production-build/08-environment-final.txt`.

## Versões declaradas pelo projeto

| Pacote | Versão declarada |
| --- | --- |
| Phaser | `4.2.1` |
| TypeScript | `5.7.3` |
| Vite | `6.1.0` |
| Vitest | `3.0.5` |
| Playwright Test | `1.50.1` |
| `@types/node` | `22.10.10` |

As versões são exatas, sem `^` ou `~`.

## Paridade Node/npm

Foram adicionados:

- `package.json#packageManager = npm@10.9.2`;
- `package.json#engines.node = 22.16.x`;
- `package.json#engines.npm = 10.9.x`;
- `.nvmrc = 22.16.0`;
- `.node-version = 22.16.0`.

Isso elimina a ambiguidade que existia na entrada. A paridade com o ambiente remoto ainda precisa ser confirmada na configuração real do Netlify; a cópia local não contém `netlify.toml` e a configuração remota não foi modificada nem assumida.

## TypeScript e emissão de artefatos

- `tsconfig.app.json`: `noEmit: true`;
- `tsconfig.node.json`: `noEmit: true`;
- `tsconfig.core.json`: `noEmit: true`;
- o projeto usa project references apenas para organizar app e ferramentas;
- nenhum `vite.config.js`, `vite.config.d.ts`, `vitest.config.js`, `vitest.config.d.ts`, `playwright.config.js`, `playwright.config.d.ts` ou `*.tsbuildinfo` estava presente depois dos gates.

Foram adicionados:

- `scripts/audit-typescript-artifacts.mjs`;
- script npm `validate:artifacts`;
- regras correspondentes no `.gitignore`.

Resultado final: `npm run validate:artifacts` exit 0.

## Typecheck somente leitura

`scripts/check-readonly-typecheck.mjs` calcula hashes de source, testes, scripts, ferramentas, configs e manifests antes e depois de `npm run check`.

Na rodada final:

- o typecheck saiu com código 2 porque `vite/client` não estava instalado;
- **89 arquivos relevantes permaneceram byte a byte idênticos**;
- nenhum JS, declaração ou build info inesperado foi emitido.

Logo, a propriedade de somente leitura foi demonstrada mesmo com o comando bloqueado por dependências. O typecheck real ainda precisa ser repetido após `npm ci`.

## Limitações do ambiente

- `package-lock.json` ausente;
- DNS do registro npm indisponível (`EAI_AGAIN`);
- `node_modules` não pôde ser criado;
- Phaser/Vite/Vitest/Playwright reais não estavam disponíveis no projeto;
- Chromium existir no sistema não substitui `@playwright/test` nem o browser instalado pelo Playwright;
- nenhum `dist` foi gerado.
