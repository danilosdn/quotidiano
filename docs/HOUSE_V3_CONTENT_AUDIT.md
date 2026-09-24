# House V3 — auditoria de arquitetura e conteúdo

Gerado sobre a árvore final local em 2026-09-24 UTC.

## Resumo

- `src/`: 50 arquivos, cerca de 4.256 linhas de texto/código;
- `tests/`: 15 arquivos, cerca de 619 linhas;
- objetos: 54;
- interações: 43;
- ações: 108;
- assets: 65;
- microcenários/intents/variações/diálogos: 12/30/95/60.

## Limites arquiteturais confirmados

- `HomeScene.ts` orquestra serviços e ciclo da cena; não contém a planta ou datasets de telefone;
- seis módulos de ações por cômodo;
- dados de diálogo, intenção, telefone e cenários separados;
- registro único para render/collider/interação;
- renderer e collision builder dedicados;
- save/state service separado;
- executor de sequências reutilizável;
- validação de topologia e assets executável sem Phaser.

## Módulos principais

```text
src/game/house/HouseLayout.ts
src/game/house/HouseObjectRegistry.ts
src/game/house/HouseRenderer.ts
src/game/house/HouseCollisionBuilder.ts
src/game/house/HouseInteractionController.ts
src/game/house/HouseStateService.ts
src/game/house/HouseValidator.ts
src/game/house/HousePortableItemLayout.ts
src/game/house/actions/
src/game/house/rooms/
```

## Resultado do boundary validator

64 arquivos de código/dados foram escaneados. Foram encontrados uma HomeScene, um UIController, seis módulos de cômodo, dois módulos de diálogo e um módulo de telefone. Falhas: zero.
