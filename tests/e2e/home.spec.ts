import { test, expect, type Locator, type Page } from '@playwright/test';

const GAME_WIDTH = 960;
const GAME_HEIGHT = 720;

async function clickWorld(canvas: Locator, x: number, y: number): Promise<void> {
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas has no bounding box');
  await canvas.click({
    position: {
      x: x / GAME_WIDTH * box.width,
      y: y / GAME_HEIGHT * box.height
    }
  });
}

async function openObject(page: Page, canvas: Locator, x: number, y: number, name: string): Promise<void> {
  await clickWorld(canvas, x, y);
  await expect(page.locator('#interaction-panel')).toHaveClass(/open/, { timeout: 8_000 });
  await expect(page.locator('#interaction-panel h2')).toHaveText(name);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test('Casa boots and phone dialogue works', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('#clock')).toContainText('Dag');
  await page.screenshot({ path: 'screenshots/home_bedroom.png', fullPage: true });

  await page.keyboard.press('p');
  await expect(page.locator('#phone-panel')).toHaveClass(/open/);
  await page.getByText('Berichten').click();
  await expect(page.getByText('Goedemorgen! Heb je straks tijd voor koffie?')).toBeVisible();
  await page.getByRole('button', { name: 'Antwoorden' }).click();
  await expect(page.locator('#interaction-panel')).toHaveClass(/open/);
  await page.getByRole('button', { name: 'Ja, graag.' }).click();
  await expect(page.locator('#interaction-panel')).not.toHaveClass(/open/);
});

test('complete morning flow reaches the unlocked front door', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  // Shower.
  await openObject(page, canvas, 520, 142, 'Douche');
  await page.screenshot({ path: 'screenshots/home_bathroom.png', fullPage: true });
  await page.getByRole('button', { name: 'Douchen' }).click();
  await page.waitForTimeout(120);
  await page.screenshot({ path: 'screenshots/home_shower.png', fullPage: true });
  await expect(page.locator('#prompt')).toContainText('Fris en klaar voor de dag.', { timeout: 5_000 });

  // Get dressed.
  await openObject(page, canvas, 288, 134, 'Kledingkast');
  await page.getByRole('button', { name: 'Openen / sluiten' }).click();
  await openObject(page, canvas, 288, 134, 'Kledingkast');
  await page.getByRole('button', { name: 'Kleding kiezen' }).click();

  // Bread from fridge.
  await openObject(page, canvas, 870, 132, 'Koelkast');
  await page.screenshot({ path: 'screenshots/home_kitchen.png', fullPage: true });
  await page.getByRole('button', { name: 'Openen / sluiten' }).click();
  await openObject(page, canvas, 870, 132, 'Koelkast');
  await page.getByRole('button', { name: 'Brood pakken' }).click();

  // Toast.
  await openObject(page, canvas, 684, 148, 'Broodrooster');
  await page.getByRole('button', { name: 'Brood roosteren' }).click();
  await expect(page.locator('#prompt')).toContainText('De toast is klaar.', { timeout: 5_000 });

  // Coffee.
  await openObject(page, canvas, 734, 148, 'Koffiezetapparaat');
  await page.getByRole('button', { name: 'Koffie zetten' }).click();
  await expect(page.locator('#prompt')).toContainText('De koffie is klaar.', { timeout: 5_000 });
  await openObject(page, canvas, 734, 148, 'Koffiezetapparaat');
  await page.getByRole('button', { name: 'Kopje pakken' }).click();

  // Put breakfast on the table, sit, eat, close the non-choice dialogue, stand.
  await openObject(page, canvas, 812, 250, 'Eettafel');
  await page.getByRole('button', { name: 'Ontbijt neerzetten' }).click();
  await page.screenshot({ path: 'screenshots/home_breakfast.png', fullPage: true });
  await openObject(page, canvas, 812, 250, 'Eettafel');
  await page.getByRole('button', { name: 'Gaan zitten' }).click();
  await page.keyboard.press('e');
  await expect(page.locator('#interaction-panel h2')).toHaveText('Eettafel');
  await page.getByRole('button', { name: 'Ontbijten' }).click();
  await expect(page.getByText('Koffie en ontbijt zijn klaar.')).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: 'Verder' }).click();
  await page.keyboard.press('e');
  await page.getByRole('button', { name: 'Opstaan' }).click();

  // Touch the living room so its real rendered state is captured too.
  await openObject(page, canvas, 160, 420, 'Bank');
  await page.screenshot({ path: 'screenshots/home_livingroom.png', fullPage: true });
  await page.keyboard.press('Escape');

  // Keys and front door.
  await openObject(page, canvas, 550, 574, 'Sleutels');
  await page.getByRole('button', { name: 'Pakken' }).click();
  await openObject(page, canvas, 610, 604, 'Voordeur');
  await page.getByRole('button', { name: 'Ontgrendelen' }).click();
  await openObject(page, canvas, 610, 604, 'Voordeur');
  await page.getByRole('button', { name: 'Naar buiten' }).click();
  await expect(page.locator('#prompt')).toContainText('StreetScene blijft vergrendeld');

  await page.screenshot({ path: 'screenshots/home_entry.png', fullPage: true });
});

test('bed supports lying down and sleeping', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await openObject(page, canvas, 138, 128, 'Bed');
  await page.getByRole('button', { name: 'Gaan liggen' }).click();
  await page.keyboard.press('e');
  await page.getByRole('button', { name: 'Slapen' }).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: 'screenshots/home_sleep.png', fullPage: true });
  await expect(page.locator('#clock')).toContainText('Dag 1', { timeout: 3_000 });
});
