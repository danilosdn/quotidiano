# Próximos passos — requerem aprovação

1. Adicionar os ZIPs LimeZu licenciados a `incoming-assets/` e informar pacote/versão/licença.
2. Extrair e inventariar os packs, priorizando variantes 48×48 quando disponíveis.
3. Aprovar uma shortlist pequena para Casa, Rua, Café, Pieter, Lotte, Pip e Sanne.
4. Definir se os assets atuais serão mantidos, substituídos gradualmente ou usados como fallback.
5. Promover apenas os assets aprovados para `public/assets/runtime/`, com metadados de fonte.
6. Só após aprovação visual/funcional de Casa, Rua e Café, planejar qualquer mapa novo.

Antes de nova fase, execute `npm ci`, `npm run check`, `npm test`, `npm run test:e2e` e `npm run build` em ambiente com navegadores Playwright disponíveis. Registre apenas os resultados efetivamente observados.
