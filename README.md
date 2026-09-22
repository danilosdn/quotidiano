# QUOTIDIANO

Vertical slice de aprendizado de holandês em Phaser: Casa, Rua residencial e Café. Esta revisão prepara o repositório para uma próxima reconstrução visual e funcional, sem criar mapas, alterar a jogabilidade ou substituir assets existentes.

## Stack

- Phaser `4.2.1`
- TypeScript `5.9.2`
- Vite `7.1.7`
- Vitest `3.2.4`
- Playwright `1.55.0`

## Começar

```bash
npm ci
npm run dev
```

## Verificação

```bash
npm run check
npm test
npm run test:e2e
npm run build
```

## Organização

- Código e contratos: `src/game/` e `src/ui/`
- Runtime atual estável: `public/assets/`
- Futuro runtime selecionado: `public/assets/runtime/`
- Packs LimeZu privados: `vendor-assets/limezu/raw/` (ignorado pelo Git)
- Materiais recebidos: `incoming-assets/` (ignorado pelo Git)
- Referências aprovadas: `references/`
- Documentação de preparação: `docs/PROJECT_STRUCTURE.md`, `docs/ASSETS.md`, `docs/LIMEZU_INVENTORY.md` e `docs/AUDIT_CURRENT_VERSION.md`

Leia `AGENTS.md` antes de qualquer alteração. Não avance para reconstrução visual nem crie mapas novos sem a aprovação de Casa, Rua e Café.
