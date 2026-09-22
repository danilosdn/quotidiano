import { describe, expect, it } from 'vitest';
import { NavigationManager } from '../../src/game/navigation/NavigationManager';

describe('NavigationManager',()=>{
  it('finds a route around a wall and does not cut corners',()=>{
    const nav=new NavigationManager(500,400,[{x:200,y:0,width:50,height:280}],32,16);
    const path=nav.findPath({x:80,y:80},{x:420,y:80});
    expect(path.length).toBeGreaterThan(1);
    expect(path.some(p=>p.y>280)).toBe(true);
    expect(path.every(p=>nav.isWalkable(p))).toBe(true);
  });
  it('rejects points inside expanded blockers',()=>{
    const nav=new NavigationManager(300,300,[{x:100,y:100,width:50,height:50}],32,18);
    expect(nav.isWalkable({x:120,y:120})).toBe(false);
    expect(nav.isWalkable({x:40,y:40})).toBe(true);
  });
});
