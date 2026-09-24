import { test, expect, type Locator, type Page } from '@playwright/test';
import type {} from '../../src/game/debug/QuotidianoDebugBridge';

const GAME_WIDTH = 960;
const GAME_HEIGHT = 720;

type DebugState = {
  world: Record<string, unknown> & { day:number; minutes:number; currentObjective:string };
  inventory: Array<{id:string;location:string;surfaceId?:string}>;
  player: {x:number;y:number;facing:string;mode:string};
  session: {seatedAt:string|null;lyingOnBed:boolean;busy:boolean};
  dialogue: string|null;
};

async function waitForGame(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.waitForFunction(() => Boolean(globalThis.QUOTIDIANO_DEBUG));
  await page.waitForTimeout(520);
  if (await page.locator('#interaction-panel').evaluate((element) => element.classList.contains('open'))) {
    await page.keyboard.press('Escape');
  }
}

async function state(page: Page): Promise<DebugState> {
  return page.evaluate(() => globalThis.QUOTIDIANO_DEBUG!.getState() as DebugState);
}

async function perform(page: Page, objectId: string, actionId: string): Promise<void> {
  const handled = await page.evaluate(async ({ objectId, actionId }) => globalThis.QUOTIDIANO_DEBUG!.perform(objectId, actionId), { objectId, actionId });
  expect(handled, `${objectId}:${actionId}`).toBe(true);
}

async function openObject(page: Page, objectId: string, label: string): Promise<void> {
  const opened = await page.evaluate((id) => globalThis.QUOTIDIANO_DEBUG!.openObject(id), objectId);
  expect(opened).toBe(true);
  await expect(page.locator('#interaction-panel')).toHaveClass(/open/);
  await expect(page.locator('#interaction-panel h2')).toHaveText(label);
}

async function clickWorld(canvas: Locator, x: number, y: number): Promise<void> {
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no bounding box');
  await canvas.click({ position: { x: x / GAME_WIDTH * box.width, y: y / GAME_HEIGHT * box.height } });
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await waitForGame(page);
});

test('boots the coherent House V3 and exposes a valid topology', async ({ page }) => {
  await expect(page.locator('#clock')).toContainText('Dag 1');
  await expect(page.locator('#location')).not.toHaveText('');
  const report = await page.evaluate(() => globalThis.QUOTIDIANO_DEBUG!.validate());
  expect(report.valid).toBe(true);
  expect(report.reachableInteractions).toBe(report.interactionCount);
  expect(report.interactionCount).toBeGreaterThanOrEqual(40);
  await page.screenshot({ path: 'screenshots/after/home_full_house.png', fullPage: true });
});

test('manual input and click-to-move change position without teleporting through blockers', async ({ page }) => {
  const canvas = page.locator('canvas');
  const start = (await state(page)).player;
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(260);
  await page.keyboard.up('ArrowRight');
  const afterRight = (await state(page)).player;
  expect(afterRight.x).toBeGreaterThan(start.x + 4);
  expect(afterRight.facing).toBe('right');

  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(180);
  await page.keyboard.up('ArrowLeft');
  const afterLeft = (await state(page)).player;
  expect(afterLeft.x).toBeLessThan(afterRight.x);
  expect(afterLeft.facing).toBe('left');

  await clickWorld(canvas, 320, 360);
  await expect.poll(async () => (await state(page)).player.y).toBeGreaterThan(300);
  const arrived = (await state(page)).player;
  expect(Math.hypot(arrived.x - 320, arrived.y - 360)).toBeLessThan(28);
});

test('phone dialogue, typed intent, progressive hint and close button restore control', async ({ page }) => {
  await page.keyboard.press('p');
  await expect(page.locator('#phone-panel')).toHaveClass(/open/);
  await page.getByRole('button', { name: /Berichten/ }).click();
  await page.getByRole('button', { name: /Lotte/ }).click();
  await page.getByRole('button', { name: 'Antwoorden' }).click();
  await expect(page.locator('#interaction-panel')).toHaveClass(/open/);
  await page.getByRole('button', { name: /Meer hulp/ }).click();
  await expect(page.locator('.hint-card')).toBeVisible();
  await page.locator('#dialogue-input').fill('Ja graag');
  await page.locator('[data-dialogue-form]').getByRole('button', { name: 'Sturen' }).click();
  await expect(page.locator('.dialogue-feedback')).toHaveClass(/matched/);
  await expect(page.locator('#interaction-panel')).not.toHaveClass(/open/);
  expect((await state(page)).world.hasReadMorningMessage).toBe(true);

  await page.keyboard.press('p');
  await page.locator('[data-phone-close]').click();
  await expect(page.locator('#phone-panel')).not.toHaveClass(/open/);
  expect((await state(page)).player.mode).toBe('FREE');
});

