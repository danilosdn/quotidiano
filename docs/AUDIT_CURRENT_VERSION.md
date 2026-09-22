# Auditoria da versão atual

Data: 22/09/2026. Escopo: preparação estrutural, sem reconstrução visual/funcional.

## Estado encontrado

- Vertical slice Phaser com três cenas jogáveis: `HomeScene`, `StreetScene` e `CafeScene`.
- Código TypeScript em `src/game` e overlays em `src/ui`.
- Assets originais locais em `public/assets/`, gerados pelos scripts de `art-source/`.
- Testes Vitest no nível raiz de `tests/` e um fluxo Playwright em `tests/e2e/`.
- Não havia repositório Git, `AGENTS.md`, `references/`, `incoming-assets/` nem área isolada para packs de terceiros.

## Dependências auditadas

| Componente | Declaração | Instalação atual |
| --- | --- | --- |
| Node | não fixado no projeto | `v24.15.0` |
| npm | não fixado no projeto | `11.12.1` |
| Phaser | `4.2.1` | `4.2.1` |
| Vite | `7.1.7` | `7.1.7` |
| TypeScript | `5.9.2` | `5.9.2` |
| Vitest | `3.2.4` | `3.2.4` |
| Playwright | `@playwright/test 1.55.0` | `1.55.0` |

`package-lock.json` usa lockfile v3. O manifesto e a raiz do lockfile coincidem, e `npm install --package-lock-only --ignore-scripts --dry-run` informou que a árvore está atualizada. Nenhuma regeneração do lockfile foi necessária; `npm audit fix --force` não foi executado.

## Riscos e observações

- Não há campo `engines` no manifesto; a versão de Node suportada não está codificada.
- Há assets runtime originais versionados; não foram movidos para evitar mudança de caminho/carregamento nesta tarefa.
- A suíte E2E gera screenshots quando executada; estes resultados são ignorados pelo Git.
- Nenhum LimeZu estava presente para auditar resolução, licença específica ou conteúdo.

## Validação executada nesta preparação

| Comando | Resultado observado |
| --- | --- |
| `npm ci` | PASS — 60 pacotes instalados |
| `npm run check` | PASS após correção de assinaturas compatíveis com `Phaser.Sprite` em `Player` |
| `npm test` | PASS — 7 arquivos, 14 testes unitários |
| `npm run build` | PASS — build Vite concluído; aviso de bundle JS acima de 500 kB |
| `npm run test:e2e` | BLOQUEADO — Playwright iniciou, mas o Chromium `1187` não está instalado localmente |

O E2E não representa falha confirmada do fluxo do jogo: nenhum teste chegou a abrir o navegador. Para executá-lo, instale o navegador correspondente com `npx playwright install chromium` em ambiente autorizado e rode o comando novamente.
