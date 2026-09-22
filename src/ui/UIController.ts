import { inventory } from '../game/inventory/InventoryManager';
import { DialogueNode } from '../game/dialogue/DialogueTypes';
import { ScriptedDialogueProvider } from '../game/dialogue/ScriptedDialogueProvider';
import { matchIntent } from '../game/dialogue/IntentMatcher';
import { worldState } from '../game/state/WorldState';

export type DialogueEffectHandler = (effect: string) => void | Promise<void>;

export class UIController {
  private root: HTMLDivElement;
  private locationEl: HTMLDivElement;
  private objectiveEl: HTMLDivElement;
  private promptEl: HTMLDivElement;
  private toastEl: HTMLDivElement;
  private dialogueEl: HTMLDivElement;
  private inventoryEl: HTMLDivElement;
  private actionEl: HTMLDivElement;
  private toastTimer = 0;
  private dialogueClose?: () => void;
  private actionClose?: () => void;

  constructor() {
    const root = document.querySelector<HTMLDivElement>('#ui-root');
    if (!root) throw new Error('UI root not found');
    this.root = root;
    this.root.innerHTML = `
      <div class="q-hud"><div class="q-chip" id="q-location">Casa · 07:30</div></div>
      <div class="q-objective" id="q-objective"><small>Agora</small><strong></strong></div>
      <div class="q-prompt" id="q-prompt"></div>
      <div class="q-toast" id="q-toast"></div>
      <div class="q-dialogue" id="q-dialogue"></div>
      <div class="q-modal" id="q-inventory"><div class="q-panel"><h2>Mochila</h2><p>Objetos que você carrega com você.</p><div class="q-grid" id="q-inventory-grid"></div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="q-btn primary" id="q-close-inventory">Fechar</button></div></div></div>
      <div class="q-action-menu" id="q-actions"></div>`;
    this.locationEl = this.must('#q-location');
    this.objectiveEl = this.must('#q-objective');
    this.promptEl = this.must('#q-prompt');
    this.toastEl = this.must('#q-toast');
    this.dialogueEl = this.must('#q-dialogue');
    this.inventoryEl = this.must('#q-inventory');
    this.actionEl = this.must('#q-actions');
    this.must<HTMLButtonElement>('#q-close-inventory').onclick = () => this.hideInventory();
    this.updateObjective();
  }

  private must<T extends HTMLElement = HTMLDivElement>(selector: string): T {
    const el = this.root.querySelector<T>(selector); if (!el) throw new Error(`Missing UI element ${selector}`); return el;
  }

  setLocation(name: string, time: string): void { this.locationEl.textContent = `${name} · ${time}`; }
  updateObjective(): void { const s=this.objectiveEl.querySelector('strong'); if(s) s.textContent=worldState.data.objective; }
  setPrompt(text: string | null, position?: {x:number;y:number}): void {
    this.promptEl.textContent = text ?? '';
    if(position){ this.promptEl.style.left=`${position.x}px`; this.promptEl.style.top=`${position.y}px`; }
    this.promptEl.classList.toggle('visible', Boolean(text));
  }
  toast(text: string, ms=1900): void {
    this.toastEl.textContent=text; this.toastEl.classList.add('visible');
    window.clearTimeout(this.toastTimer); this.toastTimer=window.setTimeout(()=>this.toastEl.classList.remove('visible'),ms);
  }

  showInventory(onClose?: () => void): void {
    const grid=this.must('#q-inventory-grid'); grid.innerHTML='';
    for(let i=0;i<inventory.capacity;i++) {
      const item=inventory.items[i]; const slot=document.createElement('div'); slot.className=`q-slot${item?'':' empty'}`;
      if(item){
        const img=document.createElement('img');
        const folder=item.id==='coffee'?'cafe':'home'; img.src=`assets/${folder}/${item.icon}.png`; img.alt='';
        const strong=document.createElement('strong'); strong.textContent=item.nameNl;
        const small=document.createElement('small'); small.textContent=item.namePt;
        slot.append(img,strong,small);
      } else slot.textContent='—';
      grid.appendChild(slot);
    }
    this.inventoryEl.classList.add('visible');
    this.inventoryEl.dataset.onclose = onClose ? '1' : '';
    (this.inventoryEl as any)._onClose = onClose;
  }
  hideInventory(): void {
    if(!this.inventoryEl.classList.contains('visible')) return;
    this.inventoryEl.classList.remove('visible');
    const cb=(this.inventoryEl as any)._onClose as (()=>void)|undefined; (this.inventoryEl as any)._onClose=undefined; cb?.();
  }
  inventoryVisible(): boolean { return this.inventoryEl.classList.contains('visible'); }