test('complete morning flow produces breakfast, unlocks the door and keeps StreetScene gated', async ({ page }) => {
  await perform(page, 'alarm-clock', 'stop');
  if (await page.locator('#interaction-panel').evaluate((element) => element.classList.contains('open'))) await page.keyboard.press('Escape');

  await page.evaluate(() => globalThis.QUOTIDIANO_DEBUG!.teleportTo('shower'));
  await page.screenshot({ path: 'screenshots/after/home_bathroom.png', fullPage: true });
  await perform(page, 'shower', 'shower');
  await page.screenshot({ path: 'screenshots/flows/home_shower.png', fullPage: true });
  await perform(page, 'toothbrush', 'brush');
  if (await page.locator('#interaction-panel').evaluate((element) => element.classList.contains('open'))) await page.keyboard.press('Escape');

  await perform(page, 'wardrobe', 'toggle');
  await perform(page, 'wardrobe', 'dress');
  if (await page.locator('#interaction-panel').evaluate((element) => element.classList.contains('open'))) await page.keyboard.press('Escape');

  await page.evaluate(() => globalThis.QUOTIDIANO_DEBUG!.teleportTo('fridge'));
  await page.screenshot({ path: 'screenshots/after/home_kitchen.png', fullPage: true });
  await perform(page, 'fridge', 'toggle');
  await perform(page, 'fridge', 'take-breakfast');
  await perform(page, 'toaster', 'toast');
  await perform(page, 'coffee', 'brew');
  await perform(page, 'coffee', 'take');
  await perform(page, 'dining-table', 'place-breakfast');
  await page.screenshot({ path: 'screenshots/flows/home_breakfast.png', fullPage: true });
  await perform(page, 'dining-table', 'sit');
  await perform(page, 'dining-table', 'eat');
  await perform(page, 'dining-table', 'drink');
  if (await page.locator('#interaction-panel').evaluate((element) => element.classList.contains('open'))) await page.keyboard.press('Escape');
  await perform(page, 'dining-table', 'stand');

  await page.evaluate(() => globalThis.QUOTIDIANO_DEBUG!.teleportTo('sofa'));
  await page.screenshot({ path: 'screenshots/after/home_livingroom.png', fullPage: true });
  await perform(page, 'keys', 'take');
  await perform(page, 'front-door', 'unlock');
  await perform(page, 'front-door', 'open');
  await perform(page, 'front-door', 'leave-house');
  await expect(page.locator('#prompt')).toContainText('StreetScene blijft');
  await page.screenshot({ path: 'screenshots/after/home_entry.png', fullPage: true });

  const final = await state(page);
  expect(final.world.showeredToday).toBe(true);
  expect(final.world.teethBrushed).toBe(true);
  expect(final.world.outfit).toBe('day');
  expect(final.world.breakfastEaten).toBe(true);
  expect(final.world.doorLocked).toBe(false);
});

test('bed sleep advances exactly one day and resumes safely in dialogue', async ({ page }) => {
  await perform(page, 'bed', 'lie');
  const before = await state(page);
  expect(before.player.mode).toBe('LYING');
  await perform(page, 'bed', 'sleep');
  const after = await state(page);
  expect(after.world.day).toBe(before.world.day + 1);
  expect(after.world.minutes).toBe(7 * 60);
  expect(after.dialogue).toBe('alarm_start');
  await page.screenshot({ path: 'screenshots/flows/home_sleep.png', fullPage: true });
});

test('important object state and preferences survive reload', async ({ page }) => {
  await perform(page, 'wardrobe', 'toggle');
  await perform(page, 'living-lamp', 'toggle');
  await perform(page, 'keys', 'take');
  await page.keyboard.press('p');
  await page.getByRole('button', { name: /Hulp/ }).click();
  await page.locator('[data-level="3"]').click();
  await page.locator('[data-tts]').uncheck();
  await page.locator('[data-phone-close]').click();

  await page.reload();
  await page.waitForFunction(() => Boolean(globalThis.QUOTIDIANO_DEBUG));
  await page.waitForTimeout(520);
  if (await page.locator('#interaction-panel').evaluate((element) => element.classList.contains('open'))) {
    await page.keyboard.press('Escape');
  }
  const restored = await state(page);
  expect(restored.world.wardrobeOpen).toBe(true);
  expect((restored.world.roomLights as Record<string, boolean>).living).toBe(false);
  expect(restored.inventory.find((item) => item.id === 'keys')?.location).not.toBe('ON_SURFACE');
  await page.keyboard.press('p');
  await page.getByRole('button', { name: /Hulp/ }).click();
  await expect(page.locator('[data-level="3"]')).toHaveClass(/selected/);
  await expect(page.locator('[data-tts]')).not.toBeChecked();
});

test('inventory supports held, bag and room surface states', async ({ page }) => {
  await perform(page, 'keys', 'take');
  await page.keyboard.press('i');
  await expect(page.locator('#interaction-panel')).toHaveClass(/open/);
  await page.locator('.held-card').getByRole('button', { name: 'In rugzak' }).click();
  expect((await state(page)).inventory.find((item) => item.id === 'keys')?.location).toBe('IN_BAG');
  const keySlot = page.locator('.slot', { hasText: 'Sleutels' });
  await keySlot.getByRole('button', { name: 'Vasthouden' }).click();
  await page.locator('.held-card').getByRole('button', { name: 'Neerzetten' }).click();
  const keys = (await state(page)).inventory.find((item) => item.id === 'keys');
  expect(keys?.location).toBe('ON_SURFACE');
  expect(keys?.surfaceId).toBeTruthy();
});
