import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor(){super('BootScene');}
  preload():void{
    const a='assets/';
    this.load.atlas('protagonist',`${a}characters/protagonist.png`,`${a}characters/protagonist.json`);
    this.load.atlas('npcs',`${a}npc/npcs.png`,`${a}npc/npcs.json`);
    this.load.atlas('pip',`${a}npc/pip.png`,`${a}npc/pip.json`);
    const images:Record<string,string>={
      home_floor:'home/base_floor.png',home_walls:'home/walls_back.png',home_fg:'home/foreground.png',bed:'home/bed.png',sofa:'home/sofa.png',coffee_table:'home/coffee_table.png',dining_table:'home/dining_table.png',chair:'home/chair.png',fridge:'home/fridge.png',fridge_open:'home/fridge_open.png',kitchen_counter:'home/kitchen_counter.png',wardrobe:'home/wardrobe.png',wardrobe_open:'home/wardrobe_open.png',plant:'home/plant.png',home_door:'home/door.png',home_door_open:'home/door_open.png',shower:'home/shower.png',vanity:'home/vanity.png',keys:'home/keys.png',backpack:'home/backpack.png',phone:'home/phone.png',wallet:'home/wallet.png',home_coffee:'home/coffee_cup.png',
      street_ground:'street/base_ground.png',street_buildings:'street/buildings_back.png',street_fg:'street/foreground.png',street_player_house:'street/player_house.png',street_cafe_facade:'street/cafe_facade.png',street_flower_bed:'street/flower_bed.png',street_mailbox:'street/mailbox.png',street_fence:'street/fence.png',street_lamp:'street/street_lamp.png',bike_rack:'street/bike_rack.png',bench:'street/bench.png',bike:'street/bike.png',tree:'street/tree.png',bus_sign:'street/bus_sign.png',cafe_board:'street/cafe_board.png',outdoor_table:'street/outdoor_table.png',street_cafe_door:'street/cafe_door.png',
      cafe_floor:'cafe/base_floor.png',cafe_walls:'cafe/walls_back.png',cafe_fg:'cafe/foreground.png',cafe_counter:'cafe/counter.png',display:'cafe/display.png',menu_board:'cafe/menu_board.png',cafe_table:'cafe/table.png',cafe_chair:'cafe/chair.png',cafe_plant:'cafe/plant.png',lamp:'cafe/lamp.png',coffee_cup:'cafe/coffee_cup.png',cafe_door:'cafe/door.png',cafe_bin:'cafe/bin.png'
    };
    Object.entries(images).forEach(([k,v])=>this.load.image(k,a+v));
    for(const key of ['step','door','pickup','sit','coffee','payment','ambient_home','ambient_street','ambient_cafe']) this.load.audio(key,`${a}audio/${key}.wav`);
    const g=this.add.graphics(); g.fillStyle(0xf1e6d0,1);g.fillRect(0,0,1280,720); const t=this.add.text(640,350,'QUOTIDIANO',{fontFamily:'system-ui',fontSize:'34px',color:'#30473d'}).setOrigin(.5); this.load.on('progress',(p:number)=>t.setText(`QUOTIDIANO\n${Math.round(p*100)}%`).setAlign('center'));
  }
  create():void{this.scene.start('TitleScene');}
}
