import { describe, expect, it } from 'vitest';
import { HOME_INTERACTIONS } from '../../src/data/interactions/homeInteractions';
import { createHousePathFinder } from '../../src/game/navigation/houseNavigation';
import { HOUSE_LAYOUT } from '../../src/game/house/HouseLayout';
import { createInitialWorldState } from '../../src/game/state/WorldState';

describe('Home interaction data', () => {
  it('keeps every approach point walkable and reachable from the spawn', () => {
    const pathFinder = createHousePathFinder();
    for (const interaction of HOME_INTERACTIONS) {
      expect(pathFinder.isWalkable(interaction.approachPoint), interaction.id).toBe(true);
      expect(pathFinder.findPath(HOUSE_LAYOUT.spawn, interaction.approachPoint)?.length, interaction.id).toBeTruthy();
    }
  });

  it('uses unique actions and valid persistent world-state keys', () => {
    const world = createInitialWorldState();
    for (const interaction of HOME_INTERACTIONS) {
      expect(new Set(interaction.actions.map((action) => action.id)).size, interaction.id).toBe(interaction.actions.length);
      if (interaction.persistentState) expect(interaction.persistentState in world, interaction.id).toBe(true);
    }
  });
});
