import Phaser from 'phaser';
import type { InventoryManager } from '../inventory/InventoryManager';
import type { Point } from '../interactions/types';
import type { WorldState } from '../state/types';
import { HOUSE_LAYOUT } from './HouseLayout';
import { HOUSE_OBJECTS } from './HouseObjectRegistry';
import { portableItemPosition } from './HousePortableItemLayout';
import type { HouseObjectDefinition, HouseRenderLayer } from './types';

type RenderedObject = Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;

const ITEM_TEXTURES: Record<string, string> = {
  phone: 'phone',
  wallet: 'wallet',
  keys: 'keys',
  bread: 'bread',
  toast: 'toast',
  coffee: 'mug',
  mug: 'mug',
  book: 'book',
  detergent: 'detergent',
  clothes: 'clothes-bundle',
  remote: 'remote',
  mail: 'mail',
  umbrella: 'umbrella',
  backpack: 'backpack',
  coat: 'coat',
  toothbrush: 'toothbrush-cup'
};

const PORTABLE_SCALES: Record<string, number> = {
  phone:.72, wallet:.76, keys:.8, mail:.82, backpack:.9, coat:.9, umbrella:.9, toothbrush:.75,
  bread:.8, toast:.8, coffee:.75, mug:.75, book:.75, detergent:.8, clothes:.86, remote:.7
};
const REUSABLE_PORTABLE_OBJECTS = new Set(['keys','mail','backpack','coat','umbrella','toothbrush']);

const depthFor = (layer: HouseRenderLayer | undefined, y: number): number => {
  if (layer === 'floor') return 2;
  if (layer === 'wall') return 18;
  if (layer === 'surface') return Math.round(y + 30);
  if (layer === 'foreground') return 1800;
  return Math.round(y);
};

export class HouseRenderer {
  private readonly objects = new Map<string, RenderedObject>();
  private readonly roomShades = new Map<string, Phaser.GameObjects.Rectangle>();
  private readonly portableSprites = new Map<string, RenderedObject>();
  private readonly debugGraphics: Phaser.GameObjects.Graphics;
  private readonly debugLabels: Phaser.GameObjects.Text[] = [];
  private readonly heldItem: Phaser.GameObjects.Image;
  private readonly showerSteam: Phaser.GameObjects.Container;
  private readonly sinkWater: Phaser.GameObjects.Rectangle;
  private readonly tvGlow: Phaser.GameObjects.Rectangle;
  private readonly washingGlow: Phaser.GameObjects.Arc;
  private debugVisible = false;

  constructor(private readonly scene: Phaser.Scene) {
    this.debugGraphics = scene.add.graphics().setDepth(5000).setVisible(false);
    this.heldItem = scene.add.image(0, 0, 'keys').setScale(0.55).setDepth(2000).setVisible(false);
    this.showerSteam = scene.add.container(0, 0).setDepth(210).setVisible(false);
    for (const [x, y, radius, alpha] of [[518,95,10,.28],[548,112,13,.22],[532,137,9,.32],[558,78,8,.2]] as const) {
      this.showerSteam.add(scene.add.circle(x, y, radius, 0xe9f5f6, alpha));
    }
    this.sinkWater = scene.add.rectangle(420, 130, 9, 28, 0x7fcce8, .72).setDepth(150).setVisible(false);
    this.tvGlow = scene.add.rectangle(258, 347, 54, 28, 0x78bce6, .65).setDepth(373).setVisible(false);
    this.washingGlow = scene.add.circle(742, 458, 12, 0x7ccbe8, .32).setDepth(470).setVisible(false);
  }

  build(): void {
    this.drawArchitecture();
    for (const definition of HOUSE_OBJECTS) this.renderObject(definition);
    this.drawAmbientDetails();
  }

  private drawArchitecture(): void {
    const wall = HOUSE_LAYOUT.wallThickness;
    for (const room of HOUSE_LAYOUT.rooms) {
      const { x, y, w, h } = room.bounds;
      this.scene.add.tileSprite(x + w / 2, y + h / 2, w, h, room.floorTexture).setDepth(0);
      this.scene.add.tileSprite(x + w / 2, y + wall / 2, w, wall, room.wallTexture).setDepth(10);
      this.scene.add.tileSprite(x + wall / 2, y + h / 2, wall, h, room.wallTexture).setDepth(10);
      this.scene.add.tileSprite(x + w - wall / 2, y + h / 2, wall, h, room.wallTexture).setDepth(10);
      this.scene.add.tileSprite(x + w / 2, y + h - wall / 2, w, wall, room.wallTexture).setDepth(10);
      const shade = this.scene.add.rectangle(x + w / 2, y + h / 2, w - wall * 2, h - wall * 2, 0x0b1520, .25).setDepth(12).setVisible(false);
      this.roomShades.set(room.id, shade);
    }
    for (const opening of HOUSE_LAYOUT.openings) {
      const { x, y, w, h } = opening.rect;
      this.scene.add.tileSprite(x + w / 2, y + h / 2, w, h, opening.floorTexture).setDepth(11);
    }
  }

