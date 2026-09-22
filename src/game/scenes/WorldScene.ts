import Phaser from 'phaser';
import { Player, PlayerState } from '../entities/Player';
import { InteractionManager } from '../interactions/InteractionManager';
import { InteractionDefinition, AnchorPoint, Facing } from '../interactions/InteractionTypes';
import { NavigationManager, Point, RectObstacle } from '../navigation/NavigationManager';
import { UIController } from '../../ui/UIController';
import { SaveManager } from '../persistence/SaveManager';
import { worldState, SceneKey } from '../state/WorldState';
import { ScriptedDialogueProvider } from '../dialogue/ScriptedDialogueProvider';

export interface WorldSetup {
  width:number; height:number; spawn:{x:number;y:number}; cameraZoom:number; locationName:string; time:string;
  obstacles: RectObstacle[]; ambient?: string;
}

export abstract class WorldScene extends Phaser.Scene {
  protected player!: Player;
  protected ui!: UIController;
  protected interactions = new InteractionManager();
  protected navigation!: NavigationManager;
  protected obstacles: RectObstacle[]=[];
  protected setup!: WorldSetup;
  protected activeExit?: {label:string; run:()=>void|Promise<void>};
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private currentInteraction: InteractionDefinition | null=null;
  private focusedInteraction: InteractionDefinition | null=null;
  private ambient?: Phaser.Sound.BaseSound;
  private ambientStarted=false;

  protected setupWorld(setup:WorldSetup):void{
    this.setup=setup; this.obstacles=setup.obstacles;
    this.physics.world.setBounds(0,0,setup.width,setup.height);
    this.cameras.main.setBounds(0,0,setup.width,setup.height);
    this.ui=new UIController(); this.ui.setLocation(setup.locationName,setup.time); this.ui.updateObjective();
    const saved=worldState.data.scene===this.scene.key ? worldState.data.position : setup.spawn;
    this.navigation=new NavigationManager(setup.width,setup.height,setup.obstacles,32,18);
    const safe=this.navigation.nearestWalkable(saved) ?? setup.spawn;
    this.player=new Player(this,safe.x,safe.y);
    this.player.onStep=()=>this.playSfx('step',.22);
    this.player.configureAutoWalk(
      target=>this.navigation.findPath({x:this.player.x,y:this.player.y},target),
      ()=>this.ui.toast('Não consigo chegar até lá.')
    );
    this.cameras.main.startFollow(this.player,true,.11,.11); this.cameras.main.setZoom(setup.cameraZoom);
    this.createPhysicalObstacles(setup.obstacles);
    this.bindInput();
    if (import.meta.env.DEV) {
      (window as any).__QUOTIDIANO__ = {
        state: () => ({ scene: this.scene.key, x: this.player.x, y: this.player.y, playerState: this.player.state, interaction:this.currentInteraction?.id ?? null, save: structuredClone(worldState.data) }),
        walkTo: (x:number,y:number) => this.startAutoWalk({x,y},false),
        interact: () => this.tryInteract(),
        walkable: (x:number,y:number) => this.navigation.isWalkable({x,y})
      };
    }
    worldState.setScene(this.scene.key as SceneKey,{x:this.player.x,y:this.player.y});
    if(setup.ambient && this.cache.audio.exists(setup.ambient)) this.ambient=this.sound.add(setup.ambient,{loop:true,volume:.18});
    const unlock=()=>this.startAmbient(); this.input.once('pointerdown',unlock); this.input.keyboard?.once('keydown',unlock);
    this.time.addEvent({delay:2000,loop:true,callback:()=>{ if(this.player && this.player.state!=='PLAYER_TRANSITION') this.persistPosition(); }});
    this.events.once('shutdown',()=>{this.focusedInteraction?.onBlur?.();this.ambient?.stop(); this.persistPosition();});
  }

  private createPhysicalObstacles(obstacles:RectObstacle[]):void{
    for(const o of obstacles){
      const r=this.add.rectangle(o.x,o.y,o.width,o.height,0x000000,0).setOrigin(0);
      this.physics.add.existing(r,true); this.physics.add.collider(this.player,r);
    }
  }

