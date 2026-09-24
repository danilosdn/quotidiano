# House V3 — opções de planta

Todas as propostas preservam o canvas fixo de 960×720 e a escala visual baseada em 48×48. O objetivo é uma residência compacta, não uma mansão nem um mapa de demonstração.

## Opção A — núcleo social com circulação curta — **escolhida**

```text
┌──────────────────┬────────────┬───────────────────┐
│ QUARTO           │ BANHEIRO   │ COZINHA / JANTAR │
│ cama · armário   │ pia · box  │ linha funcional  │
│ estudo · janela  │ vaso       │ mesa             │
├───────────────┐  └─────┬──────┴──────┬────────────┤
│ SALA          │        │ HALL/ENTRADA│            │
│ sofá → mesa   │        │ aparador    │ LAVANDERIA │
│ de centro → TV├────────┤ porta       ├────────────┤
│ estante       │        │             │            │
└───────────────┴────────┴─────────────┴────────────┘
```

Dimensões aproximadas: quarto 6,75×5,25 tiles; banheiro 4,5×5,25; cozinha 6,75×6,9; sala 9,25×8; entrada 3,75×8; lavanderia 5×6,4.

Portas/passagens: quarto–sala, banheiro–hall, cozinha–hall, sala–hall, hall–lavanderia e porta externa ao sul.

Vantagens: rota curta, sala como ponto focal, cozinha/jantar conectada visualmente, privacidade razoável, lavanderia próxima da entrada/cozinha e bom uso do canvas. Riscos: hall estreito exige anchors precisos; relação quarto–sala é uma simplificação arquitetônica. Impacto no A*: baixa complexidade, seis regiões conectadas por aberturas largas.

## Opção B — corredor longitudinal

```text
┌───────────┬───────────┬──────────────────────────┐
│ QUARTO    │ BANHEIRO  │ COZINHA / JANTAR        │
├───────────┴─────┬─────┴──────────────────────────┤
│ CORREDOR LONGO  │                                │
├─────────────────┴────────────┬────────┬───────────┤
│ SALA                         │ HALL   │ LAVAND.  │
└──────────────────────────────┴────────┴───────────┘
```

Vantagens: adjacências residenciais clássicas e portas fáceis de entender. Riscos: corredor consome área, recria vazios sem função e reduz espaço de sala. Impacto no A*: simples, mas com gargalo central e maior distância média.

## Opção C — sala/cozinha abertas com ala íntima

```text
┌──────────────┬───────────────┬────────────────────┐
│ QUARTO       │ BANHEIRO      │ COZINHA ABERTA     │
├──────────────┴───────────────┤                    │
│ SALA + JANTAR INTEGRADOS                          │
│ sofá → TV · mesa · bancada                        │
├──────────────────────────────┬─────────┬───────────┤
│                              │ ENTRADA │ LAVAND.   │
└──────────────────────────────┴─────────┴───────────┘
```

Vantagens: sensação contemporânea, ótima legibilidade e espaço social forte. Riscos: grande área aberta volta a exigir preenchimento; colisões de cozinha/sala ficam menos claras; mais trabalho de câmera e profundidade. Impacto no A*: poucas portas, mas muitos blockers internos.

## Decisão

A Opção A foi escolhida por equilibrar plausibilidade, circulação, densidade visual e compatibilidade com os assets. O registro final está em `src/game/house/HouseLayout.ts`; objetos, colliders e anchors estão em `HouseObjectRegistry.ts`. `validateHouseDefinition()` confirmou todos os cômodos conectados e 43/43 pontos de aproximação alcançáveis.

![Prévia técnica da planta escolhida](./_validation/layout/house-v3-layout-preview.png)

> A imagem acima é uma prévia técnica gerada do registro. Ela não é um screenshot do Phaser.
