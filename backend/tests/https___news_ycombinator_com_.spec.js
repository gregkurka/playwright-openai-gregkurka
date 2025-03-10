const { test, expect } = require('@playwright/test');

test.describe('Hacker News Page Tests', () => {
  
  test('should load page successfully', async ({ page }) => {
    await page.goto('http://localhost:3000'); // Replace with actual URL
    await expect(page).toHaveTitle(/Hacker News/);
  });

  test('should display valid links', async ({ page }) => {
    await page.goto('http://localhost:3000'); // Replace with actual URL
    const links = page.locator('a');
    const count = await links.count();
    for (let i = 0; i < count; ++i) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('#')) {
        const response = await page.goto(href);
        expect(response.ok()).toBeTruthy();
      }
    }
  });

  test('should test form functionality', async ({ page }) => {
    await page.goto('http://localhost:3000'); // Replace with actual URL
    const searchBox = page.locator('input[name="q"]');
    await searchBox.fill('Playwright');
    await searchBox.press('Enter');
    await expect(page).toHaveURL(/search/);
  });

  test('should handle button clicks', async ({ page }) => {
    await page.goto('http://localhost:3000'); // Replace with actual URL
    const loginButton = page.locator('a[href="login?goto=news"]');
    await loginButton.click();
    await expect(page).toHaveURL(/login/);
  });

  test('should verify text content', async ({ page }) => {
    await page.goto('http://localhost:3000'); // Replace with actual URL
    const header = page.locator('b.hnname');
    await expect(header).toHaveText('Hacker News');
  });
});