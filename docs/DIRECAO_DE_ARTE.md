# Direção de arte — V1.1

## Referências disponíveis

Os design boards e a spritesheet externa citados no pedido V1.1 não ficaram disponíveis entre os arquivos acessíveis desta sessão. A V1.1 não afirma fidelidade a arquivos ausentes. O passe visual usa a direção textual obrigatória e mantém a possibilidade de substituir/refinar cada asset sem reconstruir a lógica.

## Rua

A rua foi refeita sem background conceitual achatado. Continua composta por base, arquitetura, props e foreground independentes, com colisões separadas.

Elementos adicionados/refinados:

- pavimentação com mais detalhe;
- faixa/ciclovia avermelhada;
- fachadas de tijolos com variação;
- jardins, floreiras e vegetação;
- pequenas cercas;
- postes escuros;
- bicicletário;
- banco e ponto de ônibus;
- iluminação e detalhes de fachada.

### Casa do jogador

A residência é reconhecível sem HUD: nº **17**, porta verde diferenciada, jardim, caixa de correio, luz de entrada, janela e soleira.

### Café externo

O café **De Kleine Boon** usa letreiro próprio, `KOFFIE · CAFÉ`, toldo, vidro/vitrine, plantas, quadro na calçada, mesa externa e luz mais quente.

## Personagens

O protagonista preserva a identidade textual exigida: cabelo preto espetado, jaqueta amarela, camiseta verde, calça escura e tênis claros. O atlas possui idle/walk em quatro direções e poses de interação usadas pelas cenas.

Pieter, Lotte, Sanne e cliente receberam silhuetas, cabelos, roupas e paletas distintas dentro da mesma escala/linguagem do protagonista.

## Pipeline

`art-source/generate_v11_assets.py` gera o passe V1.1 mantendo PNGs separados. Objetos interativos, NPCs e protagonista não são pré-renderizados nos cenários.
