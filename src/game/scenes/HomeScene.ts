import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { InteractionRegistry } from '../interactions/InteractionRegistry';
import type { InteractionDefinition, Point } from '../interactions/types';
import { SaveManager } from '../persistence/SaveManager';
import { createInitialWorldState } from '../state/WorldState';
import type { InventoryItem, PlayerMode, SaveData, WorldState } from '../state/types';
import { InventoryManager } from '../inventory/InventoryManager';
import { GameClock } from '../time/GameClock';
import { ScriptedDialogueProvider } from '../dialogue/ScriptedDialogueProvider';
import { createHousePathFinder } from '../navigation/houseNavigation';
import { HOME_INTERACTIONS } from '../../data/interactions/homeInteractions';
import type { UIController } from '../../ui/UIController';

interface Room { name: string; x: number; y: number; w: number; h: number; floor: string }
type SeatId = 'bed' | 'dining-table' | 'sofa';

const ui = (): UIController => (globalThis as typeof globalThis & { QUOTIDIANO_UI: UIController }).QUOTIDIANO_UI;

export class HomeScene extends Phaser.Scene {
  private player!: Player;
  private readonly interactions = new InteractionRegistry();
  private readonly saves = new SaveManager();
  private readonly dialogues = new ScriptedDialogueProvider();
  private readonly pathFinder = createHousePathFinder();
  private world!: WorldState;
  private inventory!: InventoryManager;
  private flags: Record<string, boolean> = {};
  private clock!: GameClock;
  private pendingInteraction: InteractionDefinition | null = null;
  private seatedAt: SeatId | null = null;
  private lyingOnBed = false;

  private fridgeSprite!: Phaser.GameObjects.Sprite;
  private coffeeSprite!: Phaser.GameObjects.Sprite;
  private toasterSprite!: Phaser.GameObjects.Sprite;
  private wardrobeSprite!: Phaser.GameObjects.Image;
  private bedSprite!: Phaser.GameObjects.Image;
  private tvSprite!: Phaser.GameObjects.Image;
  private floorLampSprite!: Phaser.GameObjects.Image;
  private livingLightShade!: Phaser.GameObjects.Rectangle;
  private washingMachineSprite!: Phaser.GameObjects.Image;
  private frontDoorSprite!: Phaser.GameObjects.Sprite;
  private breakfastPlateSprite!: Phaser.GameObjects.Image;
  private coffeeServingSprite!: Phaser.GameObjects.Image;
  private keyMarker!: Phaser.GameObjects.Text;

  constructor() { super('HomeScene'); }

  create(): void {
    const saved = this.saves.load();
    this.world = { ...createInitialWorldState(), ...(saved?.world ?? {}) };
    this.flags = { ...(saved?.flags ?? {}) };
    const initialItems: InventoryItem[] = saved?.inventory?.map((item) => ({ ...item })) ?? [
      { id: 'phone', label: 'Telefoon', location: 'IN_BAG' },
      { id: 'wallet', label: 'Portemonnee', location: 'IN_BAG' },
      { id: 'keys', label: 'Sleutels', location: 'WORLD' }
    ];
    this.inventory = new InventoryManager(initialItems);
    if (!this.inventory.anywhere('phone')) this.inventory.set('phone', 'Telefoon', 'IN_BAG');
    if (!this.inventory.anywhere('wallet')) this.inventory.set('wallet', 'Portemonnee', 'IN_BAG');
    if (!this.inventory.anywhere('keys')) this.inventory.set('keys', 'Sleutels', 'WORLD');
    this.clock = new GameClock(this.world.day, this.world.minutes);

    this.buildHouse();
    this.player = new Player(this, 156, 196, (point) => this.pathFinder.isWalkable(point));
    this.physics.world.setBounds(24, 24, 912, 672);
    this.player.sprite.setCollideWorldBounds(true);
    HOME_INTERACTIONS.forEach((entry) => this.interactions.register({ ...entry, actions: [...entry.actions] }));
    this.bindInput();
    this.bindUI();
    this.syncVisualState();
    ui().setClock(this.clock.label());
    ui().toast('Goedemorgen. WASD/setas · clique para andar · E interagir · I rugzak · P telefoon', 4300);
  }

