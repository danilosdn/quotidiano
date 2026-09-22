import { describe, expect, it } from 'vitest';
import { matchIntent, normalizeText } from '../src/game/dialogue/IntentMatcher';

describe('Dutch intent matching',()=>{
  it('accepts natural coffee variants',()=>{
    expect(matchIntent('Een koffie graag')).toBe('ORDER_COFFEE');
    expect(matchIntent('Ik wil koffie, alsjeblieft.')).toBe('ORDER_COFFEE');
  });
  it('normalizes punctuation and whitespace',()=>expect(normalizeText('  Koffie,   graag! ')).toBe('koffie graag'));
});