  private renderObject(definition: HouseObjectDefinition): void {
    const render = definition.render;
    if (!render) return;
    const object = render.kind === 'sprite'
      ? this.scene.add.sprite(render.x, render.y, render.texture, render.frame ?? 0)
      : this.scene.add.image(render.x, render.y, render.texture, render.frame ?? 0);
    if (render.origin) object.setOrigin(render.origin.x, render.origin.y);
    if (render.scale) object.setScale(render.scale);
    if (render.flipX) object.setFlipX(true);
    object.setDepth(depthFor(render.layer, render.y));
    object.setVisible(render.visible ?? true);
    object.setData('houseObjectId', definition.id);
    this.objects.set(definition.id, object);
  }

  private drawAmbientDetails(): void {
    // Architectural shadows and threshold strips make the rooms read as one home,
    // while remaining behind all furniture and the player.
    for (const opening of HOUSE_LAYOUT.openings.filter((entry) => entry.to !== 'outside')) {
      const { x, y, w, h } = opening.rect;
      if (w > h) this.scene.add.rectangle(x + w / 2, y + h / 2 + 8, w - 10, 4, 0x2c3440, .28).setDepth(13);
      else this.scene.add.rectangle(x + w / 2 + 8, y + h / 2, 4, h - 10, 0x2c3440, .28).setDepth(13);
    }
  }

  sync(world: WorldState, inventory: InventoryManager): void {
    this.texture('wardrobe', world.wardrobeOpen ? 'wardrobe-open-v3' : 'wardrobe-closed-v3');
    this.texture('bedside-lamp', world.roomLights.bedroom ? 'bedside-lamp-on' : 'bedside-lamp-off');
    this.frame('fridge', world.fridgeOpen ? 1 : 0);
    this.frame('oven', world.ovenOn ? 1 : 0);
    this.frame('coffee', world.coffeeReady ? 5 : 0);
    this.frame('toaster', world.toastReady ? 10 : 0);
    this.frame('front-door', world.doorOpen ? 1 : 0);

    this.syncPortableItems(inventory, world);
    this.visible('breakfast-plate', world.breakfastOnTable && !world.breakfastEaten);
    this.visible('coffee-serving', world.coffeeOnTable);

    const windowObject = this.objects.get('bedroom-window');
    if (windowObject) {
      windowObject.setAlpha(world.curtainsOpen ? .72 : 1);
      world.windowOpen ? windowObject.setTint(0xd7f3ff) : windowObject.clearTint();
    }
    const bed = this.objects.get('bed');
    if (bed) world.bedMade ? bed.clearTint() : bed.setTint(0xd9d2c7);
    const tv = this.objects.get('tv');
    if (tv) world.tvOn ? tv.setTint(0xb8e6ff) : tv.clearTint();
    this.tvGlow.setVisible(world.tvOn);

    const washer = this.objects.get('washing-machine');
    if (washer) {
      washer.clearTint();
      if (world.laundryState === 'RUNNING') washer.setTint(0xa9e9ff);
      if (world.laundryState === 'DONE' || world.laundryState === 'DRY') washer.setTint(0xd5f4c9);
    }
    this.washingGlow.setVisible(world.laundryState === 'RUNNING');
    for (const room of HOUSE_LAYOUT.rooms) this.roomShades.get(room.id)?.setVisible(!world.roomLights[room.id]);
    this.syncHeldTexture(inventory);
  }


  private syncPortableItems(inventory: InventoryManager, world: WorldState): void {
    for (const sprite of this.portableSprites.values()) sprite.setVisible(false);
    for (const id of REUSABLE_PORTABLE_OBJECTS) this.objects.get(id)?.setVisible(false);

    const surfaceSlots = new Map<string, number>();
    for (const item of inventory.all()) {
      const texture = ITEM_TEXTURES[item.id];
      const equippedCoat = item.id === 'coat' && item.equipped;
      if (!texture || (!equippedCoat && !['WORLD','ON_SURFACE'].includes(item.location))) continue;
      if (item.id === 'toast' && item.surfaceId === 'dining-table' && world.breakfastOnTable) continue;
      if (item.id === 'coffee' && item.surfaceId === 'dining-table' && world.coffeeOnTable) continue;
      const surfaceId = equippedCoat ? 'coat-hook' : item.surfaceId;
      const slot = surfaceId ? (surfaceSlots.get(surfaceId) ?? 0) : 0;
      if (surfaceId) surfaceSlots.set(surfaceId, slot + 1);
      const position = portableItemPosition(surfaceId, item.id, slot)
        ?? (REUSABLE_PORTABLE_OBJECTS.has(item.id) ? this.objectDefinitionPosition(item.id) : null);
      if (!position) continue;
      const sprite = this.portableSprite(item.id, texture);
      sprite.clearTint().setAlpha(1).setTexture(texture).setPosition(position.x, position.y).setScale(PORTABLE_SCALES[item.id] ?? .8).setDepth(Math.round(position.y + 28)).setVisible(true);
      if (equippedCoat) sprite.setTint(0x737783).setAlpha(.28);
    }
  }

