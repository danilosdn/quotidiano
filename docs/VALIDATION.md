# Status de validação

Relatórios principais:

- [`PRODUCTION_BUILD_REPRODUCTION.md`](PRODUCTION_BUILD_REPRODUCTION.md)
- [`PACKAGE_LOCK_AUDIT.md`](PACKAGE_LOCK_AUDIT.md)
- [`BUILD_ENVIRONMENT.md`](BUILD_ENVIRONMENT.md)
- [`LOCAL_VS_PRODUCTION_BUILD.md`](LOCAL_VS_PRODUCTION_BUILD.md)
- [`HOUSE_V3_VALIDATION.md`](HOUSE_V3_VALIDATION.md)

Resumo real da rodada final:

| Comando | Exit |
| --- | ---: |
| `npm ci` | 1 |
| `npm run check` | 2 |
| `npm run check:core` | 0 |
| `npm test` | 127 |
| `npm run test:e2e` | 1 |
| `npm run build` | 2 |
| `npm run preview` | 127 |
| `npm run validate:local` | 0 |
| `npm run validate:artifacts` | 0 |

O conflito `HomeScene.renderer` foi corrigido e possui gate de regressão. O build de produção não é declarado aprovado: a entrada não contém lockfile, as dependências não puderam ser instaladas e o build parou em `vite/client`.
