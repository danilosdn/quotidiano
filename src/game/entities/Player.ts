import Phaser from 'phaser';
import { Point } from '../navigation/NavigationManager';
import { AutoWalkStuckDetector } from '../navigation/AutoWalkStuckDetector';
import { Facing } from '../interaction/InteractionTypes';

export type PlayerState = 'PLAYER_FREE'|'PLAYER_AUTOWALK'|'PLAYER_INTERACTING'|'PLAYER_SITTING'|'PLAYER_LYING'|'PLAYER_DIALOGUE'|'PLAYER_TRANSITION'|'PLAYER_INVENTORY';

export class Player extends Phaser.Physics.Arcade.Sprite {
  state: PlayerState='PLAYER_FREE';
  facing: Facing='down';
  private path: Point[]=[];
  private pathIndex=0;
  private speed=185;
  private lastStepAt=0;
  private autoTarget?: Point;
  private stuck = new AutoWalkStuckDetector();
  private repath?: (target:Point)=>Point[];
  private onAutoWalkFailed?: ()=>void;
  onStep?:()=>void;

  constructor(scene: Phaser.Scene,x:number,y:number){
    super(scene,x,y,'protagonist','idle_down');
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setOrigin(.5,.86); this.setDepth(y);
    const body=this.body as Phaser.Physics.Arcade.Body; body.setSize(28,30); body.setOffset(18,48); body.setCollideWorldBounds(true);
    this.createAnimations();
  }

  private createAnimations(): void {
    for(const dir of ['down','left','right','up'] as Facing[]){
      const key=`player-walk-${dir}`;
      if(!this.scene.anims.exists(key)) this.scene.anims.create({key,frames:this.scene.anims.generateFrameNames('protagonist',{prefix:`walk_${dir}_`,start:0,end:7}),frameRate:10,repeat:-1});
    }
  }

  configureAutoWalk(repath:(target:Point)=>Point[],onFailed:()=>void):void{
    this.repath=repath; this.onAutoWalkFailed=onFailed;
  }

  setState(state: PlayerState): void {
    this.state=state;
    if(state!=='PLAYER_AUTOWALK'){
      this.path=[]; this.autoTarget=undefined; this.stuck.stop();
    }
  }
  setFacing(f:Facing):void{this.facing=f; if(this.state!=='PLAYER_AUTOWALK') this.setFrame(`idle_${f}`);}
  pose(frame:string,state:PlayerState):void{this.setState(state); this.stop(); this.setFrame(frame);}
  free():void{this.state='PLAYER_FREE';this.path=[];this.autoTarget=undefined;this.stuck.stop();this.stop();this.setFrame(`idle_${this.facing}`);}

  startPath(path: Point[], target?:Point): void {
    if(!path.length) return;
    this.path=path; this.pathIndex=0; this.state='PLAYER_AUTOWALK';
    this.autoTarget={...(target ?? path[path.length-1])};
    this.stuck.begin({x:this.x,y:this.y});
  }
  cancelPath():void{
    if(this.state==='PLAYER_AUTOWALK'){
      this.path=[];this.pathIndex=0;this.autoTarget=undefined;this.stuck.stop();this.state='PLAYER_FREE';this.stop();this.setFrame(`idle_${this.facing}`);
    }
  }
  stop():void{this.setVelocity(0,0);this.anims.stop();}

  manual(vx:number,vy:number):void{
    if(this.state!=='PLAYER_FREE'&&this.state!=='PLAYER_AUTOWALK') return;
    if(vx||vy){
      if(this.state==='PLAYER_AUTOWALK') this.cancelPath();
      const mag=Math.hypot(vx,vy)||1; vx=vx/mag*this.speed; vy=vy/mag*this.speed; this.setVelocity(vx,vy);
      this.facing=this.directionFromVelocity(vx,vy); this.anims.play(`player-walk-${this.facing}`,true); this.maybeStep();
    } else if(this.state==='PLAYER_FREE'){this.stop();this.setFrame(`idle_${this.facing}`);}
  }

  updateAuto(deltaMs=16.67):void{
    this.setDepth(this.y);
    if(this.state!=='PLAYER_AUTOWALK') return;
    const target=this.path[this.pathIndex];
    if(!target){this.finishAutoWalk();return;}
    const dx=target.x-this.x,dy=target.y-this.y,dist=Math.hypot(dx,dy);
    if(dist<10){this.pathIndex++;this.stuck.replanSucceeded({x:this.x,y:this.y});return;}
    const vx=dx/dist*this.speed,vy=dy/dist*this.speed;
    this.setVelocity(vx,vy);this.facing=this.directionFromVelocity(vx,vy);this.anims.play(`player-walk-${this.facing}`,true);this.maybeStep();

    const action=this.stuck.sample({x:this.x,y:this.y},deltaMs,Math.hypot(vx,vy)>1);
    if(action==='replan'&&this.autoTarget&&this.repath){
      const next=this.repath(this.autoTarget);
      if(next.length){
        this.path=next;this.pathIndex=0;this.stuck.replanSucceeded({x:this.x,y:this.y});
      } else this.failAutoWalk();
    } else if(action==='cancel') this.failAutoWalk();
  }

  private finishAutoWalk():void{
    this.stop();this.path=[];this.pathIndex=0;this.autoTarget=undefined;this.stuck.stop();this.state='PLAYER_FREE';this.setFrame(`idle_${this.facing}`);
  }

  private failAutoWalk():void{
    this.stop();this.path=[];this.pathIndex=0;this.autoTarget=undefined;this.stuck.stop();this.state='PLAYER_FREE';this.setFrame(`idle_${this.facing}`);this.onAutoWalkFailed?.();
  }

  private directionFromVelocity(vx:number,vy:number):Facing{
    if(Math.abs(vx)>Math.abs(vy)) return vx<0?'left':'right'; return vy<0?'up':'down';
  }
  private maybeStep():void{const now=this.scene.time.now;if(now-this.lastStepAt>310){this.lastStepAt=now;this.onStep?.();}}
}