  private portableSprite(itemId: string, texture: string): RenderedObject {
    if (REUSABLE_PORTABLE_OBJECTS.has(itemId)) {
      const existing = this.objects.get(itemId);
      if (existing) return existing;
    }
    const existing = this.portableSprites.get(itemId);
    if (existing) return existing;
    const sprite = this.scene.add.image(0, 0, texture).setVisible(false);
    this.portableSprites.set(itemId, sprite);
    return sprite;
  }

  private objectDefinitionPosition(id: string): Point | null {
    const render = HOUSE_OBJECTS.find((entry) => entry.id === id)?.render;
    return render ? { x:render.x, y:render.y } : null;
  }

  updatePlayerAttachment(x: number, y: number): void {
    this.heldItem.setPosition(x + 17, y - 4).setDepth(Math.round(y + 2));
  }

  setShowerEffect(visible: boolean): void { this.showerSteam.setVisible(visible); }
  setSinkWater(visible: boolean): void { this.sinkWater.setVisible(visible); }

  pulseObject(id: string): void {
    const object = this.objects.get(id);
    if (!object) return;
    this.scene.tweens.add({ targets: object, alpha: .55, yoyo: true, duration: 130, repeat: 1 });
  }

  getObject(id: string): RenderedObject | undefined { return this.objects.get(id); }

  toggleDebug(force?: boolean): boolean {
    this.debugVisible = force ?? !this.debugVisible;
    this.debugGraphics.setVisible(this.debugVisible);
    for (const label of this.debugLabels) label.destroy();
    this.debugLabels.length = 0;
    this.debugGraphics.clear();
    if (!this.debugVisible) return false;

    this.debugGraphics.lineStyle(2, 0x65d7ff, .8);
    for (const room of HOUSE_LAYOUT.rooms) {
      this.debugGraphics.strokeRect(room.bounds.x, room.bounds.y, room.bounds.w, room.bounds.h);
      this.debugLabels.push(this.scene.add.text(room.bounds.x + 20, room.bounds.y + 18, room.label, { fontFamily:'monospace', fontSize:'11px', color:'#a8ecff', backgroundColor:'#10202bcc' }).setDepth(5001));
    }
    this.debugGraphics.lineStyle(2, 0xff6c7d, .8);
    for (const object of HOUSE_OBJECTS) {
      if (object.collision) this.debugGraphics.strokeRect(object.collision.x, object.collision.y, object.collision.w, object.collision.h);
      if (!object.interaction) continue;
      this.debugGraphics.fillStyle(0x72ef95, .95).fillCircle(object.interaction.approachPoint.x, object.interaction.approachPoint.y, 4);
      this.debugGraphics.fillStyle(0xffd166, .95).fillCircle(object.interaction.actionPoint.x, object.interaction.actionPoint.y, 4);
      this.debugLabels.push(this.scene.add.text(object.interaction.actionPoint.x + 5, object.interaction.actionPoint.y - 5, object.id, { fontFamily:'monospace', fontSize:'8px', color:'#ffffff', backgroundColor:'#111827cc' }).setDepth(5001));
    }
    return true;
  }

  showDebugPath(points: readonly Point[]): void {
    if (!this.debugVisible) return;
    this.debugGraphics.lineStyle(2, 0xf7f06d, .9);
    if (!points.length) return;
    this.debugGraphics.beginPath().moveTo(points[0].x, points[0].y);
    for (const point of points.slice(1)) this.debugGraphics.lineTo(point.x, point.y);
    this.debugGraphics.strokePath();
  }

  private syncHeldTexture(inventory: InventoryManager): void {
    const held = inventory.heldItem();
    const texture = held ? ITEM_TEXTURES[held.id] : undefined;
    if (!texture) { this.heldItem.setVisible(false); return; }
    this.heldItem.setTexture(texture).setVisible(true);
  }

  shutdown(): void {
    for (const label of this.debugLabels) label.destroy();
    this.debugLabels.length = 0;
    this.debugGraphics.clear();
    this.objects.clear();
    this.roomShades.clear();
    this.portableSprites.clear();
    this.debugVisible = false;
  }

  private visible(id: string, visible: boolean): void { this.objects.get(id)?.setVisible(visible); }
  private texture(id: string, texture: string): void { this.objects.get(id)?.setTexture(texture); }
  private frame(id: string, frame: number): void {
    const object = this.objects.get(id);
    if (object instanceof Phaser.GameObjects.Sprite) object.setFrame(frame);
  }
}
