import { describe, expect, it } from 'vitest';
import { InteractionManager } from '../src/game/interaction/InteractionManager';

const noop = async () => {};

describe('InteractionManager priority', () => {
  it('prefers a high-priority NPC over a closer secondary prop', () => {
    const manager = new InteractionManager();
    manager.register({id:'bench',label:()=> 'Sentar',hotspot:{x:0,y:0,radius:100},priority:20,trigger:noop});
    manager.register({id:'lotte',label:()=> 'Conversar',hotspot:{x:42,y:0,radius:100},priority:100,trigger:noop});
    expect(manager.nearest(5,0)?.id).toBe('lotte');
  });

  it('uses distance when priorities are equal', () => {
    const manager = new InteractionManager();
    manager.register({id:'a',label:()=> 'A',hotspot:{x:0,y:0,radius:100},priority:50,trigger:noop});
    manager.register({id:'b',label:()=> 'B',hotspot:{x:70,y:0,radius:100},priority:50,trigger:noop});
    expect(manager.nearest(12,0)?.id).toBe('a');
  });
});
