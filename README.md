# QUOTIDIANO — Vertical Slice V1.1

> **Aprenda holandês vivendo pequenas histórias.**

V1.1 do vertical slice 2D **Casa ↔ Rua residencial ↔ Café**. Esta rodada preserva a arquitetura da V1 e concentra mudanças em navegação, anchors, seleção de interação, recuperação de autowalk e identidade visual dos três ambientes existentes. Nenhum mapa novo foi adicionado.

O projeto continua em Phaser **exatamente 4.2.1**, TypeScript e Vite. O mundo é Phaser; HTML/CSS é usado apenas para overlays transitórios.

## O que mudou na V1.1

- retorno Rua → Casa alinhado visualmente à porta da residência, com hotspot, anchor, spawn e colisão coerentes;
- anchor de Lotte movido para área caminhável, sem conflito com o banco;
- `InteractionDefinition.priority` e desempate por distância normalizada para hotspots concorrentes;
- detector de stuck do autowalk: ~680 ms sem deslocamento → replanejamento, no máximo 2 tentativas → cancelamento limpo e mensagem `Não consigo chegar até lá.`;
- dados de navegação/anchors centralizados em `SceneNavigationData.ts`;
- validação de desenvolvimento para impedir registro de interaction anchor não caminhável;
- testes de anchors verificam tanto `isWalkable()` quanto existência de rota desde o spawn;
- A* ajustado para escolher célula de grade alcançável perto do ponto exato, evitando falsos negativos em anchors válidos;
- prompt contextual `E — …` acompanha o personagem;
- feedback visual por foco/tint, posicionamento no anchor, pose e orientação de NPC;
- rua refeita em camadas com pavimentação, ciclovia, tijolo, jardins, flores, cercas, postes, bicicletário, banco, sinalização e fachadas variadas;
- casa externa nº **17** com porta diferenciada, jardim, caixa de correio, luz e soleira;
- café **De Kleine Boon** com letreiro `KOFFIE · CAFÉ`, toldo, vitrine, quadro de calçada e mesa externa;
- protagonista e NPCs ganharam novos atlases coerentes entre si, mantendo a identidade textual do protagonista (cabelo preto espetado, jaqueta amarela, camiseta verde, calça escura e tênis claros).

## Referências visuais disponíveis nesta sessão

O pedido da V1.1 menciona design boards e uma spritesheet de referência “anexados agora”, porém esses arquivos **não ficaram disponíveis no conjunto de anexos acessível ao projeto**. Estavam disponíveis o ZIP V1, o briefing textual e assets/previews gerados na V1. Por isso:

- nenhuma concept art foi usada como background;
- a melhoria visual V1.1 é original e mantém assets independentes/camadas reais;
- o protagonista foi refinado segundo a identidade especificada, mas **não é possível afirmar que o atlas deriva da spritesheet externa ausente**;
- um passe de fidelidade às referências ainda deve ser feito quando esses arquivos forem efetivamente fornecidos.

## Execução

```bash
npm ci
npm run dev
```

Comandos de QA/build:

```bash
npm run check
npm test
npm run test:e2e
npm run build
npm run preview
```

## Controles

- `WASD` / setas: movimento
- clique no chão: click-to-move
- `E` / `Espaço`: interação
- `I`: mochila
- `Esc`: fechar interface / encerrar ação quando aplicável

Entrada manual cancela autowalk. O prompt contextual aparece próximo ao personagem quando existe uma interação relevante.

## Testes V1.1 preparados

`tests/e2e/vertical-slice.spec.ts` cobre:

- Casa → Rua → Casa → Rua, repetido 5 vezes;
- Pieter;
- Lotte;
- Pip;
- banco;
- click-to-move ao redor do banco;
- tentativa de destino sobre o banco sem autowalk infinito;
- Rua → Café → Rua → Casa;
- pedido e coleta de café;
- geração de `home_v11.png`, `street_v11.png`, `cafe_v11.png`, `lotte_interaction.png` e `house_entry.png` **somente a partir do jogo real em execução**.

## Estado da validação desta entrega

A lógica pura foi realmente compilada e executada offline, incluindo todos os anchors, A*, prioridade de interação, stuck detector, inventário, intenção e serialização de save. O parse sintático de todo o TypeScript também passou.

O comando `npm ci` foi realmente tentado após remover `node_modules`, mas o ambiente não conseguiu acessar `registry.npmjs.org` (`EAI_AGAIN`). Sem as dependências locais, `npm run check`, `npm test`, `npm run test:e2e` e `npm run build` foram executados e falharam pela ausência dos pacotes correspondentes. Portanto **não há afirmação de que os testes de navegador passaram, nem screenshots V1.1 falsos**.

Veja `docs/VALIDACAO.md` e `docs/validation-logs/` para os resultados exatos.
