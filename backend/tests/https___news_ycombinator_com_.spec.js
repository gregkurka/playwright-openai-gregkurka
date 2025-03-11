const { test, expect } = require('@playwright/test');

test.describe('Hacker News Critical User Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://news.ycombinator.com');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Login link should be present and navigable', async ({ page }) => {
    const loginLink = page.locator('a:has-text("login")');
    await expect(loginLink).toBeVisible();

    // Navigate to login page
    await loginLink.click();
    await page.waitForLoadState('domcontentloaded');

    // Validate we are on the login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('Upvote a news item', async ({ page }) => {
    const upvoteArrow = page.locator('a[id^="up_"]:first-of-type .votearrow');

    // Ensure upvote arrow is visible
    await expect(upvoteArrow).toBeVisible();

    // Click the upvote arrow
    await upvoteArrow.click();
    
    // Optionally, further checks can be added here, such as confirming the score increased.
  });

  test('Navigate to a post and back', async ({ page }) => {
    const firstPostLink = page.locator('.athing .titleline a').first();

    // Ensure first post link is visible
    await expect(firstPostLink).toBeVisible();

    // Click on the first post link
    await firstPostLink.click();
    await page.waitForLoadState('domcontentloaded');

    // Validate navigation by asserting a change in URL
    await expect(page).not.toHaveURL('https://news.ycombinator.com');

    // Navigate back
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');

    // Ensure we are back on the home page by checking the presence of the login link
    await expect(page.locator('a:has-text("login")')).toBeVisible();
  });

  test('Submit link is visible and navigable', async ({ page }) => {
    const submitLink = page.locator('a:has-text("submit")');
    await expect(submitLink).toBeVisible();

    // Navigate to the submit page
    await submitLink.click();
    await page.waitForLoadState('domcontentloaded');

    // Validate navigation by asserting presence of submit form
    await expect(page).toHaveURL(/.*submit/);
  });
});