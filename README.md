# QUOTIDIANO — House V3 corrigida

**QUOTIDIANO** é um life simulator linguístico 2D: a aprendizagem de holandês surge da necessidade de viver, compreender pessoas e agir no cotidiano. Esta entrega trabalha **somente a Casa**; Rua e Café continuam deliberadamente fora do escopo.

## Estado desta entrega

A Casa foi reorganizada como um apartamento compacto e data-driven. O projeto contém **54 objetos**, **43 pontos de interação**, **108 ações domésticas**, **12 microcenários**, **30 intenções locais**, **95 variações de frase**, **60 nós de diálogo** e **65 assets runtime**.

Principais mudanças:

- planta compacta com seis ambientes conectados e sem rótulos de debug em produção;
- posição visual, collider, ponto de aproximação e interação derivados de um único registro;
- correção dos frames de movimento e idle para cima, baixo, esquerda e direita;
- controladores de ações separados por cômodo;
- sequências físicas para cama, banho, café da manhã, sofá/TV, entrada e lavanderia;
- inventário físico com `WORLD`, `HELD`, `IN_BAG`, `ON_SURFACE` e roupa equipada;
- save schema V2 com migração e restauração segura;
- `IntentMatcher`, `HintSystem`, TTS opcional e respostas digitadas integrados ao runtime;
- modo debug por `F3` ou `?debug`, sem poluir a apresentação normal.

## Controles

| Entrada | Ação |
| --- | --- |
| `WASD` / setas | movimentação manual |
| clique | caminhar; clique próximo de objeto usa o `approachPoint` |
| `E` / `Espaço` | interagir |
| `I` | abrir/fechar mochila |
| `P` | abrir/fechar telefone |
| `Esc` | fechar painel ou cancelar rota |
| `F3` | alternar debug de layout/navegação |

## Instalação e execução

As versões declaradas são Phaser `4.2.1`, Vite `6.1.0`, TypeScript `5.7.3`, Vitest `3.0.5` e Playwright `1.50.1`.

> **Limitação verificável desta cópia:** o ZIP anexado não continha `package-lock.json`, e o ambiente de correção não conseguiu resolver o registro npm. Um lockfile não foi inventado. Em uma máquina com acesso ao npm, gere-o e valide imediatamente:

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

Durante desenvolvimento:

```bash
npm run dev
```

## Validação sem rede

A entrega inclui um gate local que não substitui Phaser/Vitest/Playwright reais, mas valida código, topologia, conteúdo e assets quando dependências não estão disponíveis:

```bash
npm run validate:local
```

Resultado registrado nesta entrega: TypeScript do núcleo aprovado; app e testes analisados com stubs temporários de forma/sintaxe; **43/43** interações alcançáveis; **9/9** testes offline aprovados; **65/65** assets válidos; nenhum limite arquitetural violado. Veja `docs/HOUSE_V3_VALIDATION.md` e `docs/_validation/logs/validate-local.txt`.

## Estrutura principal

```text
src/game/house/                 planta, registro, renderer, colisões, validação e estado
src/game/house/rooms/           ações separadas por cômodo
src/game/house/actions/         executor de sequências físicas
src/data/                       diálogos, intenções, telefone e microcenários
public/assets/runtime/          somente subset runtime necessário
screenshots/                    reservada para capturas reais após instalar dependências
docs/_validation/              logs e prévias técnicas claramente identificadas
tests/unit/ e tests/e2e/        testes Vitest e Playwright preparados
```

## Evidências e documentação

Comece por:

- `docs/HOUSE_V3_INPUT_AUDIT.md`
- `docs/HOUSE_V3_LAYOUT_OPTIONS.md`
- `docs/PLAYER_FRAME_MAP.md`
- `docs/HOUSE_V3_INTERACTION_BIBLE.md`
- `docs/HOUSE_V3_LANGUAGE_CONTENT.md`
- `docs/HOUSE_V3_VALIDATION.md`
- `docs/ASSET_MANIFEST.md`
- `docs/REFERENCE_COMPARISON.md`

A imagem `docs/_validation/layout/house-v3-layout-preview.png` é uma **prévia técnica gerada do registro**, não um screenshot do Phaser.

## Licença dos assets

Os assets LimeZu selecionados permanecem sujeitos à licença incluída em `vendor-assets/limezu/selected/Modern_Interiors_LICENSE.txt`. Crédito obrigatório: **LimeZu — limezu.itch.io**. O ZIP final não inclui os packs completos nem arquivos raw de terceiros.
