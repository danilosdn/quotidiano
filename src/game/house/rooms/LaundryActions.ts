import type { RoomActionHandler } from '../actions/types';
import { ensureItem, finish } from './helpers';

export const handleLaundryAction: RoomActionHandler = async (objectId, actionId, context) => {
  const { world, inventory, runner } = context;
  if(objectId==='laundry-shelf'){
    ensureItem(context,'detergent','Wasmiddel','ON_SURFACE','laundry-shelf');
    if(actionId==='take-detergent'){inventory.hold('detergent');finish(context);context.toast('Je pakt het wasmiddel.');return true;}
    if(actionId==='store'){inventory.placeOnSurface('detergent','laundry-shelf');finish(context);context.toast('Het wasmiddel staat weer op de plank.');return true;}
  }
  if(objectId==='laundry-basket'){
    ensureItem(context,'clothes','Wasgoed','ON_SURFACE','laundry-basket');
    if(actionId==='take-clothes'){inventory.hold('clothes');finish(context);context.toast('Je pakt het wasgoed uit de mand.');return true;}
    if(actionId==='add-clothes'){inventory.placeOnSurface('clothes','laundry-basket');finish(context);context.toast('De kleding ligt in de wasmand.');return true;}
  }
  if(objectId==='washing-machine'){
    if(actionId==='toggle'){world.laundryOpen=!world.laundryOpen;if(world.laundryState==='EMPTY'&&world.laundryOpen)world.laundryState='OPEN';finish(context);context.toast(world.laundryOpen?'De wasmachine is open.':'De wasmachine is dicht.');return true;}
    if(actionId==='load'){
      if(!world.laundryOpen){context.toast('Open eerst de wasmachine.');return true;}
      if(!inventory.anywhere('clothes')){context.toast('Pak eerst het wasgoed uit de mand.');return true;}
      inventory.remove('clothes');world.laundryState='LOADED';finish(context);context.toast('Het wasgoed zit in de machine.');return true;
    }
    if(actionId==='wash'){
      if(world.laundryState!=='LOADED'&&world.laundryState!=='DETERGENT'){context.toast('Laad eerst de machine.');return true;}
      if(!world.detergentAdded){if(!inventory.anywhere('detergent')){context.toast('Voeg eerst wasmiddel toe.');return true;}inventory.remove('detergent');world.detergentAdded=true;world.laundryState='DETERGENT';}
      world.laundryOpen=false;
      await runner.run([{type:'mode',mode:'INTERACTING'},{type:'face',direction:'up'},{type:'animate',action:'use'},{type:'mutate',run:()=>{world.laundryState='RUNNING';}},{type:'sync'},{type:'effect',effect:'washing',visible:true},{type:'wait',ms:900},{type:'advance-time',minutes:45},{type:'mutate',run:()=>{world.laundryState='DONE';}},{type:'effect',effect:'washing',visible:false},{type:'sync'},{type:'mode',mode:'FREE'},{type:'toast',text:'De was is schoon.'},{type:'autosave'}]);return true;
    }
    if(actionId==='remove'){
      if(world.laundryState!=='DONE'){context.toast('De was is nog niet klaar.');return true;}
      ensureItem(context,'clothes','Schone was');inventory.hold('clothes');world.laundryState='EMPTY';world.detergentAdded=false;finish(context);context.toast('Je haalt de schone was uit de machine.');return true;
    }
  }
  if(objectId==='drying-rack'){
    if(actionId==='hang'){if(!inventory.anywhere('clothes')){context.toast('Je hebt geen natte was bij je.');return true;}inventory.placeOnSurface('clothes','drying-rack');world.laundryState='DRYING';finish(context);context.toast('Je hangt de was te drogen.');return true;}
    if(actionId==='take'){if(world.laundryState!=='DRYING'&&world.laundryState!=='DRY'){context.toast('Er hangt geen droge was.');return true;}world.laundryState='DRY';inventory.hold('clothes');context.completeScenario('do-laundry');finish(context);context.toast('De was is droog en kan terug in de kast.');return true;}
  }
  return false;
};
