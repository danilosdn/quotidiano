import type { RoomActionHandler } from '../actions/types';
import { ensureItem, finish } from './helpers';

export const handleLivingRoomAction: RoomActionHandler = async (objectId, actionId, context) => {
  const { world, inventory, runner, session } = context;
  if (objectId === 'sofa') {
    if (actionId === 'sit') { await runner.run([{type:'mode',mode:'INTERACTING'},{type:'move',point:context.actionPoint('sofa')},{type:'face',direction:'up'},{type:'pose',pose:'sit'},{type:'mutate',run:()=>{session.seatedAt='sofa';}},{type:'mode',mode:'SITTING'},{type:'toast',text:'Je zit comfortabel op de bank.'},{type:'autosave'}]); return true; }
    if (actionId === 'relax') { if(session.seatedAt!=='sofa'){context.toast('Ga eerst op de bank zitten.');return true;} await runner.run([{type:'animate',action:'read'},{type:'advance-time',minutes:10},{type:'mode',mode:'SITTING'},{type:'toast',text:'Even niets hoeven. Dat helpt.'},{type:'autosave'}]); return true; }
    if (actionId === 'stand') { await runner.run([{type:'move',point:context.approachPoint('sofa')},{type:'pose',pose:'idle'},{type:'mutate',run:()=>{session.seatedAt=null;}},{type:'mode',mode:'FREE'},{type:'autosave'}]); return true; }
  }
  if (objectId === 'tv') { if(actionId==='toggle')world.tvOn=!world.tvOn; finish(context); context.toast(actionId==='watch'?(world.tvOn?'Een rustig Nederlands nieuwsprogramma is bezig.':'Zet eerst de televisie aan.'):world.tvOn?'De televisie gaat aan.':'De televisie gaat uit.'); return true; }
  if (objectId === 'living-lamp') { world.roomLights.living=!world.roomLights.living; world.lightsOn=Object.values(world.roomLights).some(Boolean); finish(context); context.toast(world.roomLights.living?'De kamer krijgt warm licht.':'De staande lamp is uit.'); return true; }
  if (objectId === 'bookshelf') {
    ensureItem(context,'book','Boek','ON_SURFACE','bookshelf');
    if(actionId==='take-book'){inventory.hold('book');finish(context);context.toast('Je pakt een Nederlands boek.');return true;}
    if(actionId==='read-book'){if(!inventory.anywhere('book')){context.toast('Pak eerst een boek.');return true;}await runner.run([{type:'mode',mode:'INTERACTING'},{type:'animate',action:'read'},{type:'advance-time',minutes:8},{type:'mode',mode:session.seatedAt?'SITTING':'FREE'},{type:'toast',text:'Je leest een korte pagina in het Nederlands.'},{type:'autosave'}]);return true;}
    if(actionId==='return-book'){inventory.placeOnSurface('book','bookshelf');finish(context);context.toast('Het boek staat weer in de kast.');return true;}
    context.toast('Reisboeken, een roman en een klein woordenboek.');return true;
  }
  if (objectId === 'coffee-table' || objectId === 'side-table') {
    const surface=objectId;
    if(actionId==='place-item'){const held=inventory.heldItem();if(!held){context.toast('Je hebt niets in je hand.');return true;}inventory.placeOnSurface(held.id,surface);finish(context);context.toast(`Je legt ${held.label.toLowerCase()} neer.`);return true;}
    if(actionId==='take-item'){const item=inventory.surfaceItems(surface)[0];if(!item){context.toast('Er ligt hier niets.');return true;}inventory.hold(item.id);finish(context);context.toast(`Je pakt ${item.label.toLowerCase()}.`);return true;}
  }
  if (objectId === 'living-plant') { context.toast(actionId==='water'?'De aarde wordt donker van het water.':'De plant groeit rustig bij het raam.'); return true; }
  return false;
};