  private bindInput():void{
    if(!this.input.keyboard) return;
    this.cursors=this.input.keyboard.createCursorKeys();
    this.keys=this.input.keyboard.addKeys('W,A,S,D,E,SPACE,I,ESC') as Record<string,Phaser.Input.Keyboard.Key>;
    this.keys.E.on('down',()=>void this.tryInteract()); this.keys.SPACE.on('down',()=>void this.tryInteract());
    this.keys.I.on('down',()=>this.toggleInventory()); this.keys.ESC.on('down',()=>this.handleEscape());
    this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{
      if(pointer.button!==0 || !['PLAYER_FREE','PLAYER_AUTOWALK'].includes(this.player.state) || this.ui.dialogueVisible() || this.ui.inventoryVisible() || this.ui.actionsVisible()) return;
      this.startAutoWalk({x:pointer.worldX,y:pointer.worldY});
    });
  }

  update(_time:number,delta:number):void{
    if(!this.player) return;
    if(this.player.state==='PLAYER_FREE'||this.player.state==='PLAYER_AUTOWALK'){
      const left=this.cursors?.left?.isDown||this.keys?.A?.isDown; const right=this.cursors?.right?.isDown||this.keys?.D?.isDown;
      const up=this.cursors?.up?.isDown||this.keys?.W?.isDown; const down=this.cursors?.down?.isDown||this.keys?.S?.isDown;
      const vx=(right?1:0)-(left?1:0),vy=(down?1:0)-(up?1:0);
      if(vx||vy) this.player.manual(vx,vy); else if(this.player.state==='PLAYER_FREE') this.player.manual(0,0);
      this.player.updateAuto(delta);
    }
    this.player.setDepth(this.player.y);
    this.currentInteraction=this.activeExit?null:this.interactions.nearest(this.player.x,this.player.y);
    this.updateFocusedInteraction(this.currentInteraction);
    const promptPosition=this.promptPosition();
    if(this.activeExit) this.ui.setPrompt(`E — ${this.activeExit.label}`,promptPosition);
    else if(this.currentInteraction && (this.player.state==='PLAYER_FREE'||this.player.state==='PLAYER_AUTOWALK')) this.ui.setPrompt(`E — ${this.currentInteraction.label()}`,promptPosition);
    else this.ui.setPrompt(null);
  }

  protected registerInteraction(item:InteractionDefinition):void{
    if(import.meta.env.DEV){
      if(!item.anchor) throw new Error(`[${this.scene.key}] interaction "${item.id}" is missing an anchor`);
      if(!this.navigation.isWalkable(item.anchor)) throw new Error(`[${this.scene.key}] interaction anchor "${item.id}" is not walkable at ${item.anchor.x},${item.anchor.y}`);
      if(!this.navigation.findPath(this.setup.spawn,item.anchor).length) throw new Error(`[${this.scene.key}] interaction anchor "${item.id}" has no route from the scene spawn`);
    }
    this.interactions.register(item);
  }

  protected prop(key:string,x:number,y:number,depthY?:number,scale=1):Phaser.GameObjects.Image{
    const obj=this.add.image(x,y,key).setScale(scale); obj.setDepth(depthY??y); return obj;
  }

  protected focusFeedback(target:Phaser.GameObjects.Image|Phaser.GameObjects.Sprite):Pick<InteractionDefinition,'onFocus'|'onBlur'>{
    return {
      onFocus:()=>target.setTint(0xfff2c8),
      onBlur:()=>target.clearTint()
    };
  }

  protected playSfx(key:string,volume=.45):void{if(worldState.data.settings.sound&&this.cache.audio.exists(key))try{this.sound.play(key,{volume});}catch{/* browser audio policy */}}
  private startAmbient():void{if(this.ambientStarted||!this.ambient||!worldState.data.settings.sound)return;this.ambientStarted=true;try{this.ambient.play();}catch{/* policy */}}

  protected startAutoWalk(target:Point,reportFailure=true):number{
    const path=this.navigation.findPath({x:this.player.x,y:this.player.y},target);
    if(!path.length){
      this.player.cancelPath();
      if(reportFailure) this.ui.toast('Não consigo chegar até lá.');
      return 0;
    }
    this.player.startPath(path,target);
    return path.length;
  }

  private async tryInteract():Promise<void>{
    if(this.ui.dialogueVisible()||this.ui.inventoryVisible()||this.ui.actionsVisible()) return;
    if(this.activeExit){await this.activeExit.run();return;}
    if(!this.currentInteraction || !['PLAYER_FREE','PLAYER_AUTOWALK'].includes(this.player.state)) return;
    this.player.cancelPath(); await this.currentInteraction.trigger();
  }

  private toggleInventory():void{
    if(this.ui.dialogueVisible()||this.ui.actionsVisible()) return;
    if(this.ui.inventoryVisible()){this.ui.hideInventory();return;}
    if(!['PLAYER_FREE','PLAYER_AUTOWALK'].includes(this.player.state)) return;
    this.player.cancelPath(); this.player.setState('PLAYER_INVENTORY');
    this.ui.showInventory(()=>this.player.free());
  }
  private handleEscape():void{if(this.ui.closeTransient())return;if(this.activeExit)void this.activeExit.run();}

  protected showActions(title:string,actions:{label:string;run:()=>void|Promise<void>}[]):void{
    this.player.cancelPath(); this.player.setState('PLAYER_INTERACTING');
    this.ui.showActions(title,actions.map(a=>({label:a.label,run:()=>void a.run()})),()=>{if(this.player.state==='PLAYER_INTERACTING')this.player.free();});
  }

  protected async walkTo(anchor:AnchorPoint):Promise<boolean>{
    this.player.cancelPath();
    const count=this.startAutoWalk({x:anchor.x,y:anchor.y},false);
    if(!count){this.ui.toast('Não consigo chegar até lá.');return false;}
    const ok=await this.waitFor(()=>this.player.state==='PLAYER_FREE',7000);
    if(!ok){this.player.cancelPath();return false;}
    if(Math.hypot(this.player.x-anchor.x,this.player.y-anchor.y)>24) return false;
    this.player.setPosition(anchor.x,anchor.y); this.player.setFacing(anchor.facing); return true;
  }

  protected async anchoredPose(anchor:AnchorPoint,frame:string,state:PlayerState,exitLabel:string,onEnter?:()=>void|Promise<void>,onExit?:()=>void|Promise<void>):Promise<void>{
    this.player.setState('PLAYER_INTERACTING');
    const reached=await this.walkTo(anchor); if(!reached){this.player.free();this.ui.toast('Não consigo chegar até lá.');return;}
    await onEnter?.(); this.player.pose(frame,state); this.playSfx('sit',.35);
    this.activeExit={label:exitLabel,run:async()=>{this.activeExit=undefined;await onExit?.();this.player.free();this.persistPosition();}};
    this.persistPosition();
  }

  protected async simpleAnchored(anchor:AnchorPoint,frame:string,ms=650,action?:()=>void|Promise<void>):Promise<void>{
    this.player.setState('PLAYER_INTERACTING'); const reached=await this.walkTo(anchor); if(!reached){this.player.free();return;}
    this.player.pose(frame,'PLAYER_INTERACTING'); await action?.(); await this.delay(ms); this.player.free(); this.persistPosition();
  }

  protected async dialogueAt(anchor:AnchorPoint,provider:ScriptedDialogueProvider,effectHandler:(e:string)=>void|Promise<void>,npcFacing?:()=>void):Promise<void>{
    this.player.setState('PLAYER_INTERACTING'); const reached=await this.walkTo(anchor); if(!reached){this.player.free();return;}
    npcFacing?.(); this.player.setState('PLAYER_DIALOGUE'); const zoom=this.cameras.main.zoom; this.cameras.main.zoomTo(Math.min(1.28,zoom+.12),220);
    await this.ui.playDialogue(provider,effectHandler); this.cameras.main.zoomTo(zoom,220); this.player.free(); this.persistPosition();
  }

  protected async transitionTo(scene:SceneKey,spawn:{x:number;y:number}):Promise<void>{
    this.player.setState('PLAYER_TRANSITION'); this.playSfx('door',.45); worldState.setScene(scene,spawn); SaveManager.save();
    await new Promise<void>(resolve=>{this.cameras.main.fadeOut(240,30,35,31);this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,()=>resolve());});
    this.scene.start(scene);
  }

  protected persistPosition():void{if(!this.player)return;worldState.setScene(this.scene.key as SceneKey,{x:this.player.x,y:this.player.y});SaveManager.save();}
  protected delay(ms:number):Promise<void>{return new Promise(resolve=>this.time.delayedCall(ms,()=>resolve()));}
  protected waitFor(predicate:()=>boolean,timeout=5000):Promise<boolean>{return new Promise(resolve=>{const started=this.time.now;const timer=this.time.addEvent({delay:30,loop:true,callback:()=>{if(predicate()){timer.remove();resolve(true);}else if(this.time.now-started>timeout){timer.remove();resolve(false);}}});});}
  protected faceToward(from:{x:number;y:number},to:{x:number;y:number}):Facing{const dx=to.x-from.x,dy=to.y-from.y;return Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');}

  private updateFocusedInteraction(next:InteractionDefinition|null):void{
    if(this.focusedInteraction?.id===next?.id) return;
    this.focusedInteraction?.onBlur?.();
    this.focusedInteraction=next;
    this.focusedInteraction?.onFocus?.();
  }

  private promptPosition():{x:number;y:number}{
    const camera=this.cameras.main;
    const canvas=this.game.canvas.getBoundingClientRect();
    const gameW=this.scale.gameSize.width;
    const gameH=this.scale.gameSize.height;
    const logicalX=(this.player.x-camera.worldView.x)*camera.zoom;
    const logicalY=(this.player.y-camera.worldView.y)*camera.zoom-78;
    const x=canvas.left+logicalX*(canvas.width/gameW);
    const y=canvas.top+logicalY*(canvas.height/gameH);
    return {x:Math.max(86,Math.min(window.innerWidth-86,x)),y:Math.max(62,Math.min(window.innerHeight-34,y))};
  }
}
