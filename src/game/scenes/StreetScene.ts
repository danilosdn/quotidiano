import Phaser from 'phaser';
import { WorldScene } from './WorldScene';
import { NPC } from '../entities/NPC';
import { ScriptedDialogueProvider } from '../dialogue/ScriptedDialogueProvider';
import pieterData from '../dialogue/data/pieter_morning.json';
import lotteData from '../dialogue/data/lotte_morning.json';
import { DialogueScript } from '../dialogue/DialogueTypes';
import { worldState } from '../state/WorldState';
import { SaveManager } from '../persistence/SaveManager';
import { HOME_NAV, STREET_NAV } from './data/SceneNavigationData';

export class StreetScene extends WorldScene {
  private pieter!:NPC;
  private lotte!:NPC;
  private pip!:Phaser.GameObjects.Sprite;
  private houseFacade!:Phaser.GameObjects.Image;
  private cafeFacade!:Phaser.GameObjects.Image;
  private bench!:Phaser.GameObjects.Image;
  private bikeRack!:Phaser.GameObjects.Image;
  private busSign!:Phaser.GameObjects.Image;
  constructor(){super('StreetScene');}

  create():void{
    this.add.image(0,0,'street_ground').setOrigin(0).setDepth(-10000);
    this.add.image(0,0,'street_buildings').setOrigin(0).setDepth(-9000);

    // Architecture and props remain independent production layers.
    this.houseFacade=this.prop('street_player_house',300,132,238);
    this.cafeFacade=this.prop('street_cafe_facade',2165,134,240);
    this.prop('street_flower_bed',176,266,282,.92);
    this.prop('street_flower_bed',427,266,282,.88);
    this.prop('street_mailbox',470,286,315,.82);
    this.prop('street_fence',112,266,286,.9);
    this.prop('street_fence',488,266,286,.9);
    this.prop('street_lamp',1030,282,352,.92);
    this.prop('street_lamp',1952,282,352,.92);
    this.bikeRack=this.prop('bike_rack',890,323,348,.96);
    this.bench=this.prop('bench',1160,327,350);
    this.busSign=this.prop('bus_sign',1765,285,352,.82);
    this.prop('cafe_board',2025,337,365,.88);
    this.prop('outdoor_table',2292,338,368,.86);
    this.prop('tree',490,236,365,.86);
    this.prop('tree',1595,230,362,.84);
    this.prop('tree',865,850,938,.9);
    this.prop('tree',1865,850,938,.88);

    this.setupWorld({width:STREET_NAV.width,height:STREET_NAV.height,spawn:STREET_NAV.spawn,cameraZoom:.93,locationName:'Rua residencial',time:'08:00',obstacles:STREET_NAV.obstacles,ambient:'ambient_street'});

    this.pieter=new NPC(this,610,330,'pieter','right');
    this.lotte=new NPC(this,1450,332,'lotte','left');
    this.pip=this.add.sprite(1530,354,'pip','idle_left').setOrigin(.5,.82).setDepth(354);
    this.add.image(0,0,'street_fg').setOrigin(0).setDepth(9999);
    this.registerStreetInteractions();
  }

