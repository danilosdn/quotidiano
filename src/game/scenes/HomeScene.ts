import Phaser from 'phaser';
import { HOME_INTENT_VARIANTS, intentById } from '../../data/language/homeIntents';
import { HOME_INTERACTIONS } from '../../data/interactions/homeInteractions';
import type { UIController, DialogueInputResult } from '../../ui/UIController';
import { IntentMatcher } from '../dialogue/IntentMatcher';
import { ScriptedDialogueProvider } from '../dialogue/ScriptedDialogueProvider';
import { Player } from '../entities/Player';
import { HouseActionSequenceRunner } from '../house/actions/HouseActionSequenceRunner';
import type { HouseActionRuntime, HouseEffectName, HouseSessionState } from '../house/actions/types';
import { createHousePathFinder } from '../house/HouseCollisionBuilder';
import { HouseInteractionController } from '../house/HouseInteractionController';
import { HOUSE_LAYOUT } from '../house/HouseLayout';
import { houseObjectById } from '../house/HouseObjectRegistry';
import { PORTABLE_INTERACTION_ITEMS, portableInteractionPlacement } from '../house/HousePortableItemLayout';
import { HouseRenderer } from '../house/HouseRenderer';
import { HouseStateService } from '../house/HouseStateService';
import { validateHouseDefinition } from '../house/HouseValidator';
import { InteractionRegistry } from '../interactions/InteractionRegistry';
import type { InteractionDefinition, Point } from '../interactions/types';
import { InventoryManager } from '../inventory/InventoryManager';
import { HintSystem, type HintPresentation } from '../language/HintSystem';
import { SaveManager } from '../persistence/SaveManager';
import type { PlayerSnapshot, WorldState } from '../state/types';
import type { QuotidianoDebugBridge } from '../debug/QuotidianoDebugBridge';

const ui = (): UIController => (globalThis as typeof globalThis & { QUOTIDIANO_UI: UIController }).QUOTIDIANO_UI;

export class HomeScene extends Phaser.Scene {
  private player!: Player;
  private renderer!: HouseRenderer;
  private readonly interactions = new InteractionRegistry();
  private readonly saves = new SaveManager();
  private readonly dialogues = new ScriptedDialogueProvider();
  private readonly matcher = new IntentMatcher();
  private readonly pathFinder = createHousePathFinder();
  private stateService!: HouseStateService;
  private world!: WorldState;
  private inventory!: InventoryManager;
  private hintSystem!: HintSystem;
  private runner!: HouseActionSequenceRunner;
  private controller!: HouseInteractionController;
  private readonly session: HouseSessionState = { seatedAt:null, lyingOnBed:false, busy:false };
  private pendingInteraction: InteractionDefinition | null = null;
  private currentDialogueId: string | null = null;
  private lastRoomId = '';
  private toastUntil = 0;

  constructor() { super('HomeScene'); }

  create(): void {
    this.stateService = new HouseStateService(this.saves);
    this.world = this.stateService.world;
    this.inventory = this.stateService.inventory;
    this.hintSystem = new HintSystem(this.stateService.preferences.hintLevel);

    this.renderer = new HouseRenderer(this);
    this.renderer.build();

    const snapshot = this.safeRestoreSnapshot(this.stateService.restoredPlayer);
    this.player = new Player(this, snapshot.x, snapshot.y, (point) => this.pathFinder.isWalkable(point));
    this.restorePlayer(snapshot);
    this.physics.world.setBounds(18, 18, HOUSE_LAYOUT.width - 36, HOUSE_LAYOUT.height - 36);
    this.player.sprite.setCollideWorldBounds(true);

    for (const entry of HOME_INTERACTIONS) this.interactions.register({ ...entry, actions:[...entry.actions] });
    this.runner = new HouseActionSequenceRunner(this.createActionRuntime());
    this.controller = new HouseInteractionController({
      world:this.world,
      inventory:this.inventory,
      runner:this.runner,
      session:this.session,
      approachPoint:(id) => this.pointFor(id, 'approach'),
      actionPoint:(id) => this.pointFor(id, 'action'),
      toast:(text, ms) => this.toast(text, ms),
      openDialogue:(id) => this.openDialogue(id),
      openInventory:() => this.openInventory(),
      setObjective:(text) => { this.stateService.setObjective(text); this.refreshHud(); },
      completeScenario:(id) => { this.stateService.completeScenario(id); this.refreshHud(); },
      sync:() => this.syncVisualState(),
      autosave:() => this.autosave()
    });

    this.bindInput();
    this.bindUI();
    this.syncVisualState();
    this.refreshHud();
    this.installDebugBridge();

    if (new URLSearchParams(window.location.search).has('debug')) this.renderer.toggleDebug(true);
    this.time.addEvent({ delay:15000, loop:true, callback:() => this.autosave() });
    this.time.delayedCall(420, () => {
      if (this.world.alarmState === 'RINGING' && !ui().isAnyPanelOpen()) this.openDialogue('alarm_start');
    });
    this.toast('WASD/setas · clique para andar · E interagir · I rugzak · P telefoon · F3 debug', 4400);
  }

