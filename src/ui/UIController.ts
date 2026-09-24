import { HOME_PHONE_AGENDA, HOME_PHONE_CONTACTS, HOME_PHONE_MESSAGES } from '../data/phone/homePhone';
import type { DialogueLine } from '../game/dialogue/types';
import type { HintPresentation } from '../game/language/HintSystem';
import type { InteractionDefinition } from '../game/interactions/types';
import type { HintLevel, InventoryItem, PlayerPreferences } from '../game/state/types';

const esc = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[character]!);

export interface DialogueInputResult { matched: boolean; message: string }

export class UIController {
  private readonly prompt = document.getElementById('prompt')!;
  private readonly interaction = document.getElementById('interaction-panel')!;
  private readonly phone = document.getElementById('phone-panel')!;
  private readonly clock = document.getElementById('clock')!;
  private readonly objective = document.getElementById('objective')!;
  private readonly location = document.getElementById('location')!;
  private readonly hintChip = document.getElementById('hint-level')!;
  private currentDialogue: DialogueLine | null = null;
  private currentHint: HintPresentation | null = null;
  private preferences: PlayerPreferences = { hintLevel:1, ttsEnabled:true, ttsRate:1 };

  onAction: ((interactionId: string, actionId: string) => void) | null = null;
  onPhoneMessageRead: ((messageId: string) => void) | null = null;
  onOpenDialogue: ((dialogueId: string) => void) | null = null;
  onDialogueResponse: ((dialogueId: string, intent: string) => void) | null = null;
  onDialogueText: ((dialogueId: string, text: string) => DialogueInputResult) | null = null;
  onDialogueClosed: (() => void) | null = null;
  onRequestHint: ((dialogueId: string) => HintPresentation) | null = null;
  onHintLevelChange: ((level: HintLevel) => void) | null = null;
  onTtsEnabledChange: ((enabled: boolean) => void) | null = null;
  onPhoneClosed: (() => void) | null = null;
  onInventoryAction: ((itemId: string, action: 'hold' | 'bag' | 'place') => void) | null = null;

  setClock(text: string): void { this.clock.textContent = text; }
  setObjective(text: string): void { this.objective.textContent = text; }
  setLocation(text: string): void { this.location.textContent = text; }
  setPreferences(preferences: PlayerPreferences): void {
    this.preferences = { ...preferences };
    this.hintChip.textContent = `Hulp ${preferences.hintLevel}/4`;
  }

  showPrompt(text: string): void { this.prompt.textContent = text; this.prompt.classList.add('visible'); }
  hidePrompt(): void { this.prompt.classList.remove('visible'); }
  toast(text: string, ms = 1700): void {
    this.showPrompt(text);
    window.setTimeout(() => { if (this.prompt.textContent === text) this.hidePrompt(); }, ms);
  }

  openInteraction(entry: InteractionDefinition): void {
    this.closePhone();
    this.currentDialogue = null;
    this.interaction.innerHTML = `
      <header class="panel-header"><div><span class="eyebrow">${esc(entry.room)}</span><h2>${esc(entry.objectId)}</h2></div><button class="icon-button" data-close aria-label="Sluiten">×</button></header>
      <p>Wat wil je doen?</p>
      <div class="action-grid">${entry.actions.map((action) => `<button data-action="${esc(action.id)}">${esc(action.label)}</button>`).join('')}</div>
      <p class="small">Esc sluit dit venster.</p>`;
    this.interaction.querySelector('[data-close]')?.addEventListener('click', () => { this.closeInteraction(); this.onDialogueClosed?.(); });
    this.interaction.querySelectorAll<HTMLButtonElement>('button[data-action]').forEach((button) => button.addEventListener('click', () => this.onAction?.(entry.id, button.dataset.action!)));
    this.interaction.classList.add('open');
  }

  openInventory(items: readonly InventoryItem[], capacity: number): void {
    this.closePhone();
    this.currentDialogue = null;
    const bag = items.filter((item) => item.location === 'IN_BAG');
    const held = items.find((item) => item.location === 'HELD');
    const slots = Array.from({ length: capacity }, (_, index) => {
      const item = bag[index];
      return `<div class="slot ${item ? 'filled' : ''}">${item ? `<strong>${esc(item.label)}</strong><button data-item="${esc(item.id)}" data-inventory-action="hold">Vasthouden</button>` : '<span>leeg</span>'}</div>`;
    }).join('');
    const heldHtml = held ? `<div class="held-card"><span>In de hand</span><strong>${esc(held.label)}</strong><div><button data-item="${esc(held.id)}" data-inventory-action="bag">In rugzak</button><button data-item="${esc(held.id)}" data-inventory-action="place">Neerzetten</button></div></div>` : '<p class="small">Je hebt niets in je hand.</p>';
    this.interaction.innerHTML = `
      <header class="panel-header"><div><span class="eyebrow">8 vakken</span><h2>Rugzak <span class="capacity">${bag.length}/${capacity}</span></h2></div><button class="icon-button" data-close aria-label="Sluiten">×</button></header>
      ${heldHtml}<div class="inventory-grid">${slots}</div><p class="small">I of Esc sluit de rugzak.</p>`;
    this.interaction.querySelector('[data-close]')?.addEventListener('click', () => { this.closeInteraction(); this.onDialogueClosed?.(); });
    this.interaction.querySelectorAll<HTMLButtonElement>('[data-inventory-action]').forEach((button) => button.addEventListener('click', () => this.onInventoryAction?.(button.dataset.item!, button.dataset.inventoryAction as 'hold'|'bag'|'place')));
    this.interaction.classList.add('open');
  }

