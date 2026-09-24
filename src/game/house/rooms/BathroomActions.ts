import type { RoomActionHandler } from '../actions/types';
import { ensureItem, finish } from './helpers';

export const handleBathroomAction: RoomActionHandler = async (objectId, actionId, context) => {
  const { world, runner } = context;
  if (objectId === 'shower' && actionId === 'shower') {
    await runner.run([
      {type:'mode',mode:'SHOWERING'},
      {type:'move',point:context.actionPoint('shower'),duration:180},
      {type:'face',direction:'up'},
      {type:'effect',effect:'shower',visible:true},
      {type:'animate',action:'use'},
      {type:'wait',ms:650},
      {type:'mutate',run:()=>{world.showeredToday=true;world.usedTowel=true;world.currentObjective='Poets je tanden en kies daarna je kleding.';}},
      {type:'advance-time',minutes:12},
      {type:'sync'},
      {type:'effect',effect:'shower',visible:false},
      {type:'move',point:context.approachPoint('shower'),duration:180},
      {type:'face',direction:'down'},
      {type:'pose',pose:'idle'},
      {type:'mode',mode:'FREE'},
      {type:'toast',text:'Fris en klaar voor de dag.'},
      {type:'autosave'}
    ]);
    if (world.teethBrushed) context.completeScenario('morning-hygiene');
    return true;
  }

  if (objectId === 'bathroom-sink' && (actionId === 'wash-hands' || actionId === 'wash-face')) {
    await runner.run([{type:'mode',mode:'INTERACTING'},{type:'face',direction:'up'},{type:'effect',effect:'sink-water',visible:true},{type:'animate',action:'use'},{type:'mutate',run:()=>{if(actionId==='wash-hands')world.handsWashed=true;else world.faceWashed=true;}},{type:'advance-time',minutes:2},{type:'effect',effect:'sink-water',visible:false},{type:'mode',mode:'FREE'},{type:'toast',text:actionId==='wash-hands'?'Je handen zijn schoon.':'Je gezicht voelt fris.'},{type:'autosave'}]);
    return true;
  }

  if (objectId === 'toothbrush') {
    ensureItem(context,'toothbrush','Tandenborstel','ON_SURFACE','bathroom-sink');
    if (actionId === 'take') { context.inventory.hold('toothbrush'); finish(context); context.toast('Je pakt de tandenborstel.'); return true; }
    if (actionId === 'brush') {
      if (!context.inventory.anywhere('toothbrush')) { context.toast('Waar is de tandenborstel?'); return true; }
      await runner.run([{type:'mode',mode:'INTERACTING'},{type:'face',direction:'up'},{type:'animate',action:'use'},{type:'mutate',run:()=>{world.teethBrushed=true;context.inventory.placeOnSurface('toothbrush','bathroom-sink');if(world.showeredToday)context.completeScenario('morning-hygiene');}},{type:'advance-time',minutes:3},{type:'sync'},{type:'mode',mode:'FREE'},{type:'dialogue',dialogueId:'hygiene_done'},{type:'autosave'}]); return true;
    }
    if (actionId === 'store') { context.inventory.placeOnSurface('toothbrush','bathroom-sink'); finish(context); context.toast('De tandenborstel staat weer in de beker.'); return true; }
  }

  if (objectId === 'bathroom-mirror') { context.toast(actionId==='hair'?'Je haar zit weer netjes.':'Je ziet er nog slaperig, maar goed uit.'); return true; }
  if (objectId === 'towel-rack') { world.usedTowel=actionId==='use'||world.usedTowel; finish(context); context.toast(actionId==='use'?'Je droogt je af.':'De handdoek hangt naast de douche.'); return true; }
  if (objectId === 'toilet') { context.toast(actionId==='flush'?'Je spoelt door.':'Even een discreet moment.'); return true; }
  if (objectId === 'bathroom-shelf') { context.toast(actionId==='take-products'?'Je gebruikt wat deodorant.':'Handdoeken en verzorgingsproducten liggen netjes op hun plaats.'); return true; }
  if (objectId === 'bathroom-bin') { context.toast('Alleen klein badkamerafval hoort hierin.'); return true; }
  return false;
};
