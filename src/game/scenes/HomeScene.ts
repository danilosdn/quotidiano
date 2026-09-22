import Phaser from 'phaser';
import { WorldScene } from './WorldScene';
import { worldState } from '../state/WorldState';
import { inventory } from '../inventory/InventoryManager';
import { SaveManager } from '../persistence/SaveManager';
import { HOME_NAV, STREET_NAV } from './data/SceneNavigationData';

export class HomeScene extends WorldScene {
  private keySprite?: Phaser.GameObjects.Image;
  private fridge?: Phaser.GameObjects.Image;
  private wardrobe?: Phaser.GameObjects.Image;
  private door?: Phaser.GameObjects.Image;
  private fridgeOpen=false;
  private wardrobeOpen=false;

  constructor(){super('HomeScene');}

  create():void{
    this.add.image(0,0,'home_floor').setOrigin(0).setDepth(-10000);
    this.add.image(0,0,'home_walls').setOrigin(0).setDepth(-9000);

    this.prop('bed',305,251,251);
    this.wardrobe=this.prop('wardrobe',512,255,255);
    this.prop('sofa',845,302,320);
    this.prop('coffee_table',865,426,426);
    this.prop('plant',1155,244,245);
    this.prop('shower',255,705,705);
    this.prop('vanity',412,722,722);
    this.prop('backpack',593,665,665);
    this.prop('kitchen_counter',1050,624,660);
    this.fridge=this.prop('fridge',1277,650,650);
    this.prop('dining_table',915,787,790);
    this.prop('chair',858,835,835);
    this.prop('chair',1023,825,825);
    this.door=this.prop('home_door',638,795,810);
    if(!worldState.flag('keysCollected',false)) this.keySprite=this.prop('keys',655,666,670,.75);
    this.add.image(0,0,'home_fg').setOrigin(0).setDepth(9999);

    this.setupWorld({width:HOME_NAV.width,height:HOME_NAV.height,spawn:HOME_NAV.spawn,cameraZoom:1.08,locationName:'Casa',time:'07:30',obstacles:HOME_NAV.obstacles,ambient:'ambient_home'});
    this.registerHomeInteractions();
    if(worldState.flag('coffeeDrunk',false)) this.ui.toast('Você voltou para casa. O dia continua no seu ritmo.',2200);
  }

  private registerHomeInteractions():void{
    const a=HOME_NAV.anchors;
    this.registerInteraction({id:'bed',label:()=> 'Cama',hotspot:{x:305,y:285,radius:155},anchor:a.bed,priority:45,trigger:()=>this.showActions('Cama',[
      {label:'Sentar na borda',run:()=>this.bedInteraction('sit')},{label:'Deitar',run:()=>this.bedInteraction('lie')},{label:'Dormir',run:()=>this.bedInteraction('sleep')}
    ])});

    this.registerInteraction({id:'sofa',label:()=> 'Sentar',hotspot:{x:845,y:330,radius:145},anchor:a.sofa,priority:35,trigger:()=>this.sitOnSofa()});
    this.registerInteraction({id:'dining-chair',label:()=> 'Sentar à mesa',hotspot:{x:845,y:840,radius:120},anchor:a.table,priority:35,trigger:()=>this.sitAtTable()});

    this.registerInteraction({id:'wardrobe',label:()=>this.wardrobeOpen?'Fechar armário':'Abrir armário',hotspot:{x:512,y:300,radius:120},anchor:a.wardrobe,priority:30,trigger:async()=>{
      await this.simpleAnchored(a.wardrobe,'pose_pick_down',380,()=>{
        this.wardrobeOpen=!this.wardrobeOpen; this.wardrobe?.setTexture(this.wardrobeOpen?'wardrobe_open':'wardrobe');
        if(this.wardrobeOpen) this.ui.toast('Jaqueta, camiseta e algumas roupas. Trocar roupa virá depois.');
      });
    }});

    this.registerInteraction({id:'fridge',label:()=>this.fridgeOpen?'Fechar geladeira':'Abrir geladeira',hotspot:{x:1275,y:690,radius:125},anchor:a.fridge,priority:40,trigger:async()=>{
      await this.simpleAnchored(a.fridge,'pose_pick_down',360,()=>{
        this.fridgeOpen=!this.fridgeOpen; this.fridge?.setTexture(this.fridgeOpen?'fridge_open':'fridge');
        if(this.fridgeOpen) this.ui.toast('Ovos, leite e alguns ingredientes simples.');
      });
    }});

    this.registerInteraction({id:'stove',label:()=> 'Cozinhar',hotspot:{x:1105,y:675,radius:105},anchor:a.stove,priority:45,trigger:()=>this.simpleAnchored(a.stove,'pose_cook_up',1050,()=>this.ui.toast('Você prepara um café da manhã simples.'))});
    this.registerInteraction({id:'sink-kitchen',label:()=> 'Usar pia',hotspot:{x:985,y:675,radius:120},anchor:a.sink,priority:40,trigger:()=>this.simpleAnchored(a.sink,'pose_wash_right',900,()=>this.ui.toast('Você lava as mãos.'))});
    this.registerInteraction({id:'coffee-maker',label:()=> 'Preparar café',hotspot:{x:1190,y:670,radius:90},anchor:a.coffeeMaker,priority:35,trigger:()=>this.simpleAnchored(a.coffeeMaker,'pose_cook_up',900,()=>{this.playSfx('coffee',.35);this.ui.toast('O cheiro de café toma a cozinha.');})});

    this.registerInteraction({id:'shower',label:()=> 'Tomar banho',hotspot:{x:255,y:735,radius:125},anchor:a.shower,priority:45,trigger:()=>this.takeShower()});
    this.registerInteraction({id:'bath-sink',label:()=> 'Usar pia',hotspot:{x:412,y:745,radius:100},anchor:a.bathSink,priority:35,trigger:()=>this.simpleAnchored(a.bathSink,'pose_wash_up',800,()=>this.ui.toast('Água fria nas mãos. Pronto para sair.'))});
    this.registerInteraction({id:'mirror',label:()=> 'Olhar no espelho',hotspot:{x:412,y:680,radius:95},anchor:a.mirror,priority:20,trigger:()=>this.simpleAnchored(a.mirror,'pose_talk_left',500,()=>this.ui.toast('Como você se sente hoje?'))});

    this.registerInteraction({id:'backpack',label:()=> 'Abrir mochila',hotspot:{x:593,y:690,radius:105},anchor:a.backpack,priority:50,trigger:async()=>{
      if(!(await this.walkTo(a.backpack)))return; this.player.setState('PLAYER_INVENTORY'); this.ui.showInventory(()=>this.player.free());
    }});

    this.registerInteraction({id:'keys',label:()=> 'Pegar chaves',hotspot:{x:655,y:666,radius:92},anchor:a.keys,priority:90,enabled:()=>!worldState.flag('keysCollected',false),...(this.keySprite?this.focusFeedback(this.keySprite):{}),trigger:()=>this.takeKeys()});
    this.registerInteraction({id:'exit',label:()=> 'Sair',hotspot:{x:638,y:815,radius:110},anchor:a.exit,priority:100,...(this.door?this.focusFeedback(this.door):{}),trigger:()=>this.exitHome()});
  }

