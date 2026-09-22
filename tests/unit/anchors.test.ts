import { describe, expect, it } from 'vitest';
import { NavigationManager } from '../../src/game/navigation/NavigationManager';
import { CAFE_NAV, HOME_NAV, REQUIRED_ANCHORS, STREET_NAV } from '../../src/game/scenes/data/SceneNavigationData';

const scenes = { HomeScene: HOME_NAV, StreetScene: STREET_NAV, CafeScene: CAFE_NAV };

describe('required interaction anchors', () => {
  for (const [sceneName, required] of Object.entries(REQUIRED_ANCHORS)) {
    it(`${sceneName} anchors are walkable`, () => {
      const data = scenes[sceneName as keyof typeof scenes];
      const nav = new NavigationManager(data.width,data.height,data.obstacles,32,18);
      for (const id of required) expect(data.anchors[id], `${sceneName}:${id} missing`).toBeTruthy();
      for (const [id,anchor] of Object.entries(data.anchors)) {
        expect(nav.isWalkable(anchor), `${sceneName}:${id} at ${anchor.x},${anchor.y}`).toBe(true);
        const path=nav.findPath(data.spawn,anchor);
        expect(path.length, `${sceneName}:${id} has no route from spawn`).toBeGreaterThan(0);
        for(const waypoint of path) expect(nav.isWalkable(waypoint), `${sceneName}:${id} route waypoint blocked`).toBe(true);
      }
    });
  }

  it('routes from below to behind the street bench without crossing its collider', () => {
    const nav = new NavigationManager(STREET_NAV.width,STREET_NAV.height,STREET_NAV.obstacles,32,18);
    const path=nav.findPath({x:1160,y:430},{x:1160,y:270});
    expect(path.length).toBeGreaterThan(1);
    for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i];
      const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/5));
      for(let s=0;s<=steps;s++){
        const t=s/steps;
        expect(nav.isWalkable({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})).toBe(true);
      }
    }
  });
});
