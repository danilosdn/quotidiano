# Inventário LimeZu para Casa V2

Auditoria executada em 23/09/2026 por `node scripts/audit-limezu-assets.mjs`.

| Métrica | Resultado |
| --- | --- |
| Arquivos raw indexados | 93.657 |
| PNG | 91.247 |
| GIF | 2.256 |
| Arquivos em árvores 48×48 | 31.044 |
| Packs | Modern Interiors, Modern Exteriors e RPG Maker MV Exteriors |

## Conteúdo confirmado

Modern Interiors contém 16×16, 32×32 e 48×48; para a Casa, a base escolhida será 48×48. Há sheets, singles com/sem sombra, autotiles/room builder, GIFs e spritesheets animados. As categorias confirmadas incluem Bedroom, Bathroom, Kitchen, Living Room, Condominium, Library, Clothing Store e Grocery Store.

Objetos animados 48×48 confirmados: portas, geladeiras, fornos, gavetas, pia de cozinha, pia de banheiro, banheira e micro-ondas. Os assets raw permanecem em `vendor-assets/limezu/raw/moderninteriors-win/`.

## Cobertura por cômodo

| Cômodo | Recursos reais localizados |
| --- | --- |
| Quarto | sheets Bedroom, singles, livros, luminárias, cama, janela e elementos de vestuário |
| Banheiro | sheets Bathroom, pias, banheiras, portas e armários animados |
| Cozinha | sheets Kitchen, forno, geladeira, gavetas, micro-ondas, pias e objetos de mercado |
| Sala | sheets Living Room, TV, sofá/poltrona, mesa, estante e decoração |
| Entrada | portas, janelas, objetos de condomínio e itens de vestuário |
| Lavanderia | categoria Condominium e itens de household; seleção específica depende de revisão visual na galeria |

Abra `tools/asset-browser/index.html` após rodar a auditoria para filtrar previews. O arquivo JSON gerado é local e ignorado pelo Git.
