import type { InteractionDefinition } from '../game/interactions/types';
import type { DialogueLine } from '../game/dialogue/types';
import type { InventoryItem } from '../game/state/types';

const esc = (value: string): string => value.replace(/[&<>'"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c]!);

export class UIController {
  private prompt = document.getElementById('prompt')!;
  private interaction = document.getElementById('interaction-panel')!;
  private phone = document.getElementById('phone-panel')!;
  private clock = document.getElementById('clock')!;
  // While a transient toast is on screen it takes precedence over the ambient
  // proximity prompt ("E · ..."), so gameplay feedback is not overwritten on
  // the very next frame by the nearby-object hint.
  private toastTimer: number | null = null;
  onAction: ((interactionId: string, actionId: string) => void) | null = null;
  onPhoneMessageRead: (() => void) | null = null;
  onOpenDialogue: ((dialogueId: string) => void) | null = null;
  onDialogueResponse: ((dialogueId: string, intent: string) => void) | null = null;
  onDialogueClosed: (() => void) | null = null;

  setClock(text: string): void { this.clock.textContent = `${text} · A1`; }
  showPrompt(text: string): void {
    if (this.toastTimer !== null) return;
    this.prompt.textContent = text;
    this.prompt.classList.add('visible');
  }
  hidePrompt(): void {
    if (this.toastTimer !== null) return;
    this.prompt.classList.remove('visible');
  }
  toast(text: string, ms = 1500): void {
    if (this.toastTimer !== null) window.clearTimeout(this.toastTimer);
    this.prompt.textContent = text;
    this.prompt.classList.add('visible');
    this.toastTimer = window.setTimeout(() => {
      this.toastTimer = null;
      this.prompt.classList.remove('visible');
    }, ms);
  }

  openInteraction(entry: InteractionDefinition): void {
    this.phone.classList.remove('open');
    this.interaction.innerHTML = `<h2>${esc(entry.objectId)}</h2><p>Wat wil je doen?</p><div class="action-row">${entry.actions.map(a => `<button data-action="${esc(a.id)}">${esc(a.label)}</button>`).join('')}</div><p class="small">Esc: sluiten</p>`;
    this.interaction.querySelectorAll<HTMLButtonElement>('button[data-action]').forEach((button) => button.addEventListener('click', () => this.onAction?.(entry.id, button.dataset.action!)));
    this.interaction.classList.add('open');
  }

  openInventory(items: readonly InventoryItem[], capacity: number): void {
    this.phone.classList.remove('open');
    const bag = items.filter((i) => i.location === 'IN_BAG');
    const held = items.filter((i) => i.location === 'HELD');
    const surface = items.filter((i) => i.location === 'ON_SURFACE');
    const slots = Array.from({ length: capacity }, (_, index) => `<div class="slot ${bag[index] ? 'filled' : ''}">${bag[index] ? esc(bag[index].label) : '—'}</div>`).join('');
    this.interaction.innerHTML = `<h2>Rugzak <span class="capacity">${bag.length}/${capacity}</span></h2><div class="inventory-grid">${slots}</div>${held.length ? `<p><strong>In de hand:</strong> ${held.map(i => esc(i.label)).join(', ')}</p>` : ''}${surface.length ? `<p><strong>Neergezet:</strong> ${surface.map(i => esc(i.label)).join(', ')}</p>` : ''}<p class="small">I / Esc: sluiten</p>`;
    this.interaction.classList.add('open');
  }

  closeInteraction(): void { this.interaction.classList.remove('open'); }

  showDialogue(line: DialogueLine): void {
    this.phone.classList.remove('open');
    const responses = line.responses?.map(r => `<button data-response="${esc(r.intent)}">${esc(r.text)}</button>`).join('') ?? '';
    this.interaction.innerHTML = `<h2>${esc(line.speaker)} <span class="level">${esc(line.level)}</span></h2><p class="dialogue-nl">${esc(line.textNL)}</p><p class="hint">${esc(line.hintPT ?? '')}</p><div class="action-row">${responses || '<button data-close>Verder</button>'}</div><p class="small">Contextuele hulp · geen quiz</p>`;
    this.interaction.querySelector('[data-close]')?.addEventListener('click', () => { this.closeInteraction(); this.onDialogueClosed?.(); });
    this.interaction.querySelectorAll<HTMLElement>('[data-response]').forEach((button) => button.addEventListener('click', () => {
      this.onDialogueResponse?.(line.id, button.dataset.response!);
      this.closeInteraction();
    }));
    this.interaction.classList.add('open');
  }

  openPhone(): void {
    this.closeInteraction();
    this.phone.innerHTML = `<h2>Telefoon</h2><div class="phone-apps"><button class="phone-app" data-app="messages">💬<br>Berichten</button><button class="phone-app" data-app="agenda">🗓️<br>Agenda</button><button class="phone-app" data-app="contacts">👥<br>Contacten</button></div><div id="phone-content"><p class="small">Kies een app.</p></div><p class="small">P / Esc: sluiten</p>`;
    this.phone.querySelector('[data-app="messages"]')?.addEventListener('click', () => {
      this.onPhoneMessageRead?.();
      this.phone.querySelector('#phone-content')!.innerHTML = `<p><strong>Lotte</strong></p><p lang="nl">Goedemorgen! Heb je straks tijd voor koffie?</p><button data-reply>Antwoorden</button>`;
      this.phone.querySelector('[data-reply]')?.addEventListener('click', () => this.onOpenDialogue?.('morning_message'));
    });
    this.phone.querySelector('[data-app="agenda"]')?.addEventListener('click', () => { this.phone.querySelector('#phone-content')!.innerHTML = `<p><strong>Vandaag</strong></p><p>09:00 · Administratie<br>12:30 · Lunch</p>`; });
    this.phone.querySelector('[data-app="contacts"]')?.addEventListener('click', () => { this.phone.querySelector('#phone-content')!.innerHTML = `<p>Lotte · Pieter · Werk</p>`; });
    this.phone.classList.add('open');
  }

  closePhone(): void { this.phone.classList.remove('open'); }
  isPhoneOpen(): boolean { return this.phone.classList.contains('open'); }
  togglePhone(): boolean {
    const open = this.isPhoneOpen();
    if (open) this.closePhone(); else this.openPhone();
    return !open;
  }
}
