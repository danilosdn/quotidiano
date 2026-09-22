# Assets — V1.1

Todos os assets incluídos continuam locais/originais e separados por função. Nenhuma concept art foi usada como mapa plano.

## Estrutura

- `public/assets/home/`: casa interna e props;
- `public/assets/street/`: chão, arquitetura externa, casa nº 17, café externo, mobiliário e vegetação;
- `public/assets/cafe/`: interior do café e props;
- `public/assets/characters/`: atlas do protagonista;
- `public/assets/npc/`: atlas de NPCs e Pip;
- `public/assets/audio/`: SFX/ambiências.

## Passe V1.1

`art-source/generate_v11_assets.py` refina rua, fachadas, protagonista e NPCs. `npm run art` executa os geradores na ordem correta.

O atlas do protagonista contém idle nas quatro direções, 8 frames de caminhada por direção e poses utilizadas por cama, sofá/mesa, pickup, carinho, bebida, pia, cozinha, conversa e banho. O atlas de NPCs contém Pieter, Lotte, Sanne e cliente nas quatro orientações.
