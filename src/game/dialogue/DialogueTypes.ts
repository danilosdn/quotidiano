export interface DialogueChoice { text: string; next: string; intent?: string; effects?: string[] }
export interface DialogueNode {
  id: string;
  speaker: string;
  dutchText: string;
  portugueseHint?: string;
  keyword?: string;
  starter?: string;
  choices?: DialogueChoice[];
  effects?: string[];
  end?: boolean;
}
export interface DialogueScript { id: string; start: string; nodes: DialogueNode[] }
