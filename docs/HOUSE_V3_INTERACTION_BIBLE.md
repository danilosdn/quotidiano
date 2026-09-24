# House V3 — bíblia de interações

## Escala implementada

- objetos de cena: **54**;
- objetos interativos: **43**;
- ações registradas: **108**;
- pontos de aproximação alcançáveis: **43/43**;
- módulos de cômodo: 6.

## Arquitetura

`HouseObjectRegistry.ts` é a fonte única para posição, textura, collider, `approachPoint`, `actionPoint`, facing, prioridade e ações. `HouseRenderer` desenha e sincroniza estados; `HouseCollisionBuilder` deriva blockers; `homeInteractions.ts` deriva definições de interação; `HouseInteractionController` encaminha cada ação ao módulo do cômodo; `HouseActionSequenceRunner` executa passos físicos ordenados.

Passos suportados incluem face, alinhamento, pose, animação, modo do player, efeito visual, espera, passagem de tempo, sincronização, pulse do objeto, diálogo, autosave e devolução de controle.

## Interações por cômodo

| Cômodo | Objeto/ID | Ações | Approach | Facing | Estado persistente |
| --- | --- | --- | --- | --- | --- |
| Slaapkamer | `bedroom-window` / Raam en gordijnen | `open-window` — Raam openen<br>`close-window` — Raam sluiten<br>`toggle-curtains` — Gordijnen openen / sluiten<br>`look-outside` — Naar buiten kijken | (224, 144) | up | windowOpen |
| Slaapkamer | `bed` / Bed | `sit` — Op de rand zitten<br>`lie` — Gaan liggen<br>`sleep` — Slapen<br>`stand` — Opstaan<br>`make` — Bed opmaken | (184, 154) | left | bedMade |
| Slaapkamer | `nightstand` / Nachtkastje | `open-drawer` — Lade openen<br>`close-drawer` — Lade sluiten<br>`examine` — Bekijken | (185, 152) | up | nightstandOpen |
| Slaapkamer | `bedside-lamp` / Nachtlamp | `toggle` — Licht aan / uit | (185, 152) | up | — |
| Slaapkamer | `alarm-clock` / Wekker | `stop` — Uitzetten<br>`snooze` — Sluimeren<br>`set` — Tijd instellen | (185, 152) | up | alarmState |
| Slaapkamer | `wardrobe` / Kledingkast | `toggle` — Openen / sluiten<br>`dress` — Kleding kiezen<br>`store-clothes` — Kleding opbergen | (300, 184) | up | wardrobeOpen |
| Slaapkamer | `desk` / Bureau | `sit` — Gaan zitten<br>`write` — Schrijven<br>`stand` — Opstaan | (227, 258) | up | — |
| Slaapkamer | `laptop` / Laptop | `toggle` — Aan / uit<br>`email` — E-mail openen | (227, 258) | up | laptopOn |
| Slaapkamer | `backpack` / Rugzak | `take` — Pakken<br>`leave` — Neerzetten<br>`inspect` — Inhoud bekijken | (302, 250) | right | — |
| Badkamer | `bathroom-mirror` / Spiegel | `look` — Kijken<br>`hair` — Haar doen | (420, 164) | up | — |
| Badkamer | `bathroom-sink` / Wastafel | `wash-hands` — Handen wassen<br>`wash-face` — Gezicht wassen | (420, 169) | up | — |
| Badkamer | `toothbrush` / Tandenborstel | `take` — Pakken<br>`brush` — Tanden poetsen<br>`store` — Terugzetten | (455, 169) | up | — |
| Badkamer | `shower` / Douche | `shower` — Douchen | (492, 174) | right | showeredToday |
| Badkamer | `toilet` / Toilet | `use` — Gebruiken<br>`flush` — Doorspoelen | (454, 220) | left | — |
| Badkamer | `bathroom-shelf` / Badkamerkast | `open` — Openen<br>`take-products` — Verzorgingsproducten pakken<br>`close` — Sluiten | (506, 232) | right | — |
| Badkamer | `towel-rack` / Handdoek | `take` — Pakken<br>`use` — Afdrogen<br>`hang` — Ophangen | (468, 252) | down | — |
| Badkamer | `bathroom-bin` / Prullenbak | `discard` — Afval weggooien | (520, 252) | right | — |
| Keuken en eethoek | `oven` / Fornuis | `toggle` — Aan / uit<br>`cook` — Koken | (640, 174) | up | ovenOn |
| Keuken en eethoek | `kitchen-sink` / Aanrecht en gootsteen | `wash-hands` — Handen wassen<br>`wash-food` — Eten wassen<br>`wash-dishes` — Afwas doen | (718, 174) | up | — |
| Keuken en eethoek | `coffee` / Koffiezetapparaat | `brew` — Koffie zetten<br>`take` — Kopje pakken | (778, 174) | up | coffeeReady |
| Keuken en eethoek | `toaster` / Broodrooster | `toast` — Brood roosteren | (820, 174) | up | toastReady |
| Keuken en eethoek | `fridge` / Koelkast | `toggle` — Openen / sluiten<br>`take-breakfast` — Brood pakken<br>`put-back` — Terugzetten | (878, 184) | up | fridgeOpen |
| Keuken en eethoek | `kitchen-bin` / Afvalbak | `discard` — Afval weggooien | (872, 202) | right | — |
| Keuken en eethoek | `dining-table` / Eettafel | `place-breakfast` — Ontbijt neerzetten<br>`sit` — Gaan zitten<br>`eat` — Ontbijten<br>`drink` — Drinken<br>`stand` — Opstaan | (702, 328) | up | breakfastEaten |
| Keuken en eethoek | `kitchen-plant` / Keukenplant | `observe` — Bekijken<br>`water` — Water geven | (868, 318) | right | — |
| Woonkamer | `tv` / Televisie | `toggle` — Aan / uit<br>`watch` — Even kijken | (258, 411) | up | tvOn |
| Woonkamer | `bookshelf` / Boekenkast | `examine` — Bekijken<br>`take-book` — Boek pakken<br>`read-book` — Lezen<br>`return-book` — Terugzetten | (114, 395) | left | — |
| Woonkamer | `living-plant` / Kamerplant | `observe` — Bekijken<br>`water` — Water geven | (390, 414) | right | — |
| Woonkamer | `coffee-table` / Salontafel | `place-item` — Iets neerzetten<br>`take-item` — Iets pakken | (335, 470) | left | — |
| Woonkamer | `sofa` / Bank | `sit` — Zitten<br>`relax` — Ontspannen<br>`stand` — Opstaan | (258, 598) | up | — |
| Woonkamer | `living-lamp` / Staande lamp | `toggle` — Aan / uit | (380, 576) | right | livingLightOn |
| Woonkamer | `side-table` / Bijzettafel | `place-item` — Iets neerzetten<br>`take-item` — Iets pakken | (148, 565) | left | — |
| Hal en entree | `entry-console` / Halmeubel | `examine` — Bekijken<br>`place-item` — Iets neerleggen | (548, 432) | up | — |
| Hal en entree | `entry-mirror` / Halspiegel | `look` — Kijken<br>`hair` — Haar controleren | (626, 414) | up | — |
| Hal en entree | `keys` / Sleutels | `take` — Pakken<br>`leave` — Neerleggen | (548, 432) | up | — |
| Hal en entree | `mail` / Post | `take` — Brief pakken<br>`read` — Lezen<br>`store` — Opbergen | (548, 432) | up | mailRead |
| Hal en entree | `coat` / Jas | `wear` — Aantrekken<br>`remove` — Uittrekken<br>`hang` — Ophangen | (610, 540) | right | — |
| Hal en entree | `umbrella` / Paraplu | `take` — Pakken<br>`store` — Terugzetten | (610, 590) | right | — |
| Hal en entree | `front-door` / Voordeur | `open` — Openen<br>`close` — Sluiten<br>`unlock` — Ontgrendelen<br>`lock` — Vergrendelen<br>`leave-house` — Naar buiten | (582, 610) | down | doorLocked |
| Wasruimte | `washing-machine` / Wasmachine | `toggle` — Openen / sluiten<br>`load` — Was laden<br>`wash` — Programma starten<br>`remove` — Was uitnemen | (742, 510) | up | laundryState |
| Wasruimte | `laundry-shelf` / Wasplank | `take-detergent` — Wasmiddel pakken<br>`store` — Opbergen | (810, 465) | right | — |
| Wasruimte | `laundry-basket` / Wasmand | `add-clothes` — Kleding erin doen<br>`take-clothes` — Kleding pakken | (795, 570) | right | — |
| Wasruimte | `drying-rack` / Droogrek | `hang` — Was ophangen<br>`take` — Droge was pakken | (840, 620) | right | — |

