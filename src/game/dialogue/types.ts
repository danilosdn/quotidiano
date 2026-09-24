export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface DialogueResponse {
  text: string;
  intent: string;
}

export interface DialogueLine {
  id: string;
  scenarioId?: string;
  speaker: string;
  level: LanguageLevel;
  textNL: string;
  hintPT?: string;
  keywordNL?: string;
  starterNL?: string;
  intents?: string[];
  responses?: DialogueResponse[];
  nextId?: string;
}

export interface DialogueProvider {
  get(id: string): DialogueLine | undefined;
  all(): readonly DialogueLine[];
}

export interface IntentDefinition {
  id: string;
  variants: readonly string[];
  confirmationNL: string;
  correctionNL?: string;
}

export interface HomeScenarioDefinition {
  id: string;
  category: 'MORNING' | 'EVENING' | 'FOOD' | 'HYGIENE' | 'CLOTHING' | 'PHONE' | 'MAIL' | 'VISITOR' | 'CHORES' | 'PROBLEM';
  trigger: string;
  prerequisite: string;
  objectivePT: string;
  vocabularyNL: readonly string[];
  dialogueIds: readonly string[];
  intentIds: readonly string[];
  alternativesPT: readonly string[];
  consequence: string;
  completionFlag: string;
}
