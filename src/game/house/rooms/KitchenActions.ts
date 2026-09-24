import type { RoomActionHandler } from '../actions/types';
import { ensureItem, finish } from './helpers';

export const handleKitchenAction: RoomActionHandler = async (objectId, actionId, context) => {
  const { world, inventory, runner, session } = context;
  if (objectId === 'fridge') {
    if (actionId === 'toggle') { world.fridgeOpen=!world.fridgeOpen; finish(context); context.toast(world.fridgeOpen?'De koelkast is open.':'De koelkast is dicht.'); return true; }
    if (actionId === 'take-breakfast') {
      if (!world.fridgeOpen) { context.toast('Open eerst de koelkast.'); return true; }
      ensureItem(context,'bread','Brood'); inventory.hold('bread'); world.currentObjective='Rooster het brood en zet koffie.'; finish(context); context.toast('Je houdt het brood vast.'); return true;
    }
    if (actionId === 'put-back') { if(inventory.anywhere('bread'))inventory.placeOnSurface('bread','fridge'); finish(context); context.toast('Het brood ligt weer in de koelkast.'); return true; }
  }

  if (objectId === 'toaster' && actionId === 'toast') {
    if (!inventory.anywhere('bread')) { context.toast('Pak eerst brood uit de koelkast.'); return true; }
    await runner.run([{type:'mode',mode:'COOKING'},{type:'face',direction:'up'},{type:'animate',action:'use'},{type:'mutate',run:()=>{inventory.remove('bread');world.toastReady=false;}},{type:'sync'},{type:'wait',ms:600},{type:'pulse',objectId:'toaster'},{type:'mutate',run:()=>{world.toastReady=true;ensureItem(context,'toast','Toast');inventory.hold('toast');}},{type:'advance-time',minutes:4},{type:'sync'},{type:'mode',mode:'FREE'},{type:'toast',text:'De toast is klaar.'},{type:'autosave'}]); return true;
  }

  if (objectId === 'coffee') {
    if (actionId === 'brew') {
      await runner.run([{type:'mode',mode:'COOKING'},{type:'face',direction:'up'},{type:'animate',action:'use'},{type:'mutate',run:()=>{world.coffeeReady=false;}},{type:'sync'},{type:'wait',ms:700},{type:'pulse',objectId:'coffee'},{type:'mutate',run:()=>{world.coffeeReady=true;ensureItem(context,'coffee','Koffie');}},{type:'advance-time',minutes:5},{type:'sync'},{type:'mode',mode:'FREE'},{type:'toast',text:'De koffie is klaar.'},{type:'autosave'}]); return true;
    }
    if (actionId === 'take') { if(!world.coffeeReady){context.toast('Zet eerst koffie.');return true;} inventory.hold('coffee'); finish(context); context.toast('Je houdt de warme kop voorzichtig vast.'); return true; }
  }

  if (objectId === 'dining-table') {
    if (actionId === 'place-breakfast') {
      const hasToast=inventory.anywhere('toast'); const hasCoffee=inventory.anywhere('coffee');
      if(!hasToast&&!hasCoffee){context.toast('Er is nog niets om op tafel te zetten.');return true;}
      if(hasToast){inventory.placeOnSurface('toast','dining-table');world.breakfastOnTable=true;}
      if(hasCoffee){inventory.placeOnSurface('coffee','dining-table');world.coffeeOnTable=true;}
      finish(context); context.toast('Je zet het ontbijt netjes op tafel.'); return true;
    }
    if (actionId === 'sit') { await runner.run([{type:'mode',mode:'INTERACTING'},{type:'move',point:context.actionPoint('dining-table')},{type:'face',direction:'right'},{type:'pose',pose:'sit'},{type:'mutate',run:()=>{session.seatedAt='dining-table';}},{type:'mode',mode:'SITTING'},{type:'autosave'}]); return true; }
    if (actionId === 'eat') {
      if(session.seatedAt!=='dining-table'){context.toast('Ga eerst aan tafel zitten.');return true;}
      if(!world.breakfastOnTable){context.toast('Zet eerst de toast op tafel.');return true;}
      await runner.run([{type:'mode',mode:'EATING'},{type:'animate',action:'eat'},{type:'mutate',run:()=>{world.breakfastEaten=true;world.breakfastOnTable=false;inventory.remove('toast');}},{type:'advance-time',minutes:12},{type:'sync'},{type:'mode',mode:'SITTING'},{type:'toast',text:'De toast smaakt goed.'},{type:'autosave'}]);
      if (!world.coffeeOnTable) { context.completeScenario('make-breakfast'); context.openDialogue('breakfast_done'); }
      return true;
    }
    if (actionId === 'drink') {
      if(session.seatedAt!=='dining-table'){context.toast('Ga eerst aan tafel zitten.');return true;}
      if(!world.coffeeOnTable){context.toast('Er staat geen koffie op tafel.');return true;}
      await runner.run([{type:'mode',mode:'DRINKING'},{type:'animate',action:'eat'},{type:'mutate',run:()=>{world.coffeeOnTable=false;inventory.set('mug','Leeg kopje','ON_SURFACE',{surfaceId:'kitchen-sink'});inventory.remove('coffee');}},{type:'advance-time',minutes:4},{type:'sync'},{type:'mode',mode:'SITTING'},{type:'toast',text:'De koffie is warm en sterk.'},{type:'autosave'}]);
      if (world.breakfastEaten) { context.completeScenario('make-breakfast'); world.currentObjective='Lees je bericht en pak daarna je sleutels.'; context.openDialogue('breakfast_done'); }
      return true;
    }
    if (actionId === 'stand') { await runner.run([{type:'mode',mode:'INTERACTING'},{type:'move',point:context.approachPoint('dining-table')},{type:'pose',pose:'idle'},{type:'mutate',run:()=>{session.seatedAt=null;}},{type:'mode',mode:'FREE'},{type:'autosave'}]); return true; }
  }

  if (objectId === 'kitchen-sink') {
    if (actionId === 'wash-dishes') {
      if(!inventory.anywhere('mug')&&!world.breakfastEaten){context.toast('Er is nog geen afwas.');return true;}
      await runner.run([{type:'mode',mode:'INTERACTING'},{type:'effect',effect:'sink-water',visible:true},{type:'animate',action:'use'},{type:'mutate',run:()=>{world.dishesWashed=true;if(inventory.anywhere('mug'))inventory.placeOnSurface('mug','kitchen-sink');}},{type:'advance-time',minutes:5},{type:'effect',effect:'sink-water',visible:false},{type:'mode',mode:'FREE'},{type:'toast',text:'De afwas is schoon.'},{type:'autosave'}]); return true;
    }
    if (actionId === 'wash-hands') { world.handsWashed=true; finish(context); context.toast('Je wast je handen bij de keukenkraan.'); return true; }
    if (actionId === 'wash-food') { context.toast('Je spoelt het eten voorzichtig af.'); return true; }
  }

  if (objectId === 'oven') { if(actionId==='toggle')world.ovenOn=!world.ovenOn; if(actionId==='cook'&&!world.ovenOn){context.toast('Zet eerst het fornuis aan.');return true;} finish(context); context.toast(actionId==='cook'?'Deze versie houdt het bij een eenvoudig ontbijt.':world.ovenOn?'Het fornuis staat aan.':'Het fornuis staat uit.'); return true; }
  if (objectId === 'kitchen-bin') { if(inventory.get('keys')?.location==='HELD'){context.toast('Sleutels horen niet in de afvalbak.');return true;} context.toast('Je gooit alleen weg wat echt afval is.'); return true; }
  if (objectId === 'kitchen-plant') { context.toast(actionId==='water'?'Je geeft de plant een beetje water.':'Een kleine groene plant bij de eethoek.'); return true; }
  return false;
};
