# Estrutura do projeto

## Código executável

- `src/game/scenes/`: cenas Phaser; Casa, Rua e Café continuam sendo os únicos mapas de gameplay.
- `src/game/entities/`: jogador e NPCs.
- `src/game/interactions/`: contratos e seleção de interações.
- `src/game/navigation/`: A*, colisões lógicas e recuperação de autowalk.
- `src/game/dialogue/`: tipos, dados e matching de intenção.
- `src/game/inventory/`, `persistence/`, `state/`: domínio e save.
- `src/game/audio/`: ponto reservado; o carregamento atual permanece no boot para não mudar comportamento.
- `src/game/config/`: configuração do Phaser.
- `src/ui/`: overlays DOM e estilos.

## Assets e fontes

- `public/assets/`: runtime atual da V1.1. Permanece estável nesta preparação.
- `public/assets/runtime/`: destino futuro de assets LimeZu selecionados/processados, separado por ambiente e tipo.
- `art-source/`: geradores da arte original atual; não é um destino de packs de terceiros.
- `vendor-assets/limezu/raw/`: packs completos extraídos, privados e ignorados pelo Git.
- `vendor-assets/limezu/selected/`: seleção mínima documentada antes do processamento.
- `incoming-assets/`: entrada privada de ZIPs; ignorada pelo Git.
- `references/concept-art/` e `references/protagonist/`: referências aprovadas, sem uso direto como mapas.

## Qualidade e documentação

- `tests/unit/`: lógica isolada.
- `tests/e2e/`: fluxos do jogo no navegador.
- `docs/`: decisões, auditorias, inventários e próximos passos.
- `scripts/`: futuras automações de inventário/conversão.

## Convenção de promoção de asset

`incoming-assets` → `vendor-assets/limezu/raw` → inventário/licença → shortlist em `selected` → processamento/atlas → `public/assets/runtime`.

Não pule etapas, não altere fontes raw e não promova um pack completo ao runtime.