  closeInteraction(): void {
    this.interaction.classList.remove('open');
    this.currentDialogue = null;
    this.currentHint = null;
  }

  showDialogue(line: DialogueLine, hint: HintPresentation): void {
    this.closePhone();
    this.currentDialogue = line;
    this.currentHint = hint;
    this.renderDialogue();
    this.interaction.classList.add('open');
    if (this.preferences.ttsEnabled) this.speakDutch(line.textNL, this.preferences.ttsRate);
  }

  updateDialogueHint(hint: HintPresentation): void {
    if (!this.currentDialogue) return;
    this.currentHint = hint;
    this.renderDialogue();
  }

  showDialogueFeedback(message: string, matched: boolean): void {
    const feedback = this.interaction.querySelector<HTMLElement>('[data-dialogue-feedback]');
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = `dialogue-feedback ${matched ? 'matched' : 'retry'}`;
  }

  private renderDialogue(): void {
    const line = this.currentDialogue;
    const hint = this.currentHint;
    if (!line || !hint) return;
    const responses = line.responses?.map((response) => `<button data-response="${esc(response.intent)}">${esc(response.text)}</button>`).join('') ?? '';
    const hintHtml = hint.text ? `<div class="hint-card"><span>${esc(hint.label)}</span><p>${esc(hint.text)}</p></div>` : '<div class="hint-card quiet"><span>Alleen Nederlands</span></div>';
    const input = line.intents?.length ? `<form class="dialogue-form" data-dialogue-form><label for="dialogue-input">Typ je antwoord in het Nederlands</label><div><input id="dialogue-input" name="answer" lang="nl" autocomplete="off" placeholder="Bijv. Ja, graag."><button type="submit">Sturen</button></div></form>` : '';
    this.interaction.innerHTML = `
      <header class="panel-header"><div><span class="eyebrow">${esc(line.level)} · ${esc(line.scenarioId ?? 'thuis')}</span><h2>${esc(line.speaker)}</h2></div><button class="icon-button" data-close aria-label="Sluiten">×</button></header>
      <p class="dialogue-nl" lang="nl">${esc(line.textNL)}</p>
      <div class="dialogue-tools"><button data-speak>🔊 Luister</button><button data-slow>🐢 Langzaam</button><button data-hint>💡 Meer hulp</button></div>
      ${hintHtml}
      ${input}
      <div class="dialogue-feedback" data-dialogue-feedback aria-live="polite"></div>
      <div class="action-grid dialogue-responses">${responses || '<button data-close-dialogue>Verder</button>'}</div>`;
    this.interaction.querySelector('[data-close]')?.addEventListener('click', () => this.closeDialogue());
    this.interaction.querySelector('[data-close-dialogue]')?.addEventListener('click', () => this.closeDialogue());
    this.interaction.querySelector('[data-speak]')?.addEventListener('click', () => this.speakDutch(line.textNL, this.preferences.ttsRate));
    this.interaction.querySelector('[data-slow]')?.addEventListener('click', () => this.speakDutch(line.textNL, .72));
    this.interaction.querySelector('[data-hint]')?.addEventListener('click', () => {
      const next = this.onRequestHint?.(line.id);
      if (next) this.updateDialogueHint(next);
    });
    this.interaction.querySelectorAll<HTMLButtonElement>('[data-response]').forEach((button) => button.addEventListener('click', () => {
      this.onDialogueResponse?.(line.id, button.dataset.response!);
      this.closeDialogue();
    }));
    this.interaction.querySelector<HTMLFormElement>('[data-dialogue-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const inputElement = this.interaction.querySelector<HTMLInputElement>('#dialogue-input');
      const answer = inputElement?.value.trim() ?? '';
      if (!answer) return;
      const result = this.onDialogueText?.(line.id, answer) ?? { matched:false, message:'Probeer het nog eens.' };
      this.showDialogueFeedback(result.message, result.matched);
      if (result.matched) window.setTimeout(() => this.closeDialogue(), 650);
    });
  }

  private closeDialogue(): void {
    this.closeInteraction();
    this.onDialogueClosed?.();
  }

  openPhone(preferences: PlayerPreferences): void {
    this.preferences = { ...preferences };
    this.closeInteraction();
    this.phone.innerHTML = `
      <header class="panel-header"><div><span class="eyebrow">07:00 · thuis</span><h2>Telefoon</h2></div><button class="icon-button" data-phone-close aria-label="Sluiten">×</button></header>
      <div class="phone-apps">
        <button class="phone-app" data-app="messages"><span>💬</span>Berichten</button>
        <button class="phone-app" data-app="agenda"><span>🗓️</span>Agenda</button>
        <button class="phone-app" data-app="contacts"><span>👥</span>Contacten</button>
        <button class="phone-app" data-app="settings"><span>⚙️</span>Hulp</button>
      </div>
      <div id="phone-content"><p class="small">Kies een app.</p></div><p class="small">P of Esc sluit de telefoon.</p>`;
    this.phone.querySelector('[data-phone-close]')?.addEventListener('click', () => { this.closePhone(); this.onPhoneClosed?.(); });
    this.phone.querySelector('[data-app="messages"]')?.addEventListener('click', () => this.renderMessages());
    this.phone.querySelector('[data-app="agenda"]')?.addEventListener('click', () => this.renderAgenda());
    this.phone.querySelector('[data-app="contacts"]')?.addEventListener('click', () => this.renderContacts());
    this.phone.querySelector('[data-app="settings"]')?.addEventListener('click', () => this.renderSettings());
    this.phone.classList.add('open');
  }

  private renderMessages(): void {
    const target = this.phone.querySelector('#phone-content')!;
    target.innerHTML = `<div class="phone-list">${HOME_PHONE_MESSAGES.map((message) => `<button class="phone-list-item" data-message="${esc(message.id)}"><strong>${esc(message.from)}</strong><span>${esc(message.preview)}</span></button>`).join('')}</div>`;
    target.querySelectorAll<HTMLButtonElement>('[data-message]').forEach((button) => button.addEventListener('click', () => {
      const message = HOME_PHONE_MESSAGES.find((entry) => entry.id === button.dataset.message)!;
      this.onPhoneMessageRead?.(message.id);
      target.innerHTML = `<button class="text-button" data-back>← Berichten</button><p><strong>${esc(message.from)}</strong></p><p lang="nl">${esc(message.bodyNL)}</p>${message.dialogueId ? `<button data-reply>Antwoorden</button>` : ''}`;
      target.querySelector('[data-back]')?.addEventListener('click', () => this.renderMessages());
      target.querySelector('[data-reply]')?.addEventListener('click', () => this.onOpenDialogue?.(message.dialogueId!));
    }));
  }

  private renderAgenda(): void {
    this.phone.querySelector('#phone-content')!.innerHTML = `<h3>Vandaag</h3><div class="agenda-list">${HOME_PHONE_AGENDA.map((item) => `<div><time>${esc(item.time)}</time><p><strong>${esc(item.title)}</strong><br>${esc(item.detailNL)}</p></div>`).join('')}</div>`;
  }

  private renderContacts(): void {
    this.phone.querySelector('#phone-content')!.innerHTML = `<h3>Contacten</h3><div class="contact-list">${HOME_PHONE_CONTACTS.map((contact) => `<div><strong>${esc(contact.name)}</strong><span>${esc(contact.relationNL)}</span><p>${esc(contact.noteNL)}</p></div>`).join('')}</div>`;
  }

  private renderSettings(): void {
    const target = this.phone.querySelector('#phone-content')!;
    target.innerHTML = `<h3>Taalhulp</h3><p class="small">0 = alleen Nederlands · 4 = Portugese vertaling</p><div class="level-picker">${([0,1,2,3,4] as const).map((level) => `<button class="${level===this.preferences.hintLevel?'selected':''}" data-level="${level}">${level}</button>`).join('')}</div><label class="toggle-line"><input type="checkbox" data-tts ${this.preferences.ttsEnabled?'checked':''}> Nederlandse stem gebruiken</label>`;
    target.querySelectorAll<HTMLButtonElement>('[data-level]').forEach((button) => button.addEventListener('click', () => {
      const level = Number(button.dataset.level) as HintLevel;
      this.preferences.hintLevel = level;
      this.onHintLevelChange?.(level);
      this.renderSettings();
    }));
    target.querySelector<HTMLInputElement>('[data-tts]')?.addEventListener('change', (event) => {
      this.preferences.ttsEnabled=(event.currentTarget as HTMLInputElement).checked;
      this.onTtsEnabledChange?.(this.preferences.ttsEnabled);
    });
  }

  resetHandlers(): void {
    this.onAction = null;
    this.onPhoneMessageRead = null;
    this.onOpenDialogue = null;
    this.onDialogueResponse = null;
    this.onDialogueText = null;
    this.onDialogueClosed = null;
    this.onRequestHint = null;
    this.onHintLevelChange = null;
    this.onTtsEnabledChange = null;
    this.onPhoneClosed = null;
    this.onInventoryAction = null;
    this.currentDialogue = null;
    this.currentHint = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  closePhone(): void { this.phone.classList.remove('open'); }
  isPhoneOpen(): boolean { return this.phone.classList.contains('open'); }
  isInteractionOpen(): boolean { return this.interaction.classList.contains('open'); }
  isAnyPanelOpen(): boolean { return this.isPhoneOpen() || this.isInteractionOpen(); }

  speakDutch(text: string, rate = 1): void {
    if (!this.preferences.ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'nl-NL';
    utterance.rate = rate;
    const voice = window.speechSynthesis.getVoices().find((candidate) => candidate.lang.toLowerCase().startsWith('nl'));
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  }
}