  update(_time: number, delta: number): void {
    const result = this.player.update(delta);
    if (result === 'failed') { this.pendingInteraction = null; ui().toast('Ik kan daar niet komen.'); }
    if (result === 'arrived' && this.pendingInteraction) {
      const target = this.pendingInteraction;
      this.pendingInteraction = null;
      this.openInteraction(target);
    }
    const nearest = this.interactions.nearest(this.player.sprite.x, this.player.sprite.y, 86);
    const canPrompt = ['FREE','SITTING','LYING'].includes(this.player.state.mode);
    if (nearest && canPrompt) ui().showPrompt(`E · ${nearest.objectId}`); else if (!this.pendingInteraction) ui().hidePrompt();
  }

  private bindUI(): void {
    ui().onAction = (interactionId, actionId) => this.performAction(interactionId, actionId);
    ui().onPhoneMessageRead = () => { this.world.hasReadMorningMessage = true; this.autosave(); };
    ui().onOpenDialogue = (dialogueId) => this.openDialogue(dialogueId);
    ui().onDialogueClosed = () => this.player.state.set(this.restMode());
    ui().onDialogueResponse = (dialogueId, intent) => {
      this.flags[`dialogue:${dialogueId}:${intent}`] = true;
      this.world.hasReadMorningMessage = dialogueId === 'morning_message' ? true : this.world.hasReadMorningMessage;
      this.player.state.set(this.restMode());
      ui().toast(intent === 'ACCEPT_COFFEE' ? 'Prima. Tot straks!' : 'Begrepen.');
      this.autosave();
    };
  }

  private buildHouse(): void {
    const rooms: Room[] = [
      { name: 'QUARTO', x: 42, y: 48, w: 300, h: 260, floor: 'floor-wood' },
      { name: 'BANHEIRO', x: 354, y: 48, w: 210, h: 260, floor: 'floor-tile' },
      { name: 'COZINHA', x: 576, y: 48, w: 342, h: 260, floor: 'floor-parquet' },
      { name: 'SALA', x: 42, y: 320, w: 420, h: 350, floor: 'floor-wood' },
      { name: 'ENTRADA', x: 474, y: 320, w: 270, h: 350, floor: 'floor-parquet' },
      { name: 'LAVANDERIA', x: 756, y: 320, w: 162, h: 350, floor: 'floor-tile' }
    ];
    rooms.forEach((room) => this.drawRoom(room));
    this.addOpening(334, 215, 36, 72, 'floor-wood');
    this.addOpening(556, 215, 36, 72, 'floor-tile');
    this.addOpening(250, 300, 72, 36, 'floor-wood');
    this.addOpening(425, 300, 72, 36, 'floor-tile');
    this.addOpening(655, 300, 72, 36, 'floor-parquet');
    this.addOpening(830, 300, 60, 36, 'floor-parquet');
    this.addOpening(454, 520, 36, 72, 'floor-wood');
    this.addOpening(736, 520, 36, 72, 'floor-parquet');

    this.bedSprite = this.add.image(138, 128, 'bed').setDepth(130);
    this.wardrobeSprite = this.add.image(288, 134, 'wardrobe').setDepth(136);
    this.add.image(520, 142, 'shower').setDepth(146);
    this.add.image(414, 138, 'bathroom-sink').setDepth(144);
    this.add.image(410, 252, 'toilet').setDepth(255);

    this.fridgeSprite = this.add.sprite(870, 132, 'fridge', 0).setDepth(150);
    this.add.sprite(650, 142, 'oven', 0).setDepth(160);
    this.toasterSprite = this.add.sprite(684, 148, 'toaster', 0).setDepth(168);
    this.coffeeSprite = this.add.sprite(734, 148, 'coffee', 0).setDepth(170);
    this.add.image(780, 138, 'kitchen-counter').setDepth(155);
    this.add.image(812, 250, 'dining-table').setDepth(250);
    this.add.image(730, 250, 'dining-chair').setDepth(252);
    this.breakfastPlateSprite = this.add.image(800, 235, 'breakfast-plate').setDepth(260).setVisible(false);
    this.coffeeServingSprite = this.add.image(824, 238, 'coffee-serving').setDepth(261).setVisible(false);

    this.add.image(160, 420, 'sofa').setDepth(430);
    this.tvSprite = this.add.image(318, 420, 'tv').setDepth(440);
    this.floorLampSprite = this.add.image(400, 540, 'floor-lamp').setDepth(542);
    this.add.image(72, 540, 'bookshelf').setDepth(542);
    this.livingLightShade = this.add.rectangle(252, 495, 390, 316, 0x111722, 0.18).setDepth(900).setVisible(false);
    this.washingMachineSprite = this.add.image(838, 430, 'washing-machine').setDepth(445);
    this.frontDoorSprite = this.add.sprite(610, 604, 'front-door', 0).setDepth(610);

    // No suitable standalone key sprite was identifiable in the supplied sorter; keep the marker informational only.
    this.keyMarker = this.add.text(542, 562, '🔑', { fontSize: '20px' }).setDepth(570);

    for (const [x,y,label] of [[54,60,'QUARTO'],[366,60,'BANHEIRO'],[588,60,'COZINHA / JANTAR'],[54,332,'SALA'],[486,332,'ENTRADA'],[768,332,'LAVANDERIA']] as const) {
      this.add.text(x, y, label, { fontFamily:'monospace', fontSize:'10px', color:'#657086' }).setDepth(1000);
    }
  }

