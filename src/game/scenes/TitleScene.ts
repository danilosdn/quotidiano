import Phaser from 'phaser';
import { SaveManager } from '../persistence/SaveManager';
import { worldState } from '../state/WorldState';

export class TitleScene extends Phaser.Scene {
  constructor(){super('TitleScene');}
  create():void{
    const ui=document.querySelector('#ui-root'); if(ui)ui.innerHTML='';
    this.cameras.main.setBackgroundColor('#efe4cf');
    const g=this.add.graphics();
    g.fillStyle(0xd8c49d,1);g.fillRoundedRect(175,112,930,496,32);
    g.fillStyle(0xf8f1e2,1);g.fillRoundedRect(190,127,900,466,28);
    g.fillStyle(0x6e7c60,.16);g.fillCircle(1010,190,110);g.fillCircle(250,540,130);
    this.add.text(640,228,'QUOTIDIANO',{fontFamily:'Georgia,serif',fontSize:'64px',fontStyle:'bold',color:'#2d493d',letterSpacing:5}).setOrigin(.5);
    this.add.text(640,302,'Pequenas conversas. Grandes descobertas.',{fontFamily:'system-ui',fontSize:'18px',color:'#647168'}).setOrigin(.5);
    this.add.text(640,350,'Aprenda holandês vivendo pequenas histórias.',{fontFamily:'system-ui',fontSize:'15px',color:'#8a8477'}).setOrigin(.5);
    const has=SaveManager.hasSave();
    const button=(y:number,label:string,onClick:()=>void)=>{
      const bg=this.add.rectangle(640,y,250,54,0x315746,1).setInteractive({useHandCursor:true}); bg.setStrokeStyle(1,0xffffff,.25);
      const tx=this.add.text(640,y,label,{fontFamily:'system-ui',fontSize:'17px',fontStyle:'bold',color:'#fff8eb'}).setOrigin(.5);
      bg.on('pointerover',()=>bg.setFillStyle(0x3e6956)); bg.on('pointerout',()=>bg.setFillStyle(0x315746)); bg.on('pointerdown',onClick); return [bg,tx];
    };
    if(has) button(445,'Continuar',()=>{SaveManager.hydrate();this.scene.start(worldState.data.scene);});
    button(has?515:465,'Novo dia',()=>{SaveManager.clear();this.scene.start('HomeScene');});
    this.add.text(640,566,'WASD / setas · E ou Espaço · clique para caminhar · I mochila',{fontFamily:'system-ui',fontSize:'12px',color:'#766f62'}).setOrigin(.5);
  }
}
