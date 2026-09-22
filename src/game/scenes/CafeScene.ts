import Phaser from 'phaser';
import { WorldScene } from './WorldScene';
import { NPC } from '../entities/NPC';
import { ScriptedDialogueProvider } from '../dialogue/ScriptedDialogueProvider';
import cafeData from '../dialogue/data/cafe_sanne_morning.json';
import { DialogueScript } from '../dialogue/DialogueTypes';
import { worldState } from '../state/WorldState';
import { inventory } from '../inventory/InventoryManager';
import { SaveManager } from '../persistence/SaveManager';
import { CAFE_NAV, STREET_NAV } from './data/SceneNavigationData';

export class CafeScene extends WorldScene {
  private sanne!:NPC;
  private customer!:NPC;
  private coffeeSprite?:Phaser.GameObjects.Image;
  private menuBoard!:Phaser.GameObjects.Image;
  private displayCase!:Phaser.GameObjects.Image;
  private bin!:Phaser.GameObjects.Image;
  private door!:Phaser.GameObjects.Image;
  constructor(){super('CafeScene');}

  create():void{
    this.add.image(0,0,'cafe_floor').setOrigin(0).setDepth(-10000);
    this.add.image(0,0,'cafe_walls').setOrigin(0).setDepth(-9000);
    this.menuBoard=this.prop('menu_board',590,235,245,.88);
    this.prop('cafe_counter',1040,310,405);
    this.displayCase=this.prop('display',750,390,410,.95);
    this.prop('cafe_plant',1280,235,260,.82);
    this.prop('cafe_plant',190,270,290,.75);
    this.prop('lamp',410,175,180,.85);this.prop('lamp',990,175,180,.85);
    this.prop('cafe_table',420,620,630);this.prop('cafe_chair',345,680,685);this.prop('cafe_chair',495,680,685);
    this.prop('cafe_table',1030,625,635);this.prop('cafe_chair',955,685,690);this.prop('cafe_chair',1105,685,690);
    this.bin=this.prop('cafe_bin',1300,760,775,.9);
    this.door=this.prop('cafe_door',750,795,815,.9);

    this.setupWorld({width:CAFE_NAV.width,height:CAFE_NAV.height,spawn:CAFE_NAV.spawn,cameraZoom:1.1,locationName:'Café',time:'08:10',obstacles:CAFE_NAV.obstacles,ambient:'ambient_cafe'});

    this.sanne=new NPC(this,1080,320,'sanne','down');
    this.customer=new NPC(this,500,535,'customer','right');
    if(worldState.flag('cafeOrdered',false)&&!worldState.flag('coffeePicked',false)) this.coffeeSprite=this.prop('coffee_cup',965,395,420,.82);
    this.add.image(0,0,'cafe_fg').setOrigin(0).setDepth(9999);
    this.registerCafeInteractions();
  }

  private registerCafeInteractions():void{
    const a=CAFE_NAV.anchors;
    const provider=new ScriptedDialogueProvider(cafeData as DialogueScript);
    this.registerInteraction({id:'sanne',label:()=>worldState.flag('cafeOrdered',false)?'Falar com Sanne':'Pedir bebida',hotspot:{x:1080,y:400,radius:150},anchor:a.sanne,priority:115,...this.focusFeedback(this.sanne),trigger:()=>{
      if(worldState.flag('cafeOrdered',false)) return this.chatWithSanne();
      return this.dialogueAt(a.sanne,provider,e=>this.handleDialogueEffect(e),()=>this.sanne.face(this.faceToward(this.sanne,this.player)));
    }});
    this.registerInteraction({id:'menu',label:()=> 'Ler cardápio',hotspot:{x:590,y:300,radius:120},anchor:a.menu,priority:35,...this.focusFeedback(this.menuBoard),trigger:()=>this.simpleAnchored(a.menu,'pose_talk_up',520,()=>this.ui.toast('Koffie · thee · melk. O café custa 3 euros fictícios.',2500))});
    this.registerInteraction({id:'display',label:()=> 'Observar vitrine',hotspot:{x:750,y:440,radius:110},anchor:a.display,priority:35,...this.focusFeedback(this.displayCase),trigger:()=>this.simpleAnchored(a.display,'pose_talk_up',520,()=>this.ui.toast('Croissants e doces pequenos atrás do vidro.'))});
    this.registerInteraction({id:'coffee',label:()=> 'Pegar café',hotspot:{x:965,y:430,radius:105},anchor:a.coffee,priority:95,enabled:()=>worldState.flag('cafeOrdered',false)&&!worldState.flag('coffeePicked',false),trigger:()=>this.takeCoffee()});
    this.registerInteraction({id:'table-left',label:()=> 'Sentar',hotspot:{x:420,y:680,radius:130},anchor:a.tableLeft,priority:30,trigger:()=>this.sitTable(a.tableLeft,{x:345,y:680})});
    this.registerInteraction({id:'table-right',label:()=> 'Sentar',hotspot:{x:1030,y:685,radius:130},anchor:a.tableRight,priority:30,trigger:()=>this.sitTable(a.tableRight,{x:955,y:685})});
    this.registerInteraction({id:'customer',label:()=> 'Conversar',hotspot:{x:500,y:540,radius:110},anchor:a.customer,priority:105,...this.focusFeedback(this.customer),trigger:()=>this.chatWithCustomer()});
    this.registerInteraction({id:'bin',label:()=> 'Usar lixeira',hotspot:{x:1300,y:790,radius:90},anchor:a.bin,priority:20,...this.focusFeedback(this.bin),trigger:()=>this.simpleAnchored(a.bin,'pose_pick_right',450,()=>this.ui.toast('Nada para jogar fora agora.'))});
    this.registerInteraction({id:'exit',label:()=> 'Sair do café',hotspot:{x:750,y:820,radius:105},anchor:a.exit,priority:125,...this.focusFeedback(this.door),trigger:()=>this.exitCafe()});
  }

