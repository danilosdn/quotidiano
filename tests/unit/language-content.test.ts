import { describe, expect, it } from 'vitest';
import { HOME_DIALOGUES } from '../../src/data/dialogues/homeContent';
import { HOME_INTENTS, HOME_INTENT_VARIANTS } from '../../src/data/language/homeIntents';
import { HOME_SCENARIOS } from '../../src/data/scenarios/homeScenarios';
import { IntentMatcher } from '../../src/game/dialogue/IntentMatcher';

describe('House language content', () => {
  it('meets the documented content floor and has unique ids', () => {
    expect(HOME_SCENARIOS.length).toBeGreaterThanOrEqual(12);
    expect(HOME_INTENTS.length).toBeGreaterThanOrEqual(30);
    expect(HOME_DIALOGUES.length).toBeGreaterThanOrEqual(60);
    expect(new Set(HOME_SCENARIOS.map((entry) => entry.id)).size).toBe(HOME_SCENARIOS.length);
    expect(new Set(HOME_INTENTS.map((entry) => entry.id)).size).toBe(HOME_INTENTS.length);
    expect(new Set(HOME_DIALOGUES.map((entry) => entry.id)).size).toBe(HOME_DIALOGUES.length);
  });

  it('resolves every scenario dialogue and intent reference', () => {
    const dialogueIds = new Set(HOME_DIALOGUES.map((entry) => entry.id));
    const intentIds = new Set(HOME_INTENTS.map((entry) => entry.id));
    for (const scenario of HOME_SCENARIOS) {
      for (const id of scenario.dialogueIds) expect(dialogueIds.has(id), `${scenario.id}:${id}`).toBe(true);
      for (const id of scenario.intentIds) expect(intentIds.has(id), `${scenario.id}:${id}`).toBe(true);
    }
  });

  it('recognizes punctuation, accents and a small typo without accepting unrelated text', () => {
    const matcher = new IntentMatcher();
    expect(matcher.matchAllowed('Ja, graag!', ['ACCEPT_COFFEE'], HOME_INTENT_VARIANTS)).toBe('ACCEPT_COFFEE');
    expect(matcher.matchAllowed('ik zet koffi', ['MAKE_COFFEE'], HOME_INTENT_VARIANTS)).toBe('MAKE_COFFEE');
    expect(matcher.matchAllowed('de maan is paars', ['MAKE_COFFEE'], HOME_INTENT_VARIANTS)).toBeNull();
  });
});
