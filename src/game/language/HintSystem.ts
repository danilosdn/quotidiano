import type { DialogueLine } from '../dialogue/types';
import type { HintLevel } from '../state/types';

export interface HintPresentation {
  level: HintLevel;
  label: string;
  text: string;
}

export class HintSystem {
  constructor(private level: HintLevel = 1) {}
  get current(): HintLevel { return this.level; }
  set(level: HintLevel): HintLevel { this.level = Math.max(0, Math.min(4, level)) as HintLevel; return this.level; }
  escalate(): HintLevel { return this.set((this.level + 1) as HintLevel); }
  reduce(): HintLevel { return this.set((this.level - 1) as HintLevel); }
  reset(): void { this.level = 0; }

  present(line: DialogueLine, overrideLevel = this.level): HintPresentation {
    const level = Math.max(0, Math.min(4, overrideLevel)) as HintLevel;
    if (level === 0) return { level, label: 'Alleen Nederlands', text: '' };
    if (level === 1) return { level, label: 'Herhalen', text: 'Luister of lees de zin nog een keer.' };
    if (level === 2) return { level, label: 'Kernwoord', text: line.keywordNL ?? line.textNL.split(/\s+/).slice(0, 2).join(' ') };
    if (level === 3) return { level, label: 'Zinsbegin', text: line.starterNL ?? line.textNL.split(/\s+/).slice(0, 3).join(' ') };
    return { level, label: 'Português', text: line.hintPT ?? '' };
  }
}