  private addOpening(x: number, y: number, w: number, h: number, floor: string): void {
    this.add.tileSprite(x + w/2, y + h/2, w, h, floor).setDepth(11);
  }

  private drawRoom(room: Room): void {
    this.add.tileSprite(room.x + room.w/2, room.y + room.h/2, room.w, room.h, room.floor).setDepth(0);
    const wall = 16;
    this.add.tileSprite(room.x + room.w/2, room.y + wall/2, room.w, wall, 'wall-light').setDepth(10);
    this.add.tileSprite(room.x + wall/2, room.y + room.h/2, wall, room.h, 'wall-light').setDepth(10);
    this.add.tileSprite(room.x + room.w - wall/2, room.y + room.h/2, wall, room.h, 'wall-light').setDepth(10);
    this.add.tileSprite(room.x + room.w/2, room.y + room.h - wall/2, room.w, wall, 'wall-light').setDepth(10);
  }

  private bindInput(): void {
    const keyboard = this.input.keyboard!;
    keyboard.on('keydown-E', () => this.interactNearest());
    keyboard.on('keydown-SPACE', () => this.interactNearest());
    keyboard.on('keydown-P', () => this.togglePhone());
    keyboard.on('keydown-I', () => this.toggleInventory());
    keyboard.on('keydown-ESC', () => this.handleEscape());

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.player.state.isFree() || ui().isPhoneOpen()) return;
      const p = { x: Phaser.Math.Clamp(pointer.worldX, 30, 930), y: Phaser.Math.Clamp(pointer.worldY, 30, 690) };
      const clicked = this.interactions.all().map((entry) => ({ entry, d: Math.hypot(entry.actionPoint.x-p.x, entry.actionPoint.y-p.y) })).sort((a,b)=>a.d-b.d)[0];
      if (clicked && clicked.d < 58) {
        this.pendingInteraction = clicked.entry;
        this.routePlayer(clicked.entry.approachPoint);
      } else {
        this.pendingInteraction = null;
        this.routePlayer(p);
      }
    });
  }

  private routePlayer(destination: Point): void {
    const from = { x: this.player.sprite.x, y: this.player.sprite.y };
    const route = this.pathFinder.findPath(from, destination);
    if (!route?.length) { ui().toast('Ik kan daar niet komen.'); return; }
    this.player.navigation.setPath(destination, route, this.player.sprite, (start, goal) => this.pathFinder.findPath(start, goal));
  }

  private interactNearest(): void {
    if (['SHOWERING','COOKING','EATING','DRINKING','SLEEPING','TRANSITION'].includes(this.player.state.mode)) return;
    const nearest = this.interactions.nearest(this.player.sprite.x, this.player.sprite.y, 96);
    if (!nearest) { ui().toast('Niets om hier te gebruiken.'); return; }
    this.openInteraction(nearest);
  }

  private openInteraction(entry: InteractionDefinition): void {
    this.player.navigation.cancel(this.player.sprite);
    this.player.face(entry.facing);
    this.player.state.set('INTERACTING');
    ui().openInteraction(entry);
  }

  private openDialogue(dialogueId: string): void {
    const line = this.dialogues.get(dialogueId);
    if (!line) return;
    this.player.navigation.cancel(this.player.sprite);
    this.player.state.set('DIALOGUE');
    ui().showDialogue(line);
  }

  private togglePhone(): void {
    if (!this.inventory.has('phone')) { ui().toast('Mijn telefoon zit niet in de tas.'); return; }
    if (['SHOWERING','COOKING','EATING','SLEEPING','TRANSITION'].includes(this.player.state.mode)) return;
    if (ui().togglePhone()) this.player.state.set('USING_PHONE'); else this.player.state.set(this.restMode());
  }

  private toggleInventory(): void {
    if (this.player.state.mode === 'INVENTORY') { ui().closeInteraction(); this.player.state.set(this.restMode()); return; }
    if (['SHOWERING','COOKING','EATING','SLEEPING','TRANSITION'].includes(this.player.state.mode)) return;
    ui().openInventory(this.inventory.all(), InventoryManager.CAPACITY);
    this.player.state.set('INVENTORY');
  }

  private handleEscape(): void {
    if (ui().isPhoneOpen()) { ui().closePhone(); this.player.state.set(this.restMode()); return; }
    ui().closeInteraction();
    if (this.lyingOnBed) { this.standFromBed(); return; }
    if (this.seatedAt) { this.standFromSeat(); return; }
    this.player.sprite.setAngle(0);
    this.player.state.set('FREE');
  }

  private performAction(interactionId: string, actionId: string): void {
    ui().closeInteraction();
    const finish = (mode: PlayerMode = this.restMode()) => this.player.state.set(mode);
    switch (`${interactionId}:${actionId}`) {
      case 'bed:sit':
        this.lyingOnBed = false; this.seatedAt = 'bed'; this.player.place(205, 156); this.player.face('left'); finish('SITTING'); ui().toast('Je zit op de rand van het bed.'); return;
      case 'bed:lie':
        this.seatedAt = null; this.lyingOnBed = true; this.player.navigation.cancel(this.player.sprite); this.player.place(145,142); this.player.sprite.setAngle(90); finish('LYING'); ui().toast('Je ligt op bed. Esc om op te staan.', 2200); return;
      case 'bed:stand': this.standFromBed(); return;
      case 'bed:make':
        if (this.lyingOnBed) { ui().toast('Sta eerst op.'); finish('LYING'); return; }
        this.world.bedMade = true; this.syncVisualState(); ui().toast('Het bed is opgemaakt.'); break;
      case 'bed:sleep':
        this.seatedAt = null; this.lyingOnBed = true; this.player.state.set('SLEEPING'); this.player.place(145,142); this.player.sprite.setAngle(90);
        this.cameras.main.fadeOut(550, 8,10,18);
        this.time.delayedCall(650, () => {
          this.clock.advance(8*60); this.world.day=this.clock.day; this.world.minutes=this.clock.minutes;
          this.world.showeredToday=false; this.world.breakfastEaten=false; this.world.breakfastOnTable=false; this.world.coffeeReady=false; this.world.coffeeOnTable=false; this.world.toastReady=false;
          this.inventory.remove('toast'); this.inventory.remove('coffee');
          this.cameras.main.fadeIn(550,8,10,18); ui().setClock(this.clock.label()); this.player.sprite.setAngle(0); this.player.place(210,194); this.lyingOnBed=false; finish('FREE'); this.syncVisualState(); this.autosave();
        });
        return;
      case 'wardrobe:toggle': this.world.wardrobeOpen = !this.world.wardrobeOpen; this.syncVisualState(); ui().toast(this.world.wardrobeOpen ? 'De kast is open.' : 'De kast is dicht.'); break;
      case 'wardrobe:dress':
        if (!this.world.wardrobeOpen) { ui().toast('Open eerst de kast.'); break; }
        this.world.outfit='day'; this.inventory.set('dirty-clothes','Vuile kleding','HELD'); ui().toast('Gele jas, groen shirt, donkere broek. De oude kleding is in je hand.'); break;
      case 'shower:shower':
        this.player.state.set('SHOWERING'); this.player.sprite.setVisible(false); this.cameras.main.flash(220,180,210,255);
        this.time.delayedCall(1300, () => { this.player.sprite.setVisible(true); this.world.showeredToday=true; this.advanceTime(12); ui().toast('Fris en klaar voor de dag.'); finish('FREE'); this.autosave(); }); return;
      case 'sink:wash-hands': this.advanceTime(2); ui().toast('Je wast je handen.'); break;
      case 'sink:wash-face': this.advanceTime(3); ui().toast('Je wast je gezicht.'); break;
      case 'toilet:use': this.advanceTime(3); ui().toast('Klaar.'); break;
      case 'toilet:flush': ui().toast('Je spoelt door.'); break;
      case 'fridge:toggle': this.world.fridgeOpen=!this.world.fridgeOpen; this.syncVisualState(); ui().toast(this.world.fridgeOpen?'De koelkast is open.':'De koelkast is dicht.'); break;
      case 'fridge:take-breakfast':
        if (!this.world.fridgeOpen) { ui().toast('Open eerst de koelkast.'); break; }
        this.inventory.set('bread','Brood','HELD'); ui().toast('Je pakt brood.'); break;
      case 'toaster:toast':
        if (!this.inventory.anywhere('bread')) { ui().toast('Je hebt brood nodig.'); break; }
        this.player.state.set('COOKING'); this.inventory.remove('bread'); this.toasterSprite.play('toaster-run');
        this.time.delayedCall(1500,()=>{this.world.toastReady=true;this.inventory.set('toast','Geroosterd brood','HELD');this.toasterSprite.setFrame(10);ui().toast('De toast is klaar.');finish('FREE');this.autosave();}); return;
      case 'coffee:brew':
        this.player.state.set('COOKING'); this.coffeeSprite.play('coffee-brew');
        this.time.delayedCall(1700,()=>{this.world.coffeeReady=true;this.coffeeSprite.setFrame(5);ui().toast('De koffie is klaar. Pak een kopje.');finish('FREE');this.autosave();}); return;
      case 'coffee:take':
        if(!this.world.coffeeReady){ui().toast('Eerst koffie zetten.');break;}
        this.world.coffeeReady=false; this.inventory.set('coffee','Koffie','HELD'); this.syncVisualState(); ui().toast('Je pakt de koffie voorzichtig.'); break;
      case 'dining-table:place-breakfast': {
        const toast=this.inventory.get('toast'), coffee=this.inventory.get('coffee');
        if(!toast || !coffee){ui().toast('Je hebt toast en koffie nodig.');break;}
        this.inventory.move('toast','ON_SURFACE'); this.inventory.move('coffee','ON_SURFACE'); this.world.breakfastOnTable=true; this.world.coffeeOnTable=true; this.syncVisualState(); ui().toast('Ontbijt staat op tafel.'); break;
      }
      case 'dining-table:sit':
        this.seatedAt='dining-table'; this.lyingOnBed=false; this.player.place(744,268); this.player.face('right'); finish('SITTING'); ui().toast('Je gaat aan tafel zitten.'); return;
      case 'dining-table:eat':
        if(this.seatedAt!=='dining-table'){ui().toast('Ga eerst zitten.');finish('FREE');break;}
        if(!this.world.breakfastOnTable){ui().toast('Er staat nog geen ontbijt op tafel.');finish('SITTING');break;}
        this.player.state.set('EATING');
        this.time.delayedCall(1000,()=>{this.world.breakfastEaten=true;this.world.breakfastOnTable=false;this.world.coffeeOnTable=false;this.inventory.remove('toast');this.inventory.remove('coffee');this.advanceTime(15);this.syncVisualState();this.openDialogue('breakfast_ready');this.autosave();}); return;
      case 'dining-table:stand': this.standFromSeat(); return;
      case 'sofa:sit': this.seatedAt='sofa'; this.lyingOnBed=false; this.player.place(160,438); this.player.face('up'); finish('SITTING'); ui().toast('Je gaat op de bank zitten.'); return;
      case 'sofa:relax': if(this.seatedAt!=='sofa'){ui().toast('Ga eerst zitten.');break;} this.advanceTime(10); ui().toast('Even rust.'); finish('SITTING'); return;
      case 'sofa:stand': this.standFromSeat(); return;
      case 'tv:toggle': this.world.tvOn=!this.world.tvOn; this.syncVisualState(); ui().toast(this.world.tvOn?'De televisie is aan.':'De televisie is uit.'); break;
      case 'living-lamp:toggle': this.world.lightsOn=!this.world.lightsOn; this.syncVisualState(); ui().toast(this.world.lightsOn?'De lamp is aan.':'De lamp is uit.'); break;
      case 'bookshelf:examine': ui().toast('Romans, een woordenboek en een paar tijdschriften.'); break;
      case 'bookshelf:take-book':
        if(this.inventory.anywhere('book')) ui().toast('Je hebt al een boek.');
        else { this.inventory.set('book','Boek','HELD'); ui().toast('Je pakt een boek uit de kast.'); }
        break;
      case 'bookshelf:read-book':
        if(!this.inventory.anywhere('book')) { ui().toast('Pak eerst een boek.'); break; }
        this.openDialogue('book_excerpt'); this.autosave(); return;
      case 'bookshelf:return-book':
        if(!this.inventory.anywhere('book')) ui().toast('Je hebt geen boek om terug te zetten.');
        else { this.inventory.remove('book'); ui().toast('Je zet het boek terug in de kast.'); }
        break;
      case 'keys:take':
        if(this.inventory.add('keys','Sleutels')) { this.syncVisualState(); ui().toast('Sleutels meegenomen.'); } else ui().toast('Je tas zit vol.'); break;
      case 'keys:leave': this.inventory.move('keys','WORLD'); this.syncVisualState(); ui().toast('Sleutels neergelegd.'); break;
      case 'front-door:unlock':
        if(!this.inventory.has('keys')) ui().toast('Waar zijn mijn sleutels?'); else {this.world.doorLocked=false;this.syncVisualState();ui().toast('De deur is ontgrendeld.');} break;
      case 'front-door:lock':
        if(!this.inventory.has('keys')) ui().toast('Je hebt de sleutels nodig.'); else {this.world.doorLocked=true;this.syncVisualState();ui().toast('De deur is op slot.');} break;
      case 'front-door:leave-house':
        if(this.world.doorLocked) ui().toast('De deur is nog op slot.'); else ui().toast('StreetScene blijft vergrendeld tot de Casa-quality-gate slaagt.',2600); break;
      case 'laundry:toggle': this.world.laundryOpen=!this.world.laundryOpen; this.syncVisualState(); ui().toast(this.world.laundryOpen?'De wasmachine is open.':'De wasmachine is dicht.'); break;
      case 'laundry:load':
        if(!this.world.laundryOpen){ui().toast('Open eerst de wasmachine.');break;}
        if(!this.inventory.anywhere('dirty-clothes')){ui().toast('Je hebt geen vuile kleding vast.');break;}
        this.inventory.remove('dirty-clothes'); this.world.laundryState='LOADED'; this.syncVisualState(); ui().toast('De kleding zit in de machine.'); break;
      case 'laundry:wash':
        if(this.world.laundryOpen){ui().toast('Sluit eerst de deur.');break;}
        if(this.world.laundryState!=='LOADED'){ui().toast('De machine is nog leeg.');break;}
        this.world.laundryState='RUNNING'; this.syncVisualState(); this.player.state.set('INTERACTING'); ui().toast('De wasmachine draait.');
        this.time.delayedCall(1800,()=>{this.world.laundryState='DONE';this.advanceTime(20);this.syncVisualState();finish('FREE');this.autosave();}); return;
      case 'laundry:remove':
        if(!this.world.laundryOpen){ui().toast('Open eerst de wasmachine.');break;}
        if(this.world.laundryState!=='DONE'){ui().toast('De was is nog niet klaar.');break;}
        this.world.laundryState='EMPTY'; this.inventory.set('clean-clothes','Schone kleding','HELD'); this.syncVisualState(); ui().toast('Je haalt de schone was eruit.'); break;
    }
    this.autosave(); finish();
  }

  private standFromBed(): void {
    this.lyingOnBed=false; this.seatedAt=null; this.player.sprite.setAngle(0); this.player.place(210,194); this.player.face('left'); this.player.state.set('FREE');
  }

  private standFromSeat(): void {
    const seat=this.seatedAt; this.seatedAt=null; this.player.sprite.setAngle(0);
    if(seat==='dining-table') this.player.place(690,265); else if(seat==='sofa') this.player.place(160,492); else this.player.place(210,194);
    this.player.state.set('FREE');
  }

  private restMode(): PlayerMode { return this.lyingOnBed ? 'LYING' : this.seatedAt ? 'SITTING' : 'FREE'; }

  private advanceTime(minutes: number): void {
    this.clock.advance(minutes); this.world.day=this.clock.day; this.world.minutes=this.clock.minutes; ui().setClock(this.clock.label());
  }

  private syncVisualState(): void {
    if (this.fridgeSprite) this.fridgeSprite.setFrame(this.world.fridgeOpen ? 4 : 0);
    if (this.coffeeSprite) this.coffeeSprite.setFrame(this.world.coffeeReady ? 5 : 0);
    if (this.toasterSprite) this.toasterSprite.setFrame(this.world.toastReady ? 10 : 0);
    if (this.wardrobeSprite) this.wardrobeSprite.setTint(this.world.wardrobeOpen ? 0xffffcc : 0xffffff);
    if (this.bedSprite) this.bedSprite.setTint(this.world.bedMade ? 0xffffff : 0xe6e6e6);
    if (this.frontDoorSprite) this.frontDoorSprite.setFrame(this.world.doorLocked ? 0 : 1);
    if (this.tvSprite) this.tvSprite.setTint(this.world.tvOn ? 0xccddff : 0xffffff);
    if (this.floorLampSprite) this.floorLampSprite.setTint(this.world.lightsOn ? 0xfff3bd : 0x8d929d);
    if (this.livingLightShade) this.livingLightShade.setVisible(!this.world.lightsOn);
    if (this.washingMachineSprite) this.washingMachineSprite.setTint(this.world.laundryState==='RUNNING' ? 0xccffff : this.world.laundryOpen ? 0xffffcc : 0xffffff);
    if (this.breakfastPlateSprite) this.breakfastPlateSprite.setVisible(this.world.breakfastOnTable);
    if (this.coffeeServingSprite) this.coffeeServingSprite.setVisible(this.world.coffeeOnTable);
    if (this.keyMarker) this.keyMarker.setVisible(this.inventory.has('keys','WORLD'));
    if (!this.anims.exists('coffee-brew')) this.anims.create({ key:'coffee-brew', frames:this.anims.generateFrameNumbers('coffee',{start:0,end:5}), frameRate:5, repeat:0 });
    if (!this.anims.exists('toaster-run')) this.anims.create({ key:'toaster-run', frames:this.anims.generateFrameNumbers('toaster',{start:0,end:10}), frameRate:8, repeat:0 });
  }

  private autosave(): void {
    const data: SaveData = { version:1, world:this.world, inventory:[...this.inventory.all()].map((item) => ({...item})), flags:{...this.flags} };
    this.saves.save(data);
  }
}
