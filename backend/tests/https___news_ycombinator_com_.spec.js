import { test, expect } from '@playwright/test';

      test.describe('Basic checks for https://news.ycombinator.com/', () => {
        test('should load the page', async ({ page }) => {
          await page.goto('https://news.ycombinator.com/');
          await expect(page).toHaveTitle(/.+/); // checks that the title is non-empty
        });

        test('should have a visible main heading or h1', async ({ page }) => {
          await page.goto('https://news.ycombinator.com/');
          const h1 = page.locator('h1');
          await expect(h1.first()).toBeVisible({ timeout: 5000 });
        });

        test('should find some clickable link or button', async ({ page }) => {
          await page.goto('https://news.ycombinator.com/');
          // Attempt to find any link or button
          const linkOrButton = page.locator('a, button');
          await expect(linkOrButton.first()).toBeVisible();
        });
      });