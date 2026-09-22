import Phaser from 'phaser';
import { Facing } from '../interactions/InteractionTypes';

export class NPC extends Phaser.GameObjects.Sprite {
  constructor(scene:Phaser.Scene,x:number,y:number,readonly npcId:string,facing:Facing='down'){
    super(scene,x,y,'npcs',`${npcId}_${facing}`); scene.add.existing(this); this.setOrigin(.5,.86); this.setDepth(y);
  }
  face(direction:Facing):void{this.setFrame(`${this.npcId}_${direction}`);}
}