  update(_time: number, delta: number): void {
    const result = this.player.update(delta);
    this.renderer.updatePlayerAttachment(this.player.sprite.x, this.player.sprite.y);

    if (result === 'failed') {
      this.pendingInteraction = null;
      this.toast('Ik kan daar niet komen.');
    } else if (result === 'arrived' && this.pendingInteraction) {
      const target = this.pendingInteraction;
      this.pendingInteraction = null;
      this.openInteraction(target);
    } else if (!result && this.pendingInteraction && !this.player.navigation.hasTarget() && this.player.state.mode === 'FREE') {
      this.pendingInteraction = null;
    }

    this.updateLocationChip();
    if (this.time.now < this.toastUntil || ui().isAnyPanelOpen()) return;
    const nearest = this.nearestActiveInteraction(92);
    const canPrompt = ['FREE','SITTING','LYING'].includes(this.player.state.mode);
    if (nearest && canPrompt) ui().showPrompt(`E · ${nearest.objectId}`);
    else if (!this.pendingInteraction) ui().hidePrompt();
  }

  private createActionRuntime(): HouseActionRuntime {
    return {
      face:(direction) => this.player.face(direction),
      move:(point, duration) => this.player.moveToVisual(point.x, point.y, duration),
      pose:(pose) => this.player.setPose(pose),
      animate:(action) => this.player.playAction(action),
      setMode:(mode) => this.player.state.set(mode),
      effect:(effect, visible) => this.setEffect(effect, visible),
      wait:(ms) => new Promise((resolve) => this.time.delayedCall(ms, resolve)),
      advanceTime:(minutes) => { this.stateService.advanceTime(minutes); this.refreshHud(); },
      sync:() => this.syncVisualState(),
      pulse:(objectId) => this.renderer.pulseObject(objectId),
      toast:(text, ms) => this.toast(text, ms),
      dialogue:(dialogueId) => this.openDialogue(dialogueId),
      autosave:() => this.autosave()
    };
  }

  private bindUI(): void {
    const controller = ui();
    controller.setPreferences(this.stateService.preferences);
    controller.onAction = (interactionId, actionId) => {
      controller.closeInteraction();
      void this.controller.perform(interactionId, actionId);
    };
    controller.onPhoneMessageRead = (messageId) => {
      this.stateService.flags[`phone:read:${messageId}`] = true;
      if (messageId === 'lotte-coffee') this.world.hasReadMorningMessage = true;
      this.autosave();
    };
    controller.onOpenDialogue = (dialogueId) => this.openDialogue(dialogueId);
    controller.onDialogueClosed = () => {
      this.currentDialogueId = null;
      this.restoreRestMode();
    };
    controller.onDialogueResponse = (dialogueId, intent) => this.applyDialogueIntent(dialogueId, intent);
    controller.onDialogueText = (dialogueId, text) => this.matchDialogueInput(dialogueId, text);
    controller.onRequestHint = (dialogueId) => this.requestHint(dialogueId);
    controller.onHintLevelChange = (level) => {
      this.hintSystem.set(level);
      this.stateService.preferences.hintLevel = level;
      controller.setPreferences(this.stateService.preferences);
      this.autosave();
    };
    controller.onTtsEnabledChange = (enabled) => {
      this.stateService.preferences.ttsEnabled = enabled;
      controller.setPreferences(this.stateService.preferences);
      this.autosave();
    };
    controller.onPhoneClosed = () => this.restoreRestMode();
    controller.onInventoryAction = (itemId, action) => this.handleInventoryAction(itemId, action);
  }