  showActions(title: string, actions: {label:string; run:()=>void}[], onClose?:()=>void): void {
    this.actionEl.innerHTML=`<h3>${title}</h3>`;
    actions.forEach(a=>{ const b=document.createElement('button'); b.className='q-btn'; b.textContent=a.label; b.onclick=()=>{this.hideActions(); a.run();}; this.actionEl.appendChild(b); });
    const cancel=document.createElement('button'); cancel.className='q-btn'; cancel.textContent='Cancelar'; cancel.onclick=()=>this.hideActions(); this.actionEl.appendChild(cancel);
    this.actionClose=onClose; this.actionEl.classList.add('visible');
  }
  hideActions(): void { if(this.actionEl.classList.contains('visible')){this.actionEl.classList.remove('visible'); const cb=this.actionClose; this.actionClose=undefined; cb?.();} }
  actionsVisible(): boolean { return this.actionEl.classList.contains('visible'); }

  async playDialogue(provider: ScriptedDialogueProvider, effects: DialogueEffectHandler): Promise<void> {
    return new Promise(resolve => {
      this.dialogueClose=resolve;
      this.dialogueEl.classList.add('visible');
      this.renderDialogueNode(provider, provider.start(), effects);
    });
  }

  private renderDialogueNode(provider: ScriptedDialogueProvider, node: DialogueNode, effects: DialogueEffectHandler): void {
    let helpLevel=0;
    this.dialogueEl.innerHTML='';
    const speaker=document.createElement('div'); speaker.className='q-speaker'; speaker.textContent=node.speaker;
    const line=document.createElement('div'); line.className='q-line'; line.textContent=node.dutchText;
    const hint=document.createElement('div'); hint.className='q-hint';
    const actions=document.createElement('div'); actions.className='q-dialogue-actions';
    this.dialogueEl.append(speaker,line,hint,actions);
    const help=document.createElement('button'); help.className='q-btn'; help.textContent='Ajuda 0/4';
    help.onclick=()=>{
      helpLevel=Math.min(4,helpLevel+1); help.textContent=`Ajuda ${helpLevel}/4`;
      if(helpLevel===1){ hint.textContent='Ouça novamente.'; this.speakDutch(node.dutchText); }
      if(helpLevel===2) hint.textContent=node.keyword ?? 'Observe as palavras-chave.';
      if(helpLevel===3) hint.textContent=node.starter ?? 'Tente começar a resposta.';
      if(helpLevel===4) hint.textContent=node.portugueseHint ?? 'Tradução indisponível.';
    };
    actions.appendChild(help);
    this.speakDutch(node.dutchText);

    const advance = async (next?:string, choiceEffects:string[]=[]): Promise<void> => {
      for(const e of [...(node.effects??[]),...choiceEffects]) await effects(e);
      if(node.end || !next){ this.closeDialogue(); return; }
      this.renderDialogueNode(provider,provider.get(next),effects);
    };

    if(node.choices?.length){
      node.choices.forEach(choice=>{
        const b=document.createElement('button'); b.className='q-btn primary'; b.textContent=choice.text; b.onclick=()=>void advance(choice.next,choice.effects??[]); actions.appendChild(b);
      });
      const inputRow=document.createElement('div'); inputRow.className='q-input-row';
      const input=document.createElement('input'); input.className='q-input'; input.placeholder='Ou digite em holandês…';
      const send=document.createElement('button'); send.className='q-btn'; send.textContent='Enviar';
      send.onclick=()=>{
        const intent=matchIntent(input.value); const choice=node.choices?.find(c=>c.intent===intent);
        if(choice) void advance(choice.next,choice.effects??[]); else { hint.textContent='Sanne não entendeu completamente. Tente uma das ideias acima ou peça ajuda.'; }
      };
      input.addEventListener('keydown',e=>{if(e.key==='Enter')send.click();}); inputRow.append(input,send); this.dialogueEl.appendChild(inputRow);
    } else {
      const b=document.createElement('button'); b.className='q-btn primary'; b.textContent='Continuar'; b.onclick=()=>void advance(); actions.appendChild(b);
    }
  }

  private speakDutch(text: string): void {
    try {
      if(!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel(); const utter=new SpeechSynthesisUtterance(text); utter.lang='nl-NL'; utter.rate=.92; window.speechSynthesis.speak(utter);
    } catch { /* text remains the fallback */ }
  }
  closeDialogue(): void {
    if(!this.dialogueEl.classList.contains('visible')) return;
    this.dialogueEl.classList.remove('visible'); this.dialogueEl.innerHTML=''; const cb=this.dialogueClose; this.dialogueClose=undefined; cb?.();
  }
  dialogueVisible(): boolean { return this.dialogueEl.classList.contains('visible'); }
  closeTransient(): boolean {
    if(this.dialogueVisible()){this.closeDialogue();return true;}
    if(this.inventoryVisible()){this.hideInventory();return true;}
    if(this.actionsVisible()){this.hideActions();return true;}
    return false;
  }
}
