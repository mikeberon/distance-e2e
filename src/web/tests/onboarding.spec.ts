import { test, expect } from '@playwright/test';
import { signUp } from '../pages/onboarding';
import { login } from '../pages/common';


test.describe('Onboarding Tests', () => {

  // Before each test, navigate to the contacts page
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(`${baseURL}`);

  });

  test('should onboard successfully', async ({ page }) => {
    await signUp(page);

  });
});
