import type { DialogueLine, DialogueProvider } from './types';
import dialogues from '../../data/dialogues/home.json';

export class ScriptedDialogueProvider implements DialogueProvider {
  private readonly byId = new Map((dialogues as DialogueLine[]).map((d) => [d.id, d]));
  get(id: string): DialogueLine | undefined { return this.byId.get(id); }
}
