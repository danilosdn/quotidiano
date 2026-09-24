import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload(): void {
    this.load.image('floor-wood', '/assets/runtime/environment/floor_wood.png');
    this.load.image('floor-parquet', '/assets/runtime/environment/floor_parquet.png');
    this.load.image('floor-tile', '/assets/runtime/environment/floor_tile.png');
    this.load.image('wall-light', '/assets/runtime/environment/wall_light.png');
    this.load.image('bed', '/assets/runtime/objects/bed.png');
    this.load.image('wardrobe', '/assets/runtime/objects/wardrobe.png');
    this.load.image('shower', '/assets/runtime/objects/shower.png');
    this.load.image('bathroom-sink', '/assets/runtime/objects/bathroom_sink.png');
    this.load.image('toilet', '/assets/runtime/objects/toilet.png');
    this.load.image('sofa', '/assets/runtime/objects/sofa.png');
    this.load.image('tv', '/assets/runtime/objects/tv.png');
    this.load.image('floor-lamp', '/assets/runtime/objects/floor_lamp.png');
    this.load.image('bookshelf', '/assets/runtime/objects/bookshelf.png');
    this.load.image('washing-machine', '/assets/runtime/objects/washing_machine.png');
    this.load.image('kitchen-counter', '/assets/runtime/objects/kitchen_counter.png');
    this.load.image('dining-table', '/assets/runtime/objects/dining_table.png');
    this.load.image('dining-chair', '/assets/runtime/objects/dining_chair.png');
    this.load.image('breakfast-plate', '/assets/runtime/objects/breakfast_plate.png');
    this.load.image('coffee-serving', '/assets/runtime/objects/coffee_serving.png');
    this.load.spritesheet('fridge', '/assets/runtime/objects/fridge.png', { frameWidth: 96, frameHeight: 144 });
    this.load.spritesheet('oven', '/assets/runtime/objects/oven.png', { frameWidth: 48, frameHeight: 96 });
    this.load.spritesheet('coffee', '/assets/runtime/objects/coffee.png', { frameWidth: 48, frameHeight: 96 });
    this.load.spritesheet('toaster', '/assets/runtime/objects/toaster.png', { frameWidth: 48, frameHeight: 96 });
    this.load.spritesheet('front-door', '/assets/runtime/objects/front_door.png', { frameWidth: 96, frameHeight: 144 });
    this.load.spritesheet('player', '/assets/runtime/characters/player_quotidiano.png', { frameWidth: 48, frameHeight: 48 });
  }
  create(): void { this.scene.start('HomeScene'); }
}