## Fluxos Tier A

### Cama

Aproximação lateral → sentar/deitar por pose real → modo `SITTING`/`LYING` → dormir com fade/avanço de relógio → acordar e restaurar controle. O estado `bedMade` é persistente.

### Armário e roupa

Abrir/fechar altera a textura; escolher roupa atualiza `currentOutfit`; roupa pode ir para cesto/lavanderia e voltar. O estado aberto e roupa atual são salvos.

### Banho e higiene

O player entra no ponto de ação, usa pose/animação, recebe efeito de vapor/água, avança tempo e sai para um ponto seguro. Pia, rosto, mãos, escova, espelho e toalha têm ações separadas.

### Café da manhã

Pão sai da geladeira → torradeira produz toast → cafeteira produz caneca → itens passam por `HELD`/`ON_SURFACE` → mesa recebe o café da manhã → player senta, come e bebe → louça pode ser lavada/descartada quando aplicável.

### Sofá e TV

Sofá orientado para a TV, com sentar/relaxar/levantar. TV possui estado visual ligado/desligado e controle remoto físico.

### Entrada

Chaves começam no aparador/tigela, podem ser seguradas, guardadas, colocadas e usadas para trancar/destrancar. A porta externa responde, mas `StreetScene` continua bloqueada por escopo.

### Lavanderia

Cesto → roupa na mão → máquina abre/carrega → detergente → fecha/inicia → ciclo conclui por tempo de jogo → retirar → secar/guardar.

## Inventário físico

`InventoryManager` assegura mochila de oito slots e no máximo um item `HELD`. A camada `HousePortableItemLayout` atribui slots de superfície e atualiza tanto sprite quanto hotspot. Itens portáteis não permanecem visualmente na origem após mover; armários fechados ocultam seu conteúdo. Quando a mochila está cheia, trocar o item segurado falha em vez de soltar silenciosamente um objeto em `WORLD` sem posição.

## Estado seguro

Autosave ocorre após ações relevantes e periodicamente. Modos transitórios não são restaurados como se estivessem no meio da animação; snapshot inválido volta ao `safeResumePoint`. Sentar/deitar só é restaurado quando a posição está próxima do móvel correspondente.