  private async bedInteraction(kind:'sit'|'lie'|'sleep'):Promise<void>{
    const approach=HOME_NAV.anchors.bed;
    this.player.setState('PLAYER_INTERACTING');
    if(!(await this.walkTo(approach))){this.player.free();return;}
    if(kind==='sit'){
      this.player.setPosition(310,326);this.player.pose('pose_sit_down','PLAYER_SITTING');
      this.activeExit={label:'Levantar',run:async()=>{this.activeExit=undefined;this.player.setPosition(approach.x,approach.y);this.player.free();this.persistPosition();}};
    } else {
      this.player.setPosition(315,270);this.player.pose('pose_lie_right','PLAYER_LYING');
      if(kind==='sleep'){
        this.cameras.main.fadeOut(420,35,40,35); await this.delay(480); this.cameras.main.fadeIn(420,35,40,35); this.ui.toast('Você descansa por alguns instantes. O ciclo completo de horário virá depois.');
      }
      this.activeExit={label:'Levantar da cama',run:async()=>{this.activeExit=undefined;this.player.setPosition(approach.x,approach.y);this.player.free();this.persistPosition();}};
    }
    this.persistPosition();
  }

  private async sitOnSofa():Promise<void>{
    const anchor=HOME_NAV.anchors.sofa;
    this.player.setState('PLAYER_INTERACTING'); if(!(await this.walkTo(anchor))){this.player.free();return;}
    this.player.setPosition(845,350);this.player.pose('pose_sit_down','PLAYER_SITTING'); this.playSfx('sit',.35); this.ui.toast('Você relaxa por um momento.');
    this.activeExit={label:'Levantar',run:async()=>{this.activeExit=undefined;this.player.setPosition(anchor.x,anchor.y);this.player.free();this.persistPosition();}};
  }

  private async sitAtTable():Promise<void>{
    const anchor=HOME_NAV.anchors.table;
    this.player.setState('PLAYER_INTERACTING'); if(!(await this.walkTo(anchor))){this.player.free();return;}
    this.player.setPosition(858,812);this.player.pose('pose_sit_right','PLAYER_SITTING');this.playSfx('sit',.3);this.ui.toast('A cozinha está silenciosa e iluminada pela manhã.');
    this.activeExit={label:'Levantar',run:async()=>{this.activeExit=undefined;this.player.setPosition(anchor.x,anchor.y);this.player.free();this.persistPosition();}};
  }

  private async takeShower():Promise<void>{
    await this.anchoredPose(HOME_NAV.anchors.shower,'pose_shower_down','PLAYER_INTERACTING','Sair do banho',async()=>{
      const mist=this.add.graphics().setDepth(9000); for(let i=0;i<10;i++){mist.fillStyle(0xd9f3f1,.35);mist.fillCircle(220+Math.random()*70,660+Math.random()*100,5+Math.random()*8);} (this as any)._showerMist=mist; this.ui.toast('Água quente e um pouco de vapor.');
    },()=>{(this as any)._showerMist?.destroy();});
  }

  private async takeKeys():Promise<void>{
    await this.simpleAnchored(HOME_NAV.anchors.keys,'pose_pick_down',520,()=>{
      inventory.add('keys'); worldState.setFlag('keysCollected',true); worldState.setObjective('Saia de casa e vá até o café.'); this.keySprite?.destroy(); this.playSfx('pickup',.5); SaveManager.save(); this.ui.updateObjective(); this.ui.toast('Sleutels — chaves. Agora você pode sair.');
    });
  }

  private async exitHome():Promise<void>{
    if(!inventory.has('keys')){this.ui.toast('Você procura as chaves. Melhor pegá-las antes de sair.');return;}
    if(!(await this.walkTo(HOME_NAV.anchors.exit)))return;
    this.door?.setTexture('home_door_open'); await this.delay(180); await this.transitionTo('StreetScene',STREET_NAV.spawn);
  }
}
