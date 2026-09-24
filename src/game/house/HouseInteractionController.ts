import type { HouseActionContext, RoomActionHandler } from './actions/types';
import { houseObjectById } from './HouseObjectRegistry';
import { handleBathroomAction } from './rooms/BathroomActions';
import { handleBedroomAction } from './rooms/BedroomActions';
import { handleEntryAction } from './rooms/EntryActions';
import { handleKitchenAction } from './rooms/KitchenActions';
import { handleLaundryAction } from './rooms/LaundryActions';
import { handleLivingRoomAction } from './rooms/LivingRoomActions';

const handlers: Record<string, RoomActionHandler> = {
  bedroom: handleBedroomAction,
  bathroom: handleBathroomAction,
  kitchen: handleKitchenAction,
  living: handleLivingRoomAction,
  entry: handleEntryAction,
  laundry: handleLaundryAction
};

export class HouseInteractionController {
  constructor(private readonly context: HouseActionContext) {}

  async perform(objectId: string, actionId: string): Promise<boolean> {
    if (this.context.session.busy) return false;
    const object = houseObjectById(objectId);
    if (!object) { this.context.toast('Dit object bestaat niet meer in de huisdefinitie.'); return false; }
    const handler = handlers[object.room];
    if (!handler) return false;
    this.context.session.busy = true;
    try {
      const handled = await handler(objectId, actionId, this.context);
      if (!handled) this.context.toast('Deze handeling is nog niet beschikbaar.');
      return handled;
    } finally {
      this.context.session.busy = false;
    }
  }
}
