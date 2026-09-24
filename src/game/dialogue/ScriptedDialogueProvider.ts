import type { DialogueLine, DialogueProvider } from './types';
import { HOME_DIALOGUES } from '../../data/dialogues/homeContent';

export class ScriptedDialogueProvider implements DialogueProvider {
  private readonly byId = new Map(HOME_DIALOGUES.map((dialogue) => [dialogue.id, dialogue]));
  get(id: string): DialogueLine | undefined { return this.byId.get(id); }
  all(): readonly DialogueLine[] { return HOME_DIALOGUES; }
}
