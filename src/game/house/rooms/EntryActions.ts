import type { RoomActionHandler } from '../actions/types';
import { ensureItem, finish } from './helpers';

export const handleEntryAction: RoomActionHandler = async (objectId, actionId, context) => {
  const { world, inventory, runner } = context;
  if (objectId === 'keys') {
    ensureItem(context,'keys','Sleutels','ON_SURFACE','entry-console');
    if(actionId==='take'){inventory.hold('keys');context.completeScenario('find-keys');finish(context);context.toast('Je pakt de sleutels uit het schaaltje.');return true;}
    if(actionId==='leave'){inventory.placeOnSurface('keys','entry-console');finish(context);context.toast('De sleutels liggen weer in het schaaltje.');return true;}
  }
  if (objectId === 'mail') {
    ensureItem(context,'mail','Brief','ON_SURFACE','entry-console');
    if(actionId==='take'){inventory.hold('mail');finish(context);context.toast('Je pakt de brief.');return true;}
    if(actionId==='read'){await runner.run([{type:'mode',mode:'INTERACTING'},{type:'animate',action:'read'},{type:'mutate',run:()=>{world.mailRead=true;context.completeScenario('read-mail');}},{type:'mode',mode:'FREE'},{type:'dialogue',dialogueId:'mail_content'},{type:'autosave'}]);return true;}
    if(actionId==='store'){inventory.putInBag('mail');finish(context);context.toast('Je bewaart de brief in je rugzak.');return true;}
  }
  if (objectId === 'coat') {
    ensureItem(context,'coat','Jas','ON_SURFACE','coat-hook');
    if(actionId==='wear'){world.coatWorn=true;inventory.equip('coat',true);finish(context);context.toast('Je trekt de jas aan.');return true;}
    if(actionId==='remove'||actionId==='hang'){world.coatWorn=false;inventory.equip('coat',false);inventory.placeOnSurface('coat','coat-hook');finish(context);context.toast('De jas hangt weer aan de kapstok.');return true;}
  }
  if (objectId === 'umbrella') {
    ensureItem(context,'umbrella','Paraplu','ON_SURFACE','entry');
    if(actionId==='take'){inventory.putInBag('umbrella');finish(context);context.toast('De paraplu gaat mee.');return true;}
    if(actionId==='store'){inventory.placeOnSurface('umbrella','entry');finish(context);context.toast('De paraplu staat weer bij de deur.');return true;}
  }
  if (objectId === 'front-door') {
    const hasKeys=inventory.anywhere('keys') && !['WORLD','ON_SURFACE'].includes(inventory.get('keys')?.location ?? 'WORLD');
    if(actionId==='unlock'){if(!hasKeys){world.currentObjective='Vind de sleutels op het halmeubel.';context.openDialogue('keys_missing');return true;}world.doorLocked=false;finish(context);context.toast('Je ontgrendelt de voordeur.');return true;}
    if(actionId==='lock'){if(!hasKeys){context.toast('Je hebt de sleutels nodig.');return true;}world.doorLocked=true;world.doorOpen=false;finish(context);context.toast('De voordeur is op slot.');return true;}
    if(actionId==='open'){if(world.doorLocked){context.toast('De voordeur is nog op slot.');return true;}world.doorOpen=true;finish(context);context.toast('De voordeur gaat open.');return true;}
    if(actionId==='close'){world.doorOpen=false;finish(context);context.toast('De voordeur gaat dicht.');return true;}
    if(actionId==='leave-house') {
      if(world.doorLocked){context.toast('Ontgrendel eerst de voordeur.');return true;}
      if(!world.doorOpen){world.doorOpen=true;context.sync();}
      await runner.run([{type:'mode',mode:'TRANSITION'},{type:'move',point:{x:582,y:671},duration:220},{type:'toast',text:'StreetScene blijft in deze House V3 bewust vergrendeld.',ms:3000},{type:'move',point:context.approachPoint('front-door'),duration:220},{type:'face',direction:'up'},{type:'mode',mode:'FREE'},{type:'autosave'}]);return true;
    }
  }
  if(objectId==='entry-mirror'){context.toast(actionId==='hair'?'Je haar zit goed.':'Alles wat je nodig hebt hangt bij de deur.');return true;}
  if(objectId==='entry-console'){context.toast('Een compact meubel voor sleutels, post en kleine spullen.');return true;}
  return false;
};
