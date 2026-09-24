import { describe, expect, it } from 'vitest';
import { InteractionRegistry } from '../../src/game/interactions/InteractionRegistry';

describe('InteractionRegistry', () => {
  it('uses priority as a tie breaker', () => {
    const r = new InteractionRegistry();
    r.register({id:'low',objectId:'x',room:'r',type:'observation',actions:[],approachPoint:{x:0,y:0},actionPoint:{x:10,y:10},facing:'down',radius:80,priority:20});
    r.register({id:'high',objectId:'y',room:'r',type:'critical',actions:[],approachPoint:{x:0,y:0},actionPoint:{x:10,y:10},facing:'down',radius:80,priority:100});
    expect(r.nearest(10,10)?.id).toBe('high');
  });
});
