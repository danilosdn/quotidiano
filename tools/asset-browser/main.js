const assets = [
  ['HOUSE/structure','floor_wood.png','../../public/assets/runtime/environment/floor_wood.png','48×48','Modern Interiors 48×48'],
  ['HOUSE/structure','floor_parquet.png','../../public/assets/runtime/environment/floor_parquet.png','48×48','Modern Interiors 48×48'],
  ['HOUSE/structure','floor_tile.png','../../public/assets/runtime/environment/floor_tile.png','48×48','Modern Interiors 48×48'],
  ['HOUSE/structure','wall_light.png','../../public/assets/runtime/environment/wall_light.png','48×48','Modern Interiors 48×48'],
  ['HOUSE/bedroom','bed.png','../../public/assets/runtime/objects/bed.png','112×112','Modern Interiors 48×48'],
  ['HOUSE/bedroom','wardrobe.png','../../public/assets/runtime/objects/wardrobe.png','48×128','Modern Interiors 48×48'],
  ['HOUSE/bathroom','shower.png','../../public/assets/runtime/objects/shower.png','96×144','Modern Interiors 48×48'],
  ['HOUSE/bathroom','bathroom_sink.png','../../public/assets/runtime/objects/bathroom_sink.png','96×96','Modern Interiors 48×48'],
  ['HOUSE/bathroom','toilet.png','../../public/assets/runtime/objects/toilet.png','48×128','Modern Interiors 48×48'],
  ['HOUSE/kitchen','fridge.png','../../public/assets/runtime/objects/fridge.png','768×144 spritesheet','Modern Interiors 48×48'],
  ['HOUSE/kitchen','oven.png','../../public/assets/runtime/objects/oven.png','288×96 spritesheet','Modern Interiors 48×48'],
  ['HOUSE/kitchen','coffee.png','../../public/assets/runtime/objects/coffee.png','288×96 spritesheet','Modern Interiors 48×48'],
  ['HOUSE/kitchen','toaster.png','../../public/assets/runtime/objects/toaster.png','528×96 spritesheet','Modern Interiors 48×48'],
  ['HOUSE/kitchen','kitchen_counter.png','../../public/assets/runtime/objects/kitchen_counter.png','96×96','Modern Interiors 48×48'],
  ['HOUSE/kitchen','dining_table.png','../../public/assets/runtime/objects/dining_table.png','96×96','Modern Interiors 48×48'],
  ['HOUSE/kitchen','dining_chair.png','../../public/assets/runtime/objects/dining_chair.png','48×96','Modern Interiors 48×48'],
  ['HOUSE/kitchen','breakfast_plate.png','../../public/assets/runtime/objects/breakfast_plate.png','48×48','Modern Interiors 48×48'],
  ['HOUSE/kitchen','coffee_serving.png','../../public/assets/runtime/objects/coffee_serving.png','48×48','Modern Interiors 48×48'],
  ['HOUSE/living','sofa.png','../../public/assets/runtime/objects/sofa.png','96×48','Modern Interiors 48×48'],
  ['HOUSE/living','tv.png','../../public/assets/runtime/objects/tv.png','96×144','Modern Interiors 48×48'],
  ['HOUSE/living','floor_lamp.png','../../public/assets/runtime/objects/floor_lamp.png','48×128','Modern Interiors 48×48'],
  ['HOUSE/living','bookshelf.png','../../public/assets/runtime/objects/bookshelf.png','48×96','Modern Interiors 48×48'],
  ['HOUSE/entrance','front_door.png','../../public/assets/runtime/objects/front_door.png','768×144 spritesheet','Modern Interiors 48×48'],
  ['HOUSE/laundry','washing_machine.png','../../public/assets/runtime/objects/washing_machine.png','48×96','Modern Interiors 48×48'],
  ['CHARACTERS/player','player_quotidiano.png','../../public/assets/runtime/characters/player_quotidiano.png','2688×1968 spritesheet','Modern Interiors derivative']
];

const grid = document.querySelector('#grid');
const cat = document.querySelector('#category');
const q = document.querySelector('#q');

function render() {
  const category = cat.value;
  const search = q.value.toLowerCase();
  grid.innerHTML = assets
    .filter((asset) => (!category || asset[0].startsWith(category)) && (!search || asset[1].toLowerCase().includes(search)))
    .map((asset) => `<article class="card"><div class="preview"><img src="${asset[2]}" alt="${asset[1]}"></div><strong>${asset[1]}</strong><div class="meta">${asset[0]}<br>${asset[3]}<br>${asset[4]}<br>${asset[2]}</div></article>`)
    .join('');
}

cat.onchange = q.oninput = render;
render();
