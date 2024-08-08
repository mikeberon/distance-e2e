// utils.ts
import { Page } from '@playwright/test';

export async function maximizeWindow(page: Page) {
  const width = await page.evaluate(() => window.screen.width);
  const height = await page.evaluate(() => window.screen.height);
  await page.setViewportSize({ width, height });
}
