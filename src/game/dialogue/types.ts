export interface DialogueLine {
  id: string;
  speaker: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  textNL: string;
  hintPT?: string;
  intents?: string[];
  responses?: Array<{ text: string; intent: string }>;
}
export interface DialogueProvider { get(id: string): DialogueLine | undefined; }
