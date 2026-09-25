# HOUSE_V3_ASSET_COVERAGE

Blueprint de referência utilizado: `HOUSE_V3_APPROVED_BLUEPRINT.png`.

Critérios:
- **EXACT**: existe asset LimeZu adequado e usado diretamente.
- **SIMILAR**: existe variante suficientemente próxima.
- **COMPOSITE**: resultado montado com mais de um asset/prop já existente.
- **MISSING**: não localizado asset adequado após busca real.

| Elemento | Status | Asset | Source path | Runtime path | Observação |
|---|---|---|---|---|---|
| Cama do quarto | EXACT | Bed | Modern Interiors / Bedroom Singles | `public/assets/runtime/objects/bed.png` | Cabeceira encostada na parede esquerda/superior, conforme blueprint. |
| Criado-mudo + luminária | COMPOSITE | Side table + bedside lamp | Living Room Singles 45 + derivado interno | `public/assets/runtime/objects/side_table.png`, `bedside_lamp_on/off.png` | Montado como composição funcional ao lado da cama. |
| Janela do quarto | EXACT | Bedroom window | Bedroom Singles 119 | `public/assets/runtime/objects/bedroom_window.png` | Centralizada sobre a escrivaninha. |
| Escrivaninha + notebook | COMPOSITE | Desk + laptop | Living Room Singles 29 + prop interno | `public/assets/runtime/objects/desk.png`, `laptop.png` | Posicionados sob a janela, conforme blueprint. |
| Guarda-roupa | EXACT | Wardrobe | Bedroom Singles 538–539 | `public/assets/runtime/objects/wardrobe_closed_v3.png`, `wardrobe_open_v3.png` | Encostado na parede direita. |
| Pia + espelho do banheiro | COMPOSITE | Bathroom sink + bathroom mirror | Bathroom Singles | `public/assets/runtime/objects/bathroom_sink.png`, `bathroom_mirror.png` | Mantidos como par funcional. |
| Chuveiro | EXACT | Shower | Bathroom Singles | `public/assets/runtime/objects/shower.png` | Colocado no topo direito do banheiro. |
| Vaso sanitário | EXACT | Toilet | Bathroom Singles | `public/assets/runtime/objects/toilet.png` | Faixa de aproximação livre à frente. |
| Estante/apoio do banheiro | EXACT | Bathroom shelf | Bathroom Singles 83 | `public/assets/runtime/objects/bathroom_shelf.png` | Usada para itens decorativos/armazenamento. |
| Cozinha linear superior | COMPOSITE | Oven + kitchen counter + coffee + toaster + fridge | Kitchen Singles | `public/assets/runtime/objects/oven.png`, `kitchen_counter.png`, `coffee.png`, `toaster.png`, `fridge.png` | Reconstitui a sequência fogão → bancada/pia → pequenos eletros → geladeira. |
| Mesa de jantar | EXACT | Dining table | Kitchen Singles | `public/assets/runtime/objects/dining_table.png` | Centralizada no cômodo. |
| Cadeiras da mesa | SIMILAR | Dining chair | Living Room Singles | `public/assets/runtime/objects/dining_chair.png` | Projeto atual usa 2 cadeiras; blueprint ilustra 4. |
| Sofá | EXACT | Sofa | Living Room Singles | `public/assets/runtime/objects/sofa.png` | Orientado para a TV. |
| TV / rack | EXACT | TV | Living Room Singles | `public/assets/runtime/objects/tv.png` | Posicionada na parede superior da sala. |
| Mesa de centro | EXACT | Coffee table | Living Room Singles 51 | `public/assets/runtime/objects/coffee_table.png` | Mantida entre sofá e TV. |
| Estante da sala | EXACT | Bookshelf | Living Room Singles 122 | `public/assets/runtime/objects/bookshelf.png` | Encostada na parede esquerda. |
| Luminária de piso | EXACT | Floor lamp | Living Room Singles 86 | `public/assets/runtime/objects/floor_lamp.png` | Aproximada à posição do blueprint. |
| Aparador da entrada | EXACT | Entry console | Living Room Singles 19 | `public/assets/runtime/objects/entry_console.png` | Utilizado para chaves e correspondência. |
| Chaves / correspondência | COMPOSITE | Key bowl + keys + mail | Props internos | `public/assets/runtime/objects/key_bowl.png`, `keys.png`, `mail.png` | Conjunto funcional sobre o aparador. |
| Cabide/casaco na entrada | SIMILAR | Coat | Prop interno | `public/assets/runtime/objects/coat.png` | Simula cabide vertical na parede lateral. |
| Sapatos na entrada | SIMILAR | Shoes | Prop interno | `public/assets/runtime/objects/shoes.png` | Substitui uma sapateira dedicada. |
| Tapete de entrada | EXACT | Doormat | Prop interno | `public/assets/runtime/objects/doormat.png` | Mantido diante da porta principal. |
| Máquina de lavar | EXACT | Washing machine | Bathroom/Laundry asset | `public/assets/runtime/objects/washing_machine.png` | Posição alinhada ao blueprint. |
| Secadora | SIMILAR | Washing machine reused as dryer stand-in | Bathroom/Laundry asset | `public/assets/runtime/objects/washing_machine.png` | Não há sprite específico de secadora; foi usada variante similar. |
| Estante de lavanderia | EXACT | Bathroom shelf | Bathroom Singles 83 | `public/assets/runtime/objects/bathroom_shelf.png` | Usada para detergentes e apoio. |
| Cesto de roupa | EXACT | Laundry basket | Bathroom Singles 95 | `public/assets/runtime/objects/laundry_basket.png` | Mantido na metade inferior esquerda da lavanderia. |
| Varal / rack de secagem | SIMILAR | Towel rack | Bathroom Singles 143 | `public/assets/runtime/objects/towel_rack.png` | Reaproveitado como drying rack vertical. |
| Tanque / pia de serviço | SIMILAR | Bathroom sink | Bathroom Singles | `public/assets/runtime/objects/bathroom_sink.png` | Usado como utilidade visual equivalente. |

Resumo: a planta foi reconstruída majoritariamente com assets existentes do pack/runtime. Os principais pontos não exatos foram tratados por **SIMILAR** ou **COMPOSITE**, sem introdução de sprites externos novos.
