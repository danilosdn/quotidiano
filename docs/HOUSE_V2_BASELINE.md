# House V2 — baseline

Data: 23/09/2026. Branch: `feature/house-v2-limezu`.

| Comando | Resultado |
| --- | --- |
| `npm ci` | PASS — 60 pacotes instalados |
| `npm run check` | PASS |
| `npm test` | PASS — 7 arquivos e 14 testes |
| `npm run build` | PASS |

O build emitiu apenas o aviso do Vite para o chunk JavaScript principal acima de 500 kB (`1,739.88 kB`, `398.68 kB` gzip). Não bloqueia a baseline e não foi tratado nesta tarefa de Casa.
