import { describe, expect, it } from 'vitest';
import { HOME_DIALOGUES } from '../../src/data/dialogues/homeContent';
import { HintSystem } from '../../src/game/language/HintSystem';

const line = HOME_DIALOGUES.find((entry) => entry.id === 'alarm_start')!;

describe('Progressive hint system', () => {
  it('presents the five help levels in increasing explicitness', () => {
    const system = new HintSystem(0);
    expect(system.present(line)).toMatchObject({ level: 0, text: '' });
    system.escalate();
    expect(system.present(line).label).toBe('Herhalen');
    system.escalate();
    expect(system.present(line).text).toBe(line.keywordNL);
    system.escalate();
    expect(system.present(line).text).toBe(line.starterNL);
    system.escalate();
    expect(system.present(line).text).toBe(line.hintPT);
  });

  it('clamps both explicit and incremental levels', () => {
    const system = new HintSystem(4);
    expect(system.escalate()).toBe(4);
    expect(system.set(-4 as never)).toBe(0);
    expect(system.reduce()).toBe(0);
  });
});
