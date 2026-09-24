import { describe, expect, it } from 'vitest';
import { IntentMatcher } from '../../src/game/dialogue/IntentMatcher';

describe('IntentMatcher', () => {
  it('maps natural variants to the same intent', () => {
    const matcher = new IntentMatcher();
    const candidates = { ACCEPT_COFFEE: ['Ja.', 'Graag.', 'Ja, graag.', 'Dat is goed.', 'Een koffie graag.'] };
    expect(matcher.match('ja graag', candidates)).toBe('ACCEPT_COFFEE');
    expect(matcher.match('Graag!', candidates)).toBe('ACCEPT_COFFEE');
  });
  it('returns null for an unknown response', () => {
    expect(new IntentMatcher().match('misschien later', { YES: ['ja'] })).toBeNull();
  });
});