  private registerStreetInteractions():void{
    const a=STREET_NAV.anchors;
    const pieterProvider=new ScriptedDialogueProvider(pieterData as DialogueScript);
    this.registerInteraction({id:'pieter',label:()=> 'Conversar com Pieter',hotspot:{x:610,y:338,radius:120},anchor:a.pieter,priority:110,...this.focusFeedback(this.pieter),trigger:()=>this.dialogueAt(a.pieter,pieterProvider,async e=>{
      if(e==='MET_PIETER'){
        worldState.setFlag('metPieter',true);worldState.remember('pieter','met',true);worldState.setObjective('Caminhe até o café da esquina.');this.ui.updateObjective();SaveManager.save();
      }
    },()=>this.pieter.face(this.faceToward(this.pieter,this.player))) });

    const lotteProvider=new ScriptedDialogueProvider(lotteData as DialogueScript);
    this.registerInteraction({id:'lotte',label:()=> 'Conversar com Lotte',hotspot:{x:1450,y:340,radius:108},anchor:a.lotte,priority:110,...this.focusFeedback(this.lotte),trigger:()=>this.dialogueAt(a.lotte,lotteProvider,async e=>{
      if(e==='PET_PERMISSION'){worldState.remember('lotte','petPermission',true);SaveManager.save();}
    },()=>this.lotte.face(this.faceToward(this.lotte,this.player))) });

    this.registerInteraction({id:'pip',label:()=> 'Fazer carinho em Pip',hotspot:{x:1530,y:355,radius:88},anchor:a.pip,priority:85,...this.focusFeedback(this.pip),trigger:()=>this.petDog()});
    this.registerInteraction({id:'bench',label:()=> 'Sentar',hotspot:{x:1160,y:340,radius:116},anchor:a.bench,priority:30,...this.focusFeedback(this.bench),trigger:()=>this.sitBench()});
    this.registerInteraction({id:'bike',label:()=> 'Observar bicicleta',hotspot:{x:890,y:330,radius:100},anchor:a.bike,priority:20,...this.focusFeedback(this.bikeRack),trigger:()=>this.observeAt(a.bike,'pose_talk_up','Uma fiets bem cuidada. Pedalar ficará para uma próxima etapa.')});
    this.registerInteraction({id:'bus',label:()=> 'Ler ponto de ônibus',hotspot:{x:1765,y:335,radius:102},anchor:a.bus,priority:25,...this.focusFeedback(this.busSign),trigger:()=>this.observeAt(a.bus,'pose_talk_right','Station · Centrum · Markt')});
    this.registerInteraction({id:'house',label:()=> 'Entrar em casa',hotspot:{x:300,y:292,radius:96},anchor:a.house,priority:125,trigger:()=>this.enterHouse()});
    this.registerInteraction({id:'cafe',label:()=> 'Entrar no café',hotspot:{x:2165,y:300,radius:112},anchor:a.cafe,priority:125,trigger:()=>this.enterCafe()});
  }

  private async observeAt(anchor:{x:number;y:number;facing:'up'|'down'|'left'|'right'},frame:string,text:string):Promise<void>{
    await this.simpleAnchored(anchor,frame,520,()=>this.ui.toast(text,2400));
  }

  private async enterHouse():Promise<void>{
    if(!(await this.walkTo(STREET_NAV.anchors.house)))return;
    this.houseFacade.setTint(0xfff3d2);await this.delay(120);this.houseFacade.clearTint();
    await this.transitionTo('HomeScene',{x:HOME_NAV.anchors.exit.x,y:HOME_NAV.anchors.exit.y});
  }

  private async enterCafe():Promise<void>{
    if(!(await this.walkTo(STREET_NAV.anchors.cafe)))return;
    worldState.setObjective(worldState.flag('coffeeDrunk',false)?'O dia continua. Explore ou volte para casa.':'Peça uma bebida em holandês.');this.ui.updateObjective();SaveManager.save();
    this.cafeFacade.setTint(0xfff0c6);await this.delay(120);this.cafeFacade.clearTint();
    await this.transitionTo('CafeScene',{x:750,y:810});
  }

  private async petDog():Promise<void>{
    const anchor=STREET_NAV.anchors.pip;
    this.player.setState('PLAYER_INTERACTING');
    if(!(await this.walkTo(anchor))){this.player.free();return;}
    this.player.pose('pose_pet_up','PLAYER_INTERACTING');this.pip.setFrame('happy_down');
    this.ui.toast('Pip abana o rabo. “Brave hond.”'); await this.delay(950); this.pip.setFrame('idle_down');this.player.free();worldState.remember('pip','petted',true);this.persistPosition();
  }

  private async sitBench():Promise<void>{
    const anchor=STREET_NAV.anchors.bench;
    this.player.setState('PLAYER_INTERACTING');if(!(await this.walkTo(anchor))){this.player.free();return;}
    this.player.setPosition(1160,347);this.player.pose('pose_sit_down','PLAYER_SITTING');this.cameras.main.zoomTo(1.02,500);this.playSfx('sit',.3);this.ui.toast('Bicicletas passam ao longe. A rua parece acordar devagar.');
    this.activeExit={label:'Levantar',run:async()=>{this.activeExit=undefined;this.player.setPosition(anchor.x,anchor.y);this.player.free();this.cameras.main.zoomTo(.93,350);this.persistPosition();}};
  }
}