  private bindInput(): void {
    const keyboard = this.input.keyboard!;
    keyboard.on('keydown-E', () => this.interactNearest());
    keyboard.on('keydown-SPACE', () => this.interactNearest());
    keyboard.on('keydown-P', () => { void this.togglePhone(); });
    keyboard.on('keydown-I', () => this.toggleInventory());
    keyboard.on('keydown-ESC', () => this.handleEscape());
    keyboard.on('keydown-F3', () => this.toast(this.renderer.toggleDebug() ? 'Debugweergave aan.' : 'Debugweergave uit.'));

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.player.state.isFree() || ui().isAnyPanelOpen() || this.runner.isRunning) return;
      const point = {
        x: Phaser.Math.Clamp(pointer.worldX, 24, HOUSE_LAYOUT.width - 24),
        y: Phaser.Math.Clamp(pointer.worldY, 24, HOUSE_LAYOUT.height - 24)
      };
      const clicked = this.activeInteractions()
        .map((entry) => ({ entry, distance:Math.hypot(entry.actionPoint.x-point.x, entry.actionPoint.y-point.y) }))
        .sort((left, right) => left.distance-right.distance)[0];
      if (clicked && clicked.distance < 58) {
        this.pendingInteraction = clicked.entry;
        this.routePlayer(clicked.entry.approachPoint);
      } else {
        this.pendingInteraction = null;
        this.routePlayer(point);
      }
    });
  }

  private routePlayer(destination: Point): boolean {
    const from = { x:this.player.sprite.x, y:this.player.sprite.y };
    const route = this.pathFinder.findPath(from, destination);
    if (!route?.length) { this.toast('Ik kan daar niet komen.'); return false; }
    this.player.navigation.setPath(destination, route, this.player.sprite, (start, goal) => this.pathFinder.findPath(start, goal));
    this.renderer.showDebugPath([from, ...route]);
    return true;
  }

  private interactNearest(): void {
    if (ui().isAnyPanelOpen()) return;
    if (['SHOWERING','COOKING','EATING','DRINKING','SLEEPING','TRANSITION','DIALOGUE'].includes(this.player.state.mode)) return;
    const nearest = this.nearestActiveInteraction(100);
    if (!nearest) { this.toast('Niets om hier te gebruiken.'); return; }
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
    if (!line) { this.toast(`Dialoog ontbreekt: ${dialogueId}`); return; }
    this.player.navigation.cancel(this.player.sprite);
    this.currentDialogueId = dialogueId;
    this.player.state.set('DIALOGUE');
    ui().showDialogue(line, this.hintSystem.present(line));
  }

  private matchDialogueInput(dialogueId: string, text: string): DialogueInputResult {
    const line = this.dialogues.get(dialogueId);
    if (!line?.intents?.length) return { matched:false, message:'Deze zin vraagt geen antwoord.' };
    const intent = this.matcher.matchAllowed(text, line.intents, HOME_INTENT_VARIANTS);
    if (!intent) return { matched:false, message:'Ik begrijp je nog niet. Probeer het natuurlijk opnieuw of vraag om meer hulp.' };
    this.applyDialogueIntent(dialogueId, intent);
    return { matched:true, message:intentById(intent)?.confirmationNL ?? 'Begrepen.' };
  }

  private applyDialogueIntent(dialogueId: string, intent: string): void {
    const line = this.dialogues.get(dialogueId);
    this.stateService.flags[`dialogue:${dialogueId}:${intent}`] = true;
    if (intent === 'STOP_ALARM') { this.world.alarmState='OFF'; this.stateService.completeScenario('morning-alarm'); }
    if (intent === 'SNOOZE') this.world.alarmState='SNOOZED';
    if (intent === 'OPEN_CURTAINS') this.world.curtainsOpen=true;
    if (intent === 'CHOOSE_OUTFIT') this.world.outfit='day';
    if (intent === 'NEED_COAT') this.world.coatWorn=true;
    if (intent === 'NO_COAT') this.world.coatWorn=false;
    if (intent === 'READ_MESSAGE') this.world.hasReadMorningMessage=true;
    if (intent === 'ACCEPT_COFFEE' || intent === 'DECLINE_COFFEE') {
      this.world.hasReadMorningMessage=true;
      this.stateService.completeScenario('phone-message');
    }
    if (intent === 'KEYS_FOUND') this.stateService.completeScenario('find-keys');
    if (intent === 'READ_MAIL') this.world.mailRead=true;
    if (intent === 'ASK_REPEAT' && line) {
      ui().speakDutch(line.textNL, .78);
      this.time.delayedCall(120, () => this.openDialogue(dialogueId));
    }
    this.toast(intentById(intent)?.confirmationNL ?? 'Begrepen.');
    this.syncVisualState();
    this.autosave();
  }

  private requestHint(dialogueId: string): HintPresentation {
    const line = this.dialogues.get(dialogueId);
    const level = this.hintSystem.escalate();
    this.stateService.preferences.hintLevel = level;
    ui().setPreferences(this.stateService.preferences);
    this.autosave();
    return line ? this.hintSystem.present(line) : { level, label:'Hulp', text:'' };
  }

  private async togglePhone(): Promise<void> {
    if (ui().isPhoneOpen()) {
      ui().closePhone();
      this.restoreRestMode();
      return;
    }
    if (ui().isInteractionOpen() || this.runner.isRunning) return;
    if (!this.inventory.has('phone')) { this.toast('De telefoon zit niet in je rugzak.'); return; }
    this.player.navigation.cancel(this.player.sprite);
    this.player.state.set('USING_PHONE');
    ui().openPhone(this.stateService.preferences);
    await this.player.playAction('phone');
  }

  private toggleInventory(): void {
    if (ui().isPhoneOpen()) { ui().closePhone(); this.restoreRestMode(); return; }
    if (this.runner.isRunning) return;
    if (ui().isInteractionOpen()) { ui().closeInteraction(); this.currentDialogueId=null; this.restoreRestMode(); return; }
    this.openInventory();
  }

  private openInventory(): void {
    if (ui().isPhoneOpen() || this.runner.isRunning) return;
    this.player.navigation.cancel(this.player.sprite);
    this.player.state.set('INVENTORY');
    ui().openInventory(this.inventory.all(), InventoryManager.CAPACITY);
  }

  private handleInventoryAction(itemId: string, action: 'hold' | 'bag' | 'place'): void {
    if (action === 'hold') this.inventory.hold(itemId);
    if (action === 'bag') this.inventory.putInBag(itemId);
    if (action === 'place') {
      const room = this.roomAt(this.player.sprite.x, this.player.sprite.y)?.id ?? 'living';
      const surfaceByRoom: Record<string,string> = { bedroom:'desk', bathroom:'bathroom-sink', kitchen:'dining-table', living:'coffee-table', entry:'entry-console', laundry:'laundry-shelf' };
      this.inventory.placeOnSurface(itemId, surfaceByRoom[room] ?? 'coffee-table');
    }
    this.syncVisualState();
    this.autosave();
    ui().openInventory(this.inventory.all(), InventoryManager.CAPACITY);
  }

  private handleEscape(): void {
    if (ui().isPhoneOpen()) { ui().closePhone(); this.restoreRestMode(); return; }
    if (ui().isInteractionOpen()) { ui().closeInteraction(); this.currentDialogueId=null; this.restoreRestMode(); return; }
    if (this.pendingInteraction) { this.pendingInteraction=null; this.player.navigation.cancel(this.player.sprite); this.toast('Route geannuleerd.'); }
  }

  private restoreRestMode(): void {
    if (this.session.lyingOnBed) { this.player.state.set('LYING'); this.player.setPose('lie'); return; }
    if (this.session.seatedAt) { this.player.state.set('SITTING'); this.player.setPose('sit'); return; }
    this.player.state.set('FREE');
    this.player.setPose('idle');
  }

  private syncVisualState(): void {
    this.renderer.sync(this.world, this.inventory);
    this.refreshHud();
  }

  private refreshHud(): void {
    const hours = Math.floor(this.world.minutes / 60).toString().padStart(2, '0');
    const minutes = (this.world.minutes % 60).toString().padStart(2, '0');
    ui().setClock(`Dag ${this.world.day} · ${hours}:${minutes}`);
    ui().setObjective(this.world.currentObjective);
    ui().setPreferences(this.stateService.preferences);
  }

  private updateLocationChip(): void {
    const room = this.roomAt(this.player.sprite.x, this.player.sprite.y);
    if (!room || room.id === this.lastRoomId) return;
    this.lastRoomId = room.id;
    ui().setLocation(room.label);
  }

  private roomAt(x: number, y: number) {
    return HOUSE_LAYOUT.rooms.find((room) => x >= room.bounds.x && x <= room.bounds.x+room.bounds.w && y >= room.bounds.y && y <= room.bounds.y+room.bounds.h);
  }

  private toast(text: string, ms = 1700): void {
    this.toastUntil = this.time.now + ms;
    ui().toast(text, ms);
  }

  private setEffect(effect: HouseEffectName, visible: boolean): void {
    if (effect === 'shower') { this.renderer.setShowerEffect(visible); this.player.sprite.setAlpha(visible ? .82 : 1); }
    if (effect === 'sink-water') this.renderer.setSinkWater(visible);
    if (effect === 'sleep') {
      if (visible) this.cameras.main.fadeOut(500, 8, 15, 25);
      else this.cameras.main.fadeIn(550, 8, 15, 25);
    }
    if (effect === 'washing' && visible) this.renderer.pulseObject('washing-machine');
  }

  private pointFor(objectId: string, kind: 'approach' | 'action'): Point {
    const interaction = houseObjectById(objectId)?.interaction;
    if (!interaction) return { x:this.player.sprite.x, y:this.player.sprite.y };
    return kind === 'approach' ? { ...interaction.approachPoint } : { ...interaction.actionPoint };
  }

  private activeInteractions(): InteractionDefinition[] {
    return this.interactions.all().flatMap((entry) => {
      if (!PORTABLE_INTERACTION_ITEMS.has(entry.id)) return [entry];
      const item = this.inventory.get(entry.id);
      if (!item || !['WORLD','ON_SURFACE'].includes(item.location)) return [];
      if (!item.surfaceId) return [entry];
      const surfaceItems = this.inventory.surfaceItems(item.surfaceId);
      const slot = Math.max(0, surfaceItems.findIndex((candidate) => candidate.id === item.id));
      const placement = portableInteractionPlacement(item.surfaceId, item.id, slot);
      return placement ? [{ ...entry, ...placement }] : [];
    });
  }

  private nearestActiveInteraction(maxDistance: number): InteractionDefinition | null {
    return this.activeInteractions()
      .map((entry) => ({ entry, distance:Math.hypot(entry.actionPoint.x-this.player.sprite.x, entry.actionPoint.y-this.player.sprite.y) }))
      .filter(({entry,distance}) => distance <= Math.min(maxDistance, entry.radius))
      .sort((left,right) => left.distance-right.distance || right.entry.priority-left.entry.priority)[0]?.entry ?? null;
  }

  private autosave(): void {
    try { this.stateService.save(this.player.snapshot()); }
    catch { this.toast('Opslaan lukte niet in deze browser.', 2200); }
  }

  private safeRestoreSnapshot(snapshot: PlayerSnapshot): PlayerSnapshot {
    if (snapshot.mode === 'FREE' && this.pathFinder.isWalkable(snapshot)) return snapshot;
    if (snapshot.mode === 'LYING') {
      const target = this.pointForStatic('bed', 'action');
      if (Math.hypot(snapshot.x-target.x,snapshot.y-target.y)<100) return snapshot;
    }
    if (snapshot.mode === 'SITTING') {
      for (const id of ['bed','desk','dining-table','sofa'] as const) {
        const target=this.pointForStatic(id,'action');
        if(Math.hypot(snapshot.x-target.x,snapshot.y-target.y)<100)return snapshot;
      }
    }
    return { ...HOUSE_LAYOUT.safeResumePoint, facing:'down', mode:'FREE' };
  }

  private restorePlayer(snapshot: PlayerSnapshot): void {
    this.player.restore(snapshot);
    if (snapshot.mode === 'LYING') this.session.lyingOnBed=true;
    if (snapshot.mode === 'SITTING') {
      const seats = ['bed','desk','dining-table','sofa'] as const;
      const nearest = seats.map((id) => ({id,distance:Math.hypot(snapshot.x-this.pointForStatic(id,'action').x,snapshot.y-this.pointForStatic(id,'action').y)})).sort((a,b)=>a.distance-b.distance)[0];
      this.session.seatedAt=nearest.id;
    }
  }

  private pointForStatic(objectId: string, kind: 'approach'|'action'): Point {
    const interaction=houseObjectById(objectId)?.interaction;
    if(!interaction)return { ...HOUSE_LAYOUT.safeResumePoint };
    return kind==='approach'?interaction.approachPoint:interaction.actionPoint;
  }

  private installDebugBridge(): void {
    const bridge: QuotidianoDebugBridge = {
      version:'house-v3',
      getState:() => ({ world:{...this.world,roomLights:{...this.world.roomLights},completedScenarios:[...this.world.completedScenarios]}, inventory:this.inventory.serialize(), player:this.player.snapshot(), session:{...this.session}, dialogue:this.currentDialogueId }),
      validate:() => validateHouseDefinition(),
      teleportTo:(objectId) => {
        const object=houseObjectById(objectId);
        if(!object?.interaction)return false;
        this.player.navigation.cancel(this.player.sprite);
        this.player.place(object.interaction.approachPoint.x,object.interaction.approachPoint.y);
        this.player.face(object.interaction.facing);
        this.player.state.set('FREE');
        return true;
      },
      openObject:(objectId) => {
        const entry=this.interactions.get(objectId);
        if(!entry)return false;
        this.openInteraction(entry);
        return true;
      },
      perform:(objectId,actionId) => this.controller.perform(objectId,actionId),
      clearSave:() => this.saves.clear(),
      toggleDebug:() => this.renderer.toggleDebug()
    };
    globalThis.QUOTIDIANO_DEBUG = bridge;
  }
}
