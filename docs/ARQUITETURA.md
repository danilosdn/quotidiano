# Arquitetura — V1.1

A V1.1 preserva a arquitetura da V1: Phaser controla o mundo, física, sprites, câmera e cenas; DOM fica restrito a UI transitória.

## Cenas

Somente três mapas de gameplay continuam implementados:

- `HomeScene`
- `StreetScene`
- `CafeScene`

`WorldScene` concentra input, câmera, colisões, autowalk, interação, autosave, transições e prompt contextual.

## Navegação e anchors

`src/game/scenes/data/SceneNavigationData.ts` é a fonte única para:

- dimensões de mapa;
- spawn;
- obstáculos;
- anchors de interação.

`NavigationManager` usa A* em grid de 32 px, blockers expandidos pelo raio aproximado do personagem e prevenção de corte de quinas. Na V1.1, o ponto de início/destino é associado à célula caminhável mais próxima **que também tenha segmento caminhável até o ponto exato**, evitando anchors válidos que ficavam associados a uma célula bloqueada.

Em desenvolvimento, `WorldScene.registerInteraction()` falha imediatamente se a interação não tiver anchor ou se `navigation.isWalkable(anchor)` for falso.

## Recuperação de autowalk

`AutoWalkStuckDetector` acompanha deslocamento durante `PLAYER_AUTOWALK`:

1. cerca de 680 ms tentando andar com deslocamento menor que 0,9 px;
2. recalcula rota para o destino original;
3. permite no máximo duas tentativas de replanejamento;
4. se continuar bloqueado ou não houver rota, cancela o path, retorna a `PLAYER_FREE` e informa `Não consigo chegar até lá.`.

Nenhum teleporte é usado para resolver stuck. O ajuste final para o anchor só ocorre quando o jogador já chegou a menos de 24 px do ponto de interação.

## Seleção de interação

`InteractionDefinition` passou a aceitar `priority`. A seleção considera:

1. maior prioridade;
2. menor distância normalizada pelo raio do hotspot;
3. menor distância absoluta.

Portas e NPCs têm prioridade maior que props secundários. Isso evita que banco/Pip/Lotte disputem a ação errada quando seus raios se aproximam.

## Estado do jogador

`PLAYER_FREE`, `PLAYER_AUTOWALK`, `PLAYER_INTERACTING`, `PLAYER_SITTING`, `PLAYER_LYING`, `PLAYER_DIALOGUE`, `PLAYER_TRANSITION`, `PLAYER_INVENTORY`.

## Save

O schema continua `saveVersion: 1`, armazenado em `localStorage`. Dependências e versões do `package.json` não foram alteradas nesta rodada; apenas o script de regeneração de arte inclui o passe V1.1.