  private async chatWithSanne():Promise<void>{
    const a=CAFE_NAV.anchors.sanne;
    this.player.setState('PLAYER_INTERACTING');if(!(await this.walkTo(a))){this.player.free();return;}
    this.sanne.face(this.faceToward(this.sanne,this.player));this.player.pose('pose_talk_up','PLAYER_INTERACTING');this.ui.toast('Sanne sorri: “Is alles naar wens?” — Está tudo bem?',2400);await this.delay(650);this.player.free();
  }

  private async chatWithCustomer():Promise<void>{
    const a=CAFE_NAV.anchors.customer;
    this.player.setState('PLAYER_INTERACTING');if(!(await this.walkTo(a))){this.player.free();return;}
    this.customer.face(this.faceToward(this.customer,this.player));this.player.pose('pose_talk_left','PLAYER_INTERACTING');
    this.ui.toast('Cliente: “Lekker rustig vanmorgen, hè?” — Uma manhã tranquila.',2600);worldState.remember('customer','smallTalk',true);await this.delay(700);this.player.free();this.persistPosition();
  }

  private async exitCafe():Promise<void>{
    if(!(await this.walkTo(CAFE_NAV.anchors.exit)))return;
    await this.transitionTo('StreetScene',{x:STREET_NAV.anchors.cafe.x,y:340});
  }

  private async handleDialogueEffect(effect:string):Promise<void>{
    if(effect==='PAY_COFFEE'){
      if(worldState.data.balance>=3){worldState.data.balance-=3;this.playSfx('payment',.45);this.ui.toast(`Pagamento feito · saldo fictício €${worldState.data.balance.toFixed(2)}`);}
    }
    if(effect==='COFFEE_READY'){
      worldState.setFlag('cafeOrdered',true);worldState.setObjective('Pegue sua bebida no balcão.');this.ui.updateObjective();this.playSfx('coffee',.35);
      if(!this.coffeeSprite) this.coffeeSprite=this.prop('coffee_cup',965,395,420,.82);
    }
    SaveManager.save();
  }

  private async takeCoffee():Promise<void>{
    await this.simpleAnchored(CAFE_NAV.anchors.coffee,'pose_pick_up',650,()=>{
      if(inventory.add('coffee')){
        worldState.setFlag('coffeePicked',true);worldState.setObjective('Sente-se e beba seu café.');this.ui.updateObjective();this.coffeeSprite?.destroy();this.coffeeSprite=undefined;this.playSfx('pickup',.45);this.ui.toast('Koffie — o copo está quente nas mãos.');SaveManager.save();
      }
    });
  }

  private async sitTable(approach:{x:number;y:number;facing:'up'|'down'|'left'|'right'},seat:{x:number;y:number}):Promise<void>{
    this.player.setState('PLAYER_INTERACTING');if(!(await this.walkTo(approach))){this.player.free();return;}
    this.player.setPosition(seat.x,seat.y);this.player.pose('pose_sit_down','PLAYER_SITTING');this.playSfx('sit',.3);
    const stand=async()=>{this.activeExit=undefined;this.player.setPosition(approach.x,approach.y);this.player.free();this.persistPosition();};
    const drink=async()=>{
      if(!inventory.has('coffee')){await stand();return;}
      this.player.pose('pose_drink_down','PLAYER_INTERACTING');this.playSfx('coffee',.4);await this.delay(900);inventory.remove('coffee');worldState.setFlag('coffeeDrunk',true);worldState.setObjective('Você começou o dia. Explore ou volte para casa.');this.ui.updateObjective();this.ui.toast('Você termina o café. A conversa fica na memória, não como uma lição.');SaveManager.save();
      this.player.pose('pose_sit_down','PLAYER_SITTING');this.activeExit={label:'Levantar',run:stand};
    };
    this.activeExit=inventory.has('coffee')&&!worldState.flag('coffeeDrunk',false)?{label:'Beber café',run:drink}:{label:'Levantar',run:stand};
    this.persistPosition();
  }
}
