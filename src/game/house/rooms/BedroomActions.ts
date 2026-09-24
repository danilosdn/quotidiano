import type { RoomActionHandler } from '../actions/types';
import { ensureItem, finish } from './helpers';

export const handleBedroomAction: RoomActionHandler = async (objectId, actionId, context) => {
  const { world, session, runner } = context;
  if (objectId === 'bed') {
    if (actionId === 'sit') {
      await runner.run([{type:'mode',mode:'INTERACTING'},{type:'move',point:context.actionPoint('bed')},{type:'face',direction:'left'},{type:'pose',pose:'sit'},{type:'mutate',run:()=>{session.seatedAt='bed';session.lyingOnBed=false;}},{type:'mode',mode:'SITTING'},{type:'toast',text:'Je zit op de rand van het bed.'},{type:'autosave'}]);
      return true;
    }
    if (actionId === 'lie') {
      await runner.run([{type:'mode',mode:'INTERACTING'},{type:'move',point:context.actionPoint('bed'),duration:180},{type:'animate',action:'lie'},{type:'pose',pose:'lie'},{type:'mutate',run:()=>{session.seatedAt=null;session.lyingOnBed=true;}},{type:'mode',mode:'LYING'},{type:'toast',text:'Je ligt comfortabel.'},{type:'autosave'}]);
      return true;
    }
    if (actionId === 'sleep') {
      if (!session.lyingOnBed) { context.toast('Ga eerst liggen.'); return true; }
      await runner.run([{type:'mode',mode:'SLEEPING'},{type:'effect',effect:'sleep',visible:true},{type:'wait',ms:650},{type:'mutate',run:()=>{world.day+=1;world.minutes=7*60;world.showeredToday=false;world.handsWashed=false;world.faceWashed=false;world.teethBrushed=false;world.usedTowel=false;world.breakfastEaten=false;world.breakfastOnTable=false;world.coffeeOnTable=false;world.coffeeReady=false;world.toastReady=false;world.dishesWashed=false;world.alarmState='RINGING';world.currentObjective='Zet de wekker uit en begin aan de nieuwe dag.';context.completeScenario('night-routine');}},{type:'effect',effect:'sleep',visible:false},{type:'pose',pose:'lie'},{type:'mode',mode:'LYING'},{type:'dialogue',dialogueId:'alarm_start'},{type:'autosave'}]);
      return true;
    }
    if (actionId === 'stand') {
      await runner.run([{type:'mode',mode:'INTERACTING'},{type:'move',point:context.approachPoint('bed')},{type:'face',direction:'down'},{type:'pose',pose:'idle'},{type:'mutate',run:()=>{session.seatedAt=null;session.lyingOnBed=false;}},{type:'mode',mode:'FREE'},{type:'autosave'}]);
      return true;
    }
    if (actionId === 'make') {
      await runner.run([{type:'mode',mode:'INTERACTING'},{type:'face',direction:'left'},{type:'animate',action:'use'},{type:'mutate',run:()=>{world.bedMade=true;}},{type:'sync'},{type:'mode',mode:'FREE'},{type:'toast',text:'Het bed is netjes opgemaakt.'},{type:'autosave'}]);
      return true;
    }
  }

  if (objectId === 'wardrobe') {
    if (actionId === 'toggle') {
      world.wardrobeOpen=!world.wardrobeOpen; finish(context); context.toast(world.wardrobeOpen?'De kledingkast is open.':'De kledingkast is dicht.'); return true;
    }
    if (actionId === 'dress') {
      if (!world.wardrobeOpen) { context.toast('Open eerst de kledingkast.'); return true; }
      await runner.run([{type:'mode',mode:'INTERACTING'},{type:'face',direction:'up'},{type:'animate',action:'use'},{type:'mutate',run:()=>{world.outfit='day';ensureItem(context,'clothes','Kleding','ON_SURFACE','wardrobe');context.completeScenario('choose-outfit');world.currentObjective='Verzorg jezelf in de badkamer.';}},{type:'sync'},{type:'mode',mode:'FREE'},{type:'dialogue',dialogueId:'outfit_done'},{type:'autosave'}]);
      return true;
    }
    if (actionId === 'store-clothes') { ensureItem(context,'clothes','Kleding'); context.inventory.placeOnSurface('clothes','wardrobe'); finish(context); context.toast('De kleding ligt weer in de kast.'); return true; }
  }

  if (objectId === 'bedroom-window') {
    if (actionId === 'open-window') world.windowOpen=true;
    if (actionId === 'close-window') world.windowOpen=false;
    if (actionId === 'toggle-curtains') { world.curtainsOpen=!world.curtainsOpen; if(world.curtainsOpen) context.completeScenario('curtain-weather'); }
    if (actionId === 'look-outside') { context.openDialogue('weather_observe'); return true; }
    finish(context); context.toast(actionId==='toggle-curtains'?(world.curtainsOpen?'De gordijnen zijn open.':'De gordijnen zijn dicht.'):(world.windowOpen?'Het raam staat open.':'Het raam is dicht.')); return true;
  }


  if (objectId === 'bedside-lamp' && actionId === 'toggle') {
    world.roomLights.bedroom = !world.roomLights.bedroom;
    world.lightsOn = Object.values(world.roomLights).some(Boolean);
    finish(context);
    context.toast(world.roomLights.bedroom ? 'De nachtlamp geeft warm licht.' : 'De nachtlamp is uit.');
    return true;
  }

  if (objectId === 'alarm-clock') {
    if (actionId === 'stop') { world.alarmState='OFF'; context.completeScenario('morning-alarm'); world.currentObjective='Open de gordijnen en kijk naar het weer.'; finish(context); context.openDialogue('alarm_stopped'); return true; }
    if (actionId === 'snooze') { world.alarmState='SNOOZED'; finish(context); context.openDialogue('alarm_snoozed'); return true; }
    if (actionId === 'set') { context.toast('De wekker staat op 07:00.'); return true; }
  }

  if (objectId === 'nightstand') {
    if (actionId === 'open-drawer') world.nightstandOpen=true;
    if (actionId === 'close-drawer') world.nightstandOpen=false;
    finish(context); context.toast(actionId==='examine'?'Een lade voor kleine persoonlijke dingen.':world.nightstandOpen?'De lade is open.':'De lade is dicht.'); return true;
  }

  if (objectId === 'desk') {
    if (actionId === 'sit') { await runner.run([{type:'move',point:context.actionPoint('desk')},{type:'face',direction:'up'},{type:'pose',pose:'sit'},{type:'mutate',run:()=>{session.seatedAt='desk';}},{type:'mode',mode:'SITTING'},{type:'autosave'}]); return true; }
    if (actionId === 'stand') { await runner.run([{type:'move',point:context.approachPoint('desk')},{type:'pose',pose:'idle'},{type:'mutate',run:()=>{session.seatedAt=null;}},{type:'mode',mode:'FREE'},{type:'autosave'}]); return true; }
    if (actionId === 'write') { await runner.run([{type:'animate',action:'use'},{type:'advance-time',minutes:5},{type:'toast',text:'Je schrijft een korte notitie.'},{type:'mode',mode:session.seatedAt==='desk'?'SITTING':'FREE'},{type:'autosave'}]); return true; }
  }

  if (objectId === 'laptop') {
    if (actionId === 'toggle') { world.laptopOn=!world.laptopOn; finish(context); context.toast(world.laptopOn?'De laptop start op.':'De laptop is uit.'); return true; }
    if (actionId === 'email') { if(!world.laptopOn){context.toast('Zet eerst de laptop aan.');return true;} await runner.run([{type:'mode',mode:'USING_COMPUTER'},{type:'animate',action:'use'},{type:'mode',mode:session.seatedAt==='desk'?'SITTING':'FREE'},{type:'dialogue',dialogueId:'message_notification'},{type:'autosave'}]); return true; }
  }

  if (objectId === 'backpack') {
    ensureItem(context,'backpack','Rugzak','ON_SURFACE','bedroom');
    if (actionId === 'take') { context.inventory.putInBag('backpack'); finish(context); context.toast('De rugzak is klaar voor vertrek.'); return true; }
    if (actionId === 'leave') { context.inventory.placeOnSurface('backpack','bedroom'); finish(context); context.toast('Je zet de rugzak bij het bureau.'); return true; }
    if (actionId === 'inspect') { context.openInventory(); return true; }
  }

  return false;
};
