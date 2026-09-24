# QUOTIDIANO — handoff House V3 corrigida

## Etapa atual

Casa V3 local implementada e validada estruturalmente. Rua e Café continuam bloqueados.

## Fonte

A árvore vem de `QUOTIDIANO_HOUSE_V3_CONTINUED.zip` e foi modificada diretamente. Não há `.git` nesta entrega. `docs/GIT_LOG.txt` é apenas histórico textual herdado, não evidência de operações atuais.

## O que funciona no código/validação local

- layout data-driven com 54 objetos e 43 interações;
- 43/43 approach points alcançáveis;
- frames de movimento corrigidos;
- 108 ações encaminhadas para handlers;
- inventário físico, surfaces e save V2;
- 12 microcenários, 30 intenções, 95 variações e 60 diálogos;
- 65 assets válidos;
- 9/9 testes offline aprovados;
- checagem arquitetural sem falhas.

## O que não foi possível provar neste ambiente

- execução real com Phaser 4.2.1;
- `npm ci`, Vitest, Playwright, build e preview;
- screenshots reais;
- bundle size/FPS/console/network.

Motivo: `package-lock.json` ausente na entrada e DNS/acesso ao registro npm indisponível. O lockfile não foi fabricado.

## Próximos comandos

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

Depois, revisar `screenshots/`, corrigir apenas problemas observados e repetir todos os gates.

## Segurança remota

Nesta execução: nenhum commit, push, pull, merge, rebase, reset, PR, deploy ou alteração remota. O resultado é exclusivamente um ZIP local.
