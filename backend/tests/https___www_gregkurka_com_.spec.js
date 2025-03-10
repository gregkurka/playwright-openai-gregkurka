const { test, expect } = require('@playwright/test');

test('Page should load successfully', async ({ page }) => {
  await page.goto('http://localhost'); // Change to the appropriate URL
  await expect(page).toHaveTitle('Greg Kurka');
});

test('Check if all links are valid', async ({ page }) => {
  await page.goto('http://localhost'); // Change to the appropriate URL
  const links = await page.$$eval('a', anchors => anchors.map(anchor => anchor.href));
  for (const link of links) {
    const response = await page.goto(link);
    expect(response.status()).toBe(200);
    await page.goBack();
  }
});

test('Verify text content', async ({ page }) => {
  await page.goto('http://localhost'); // Change to the appropriate URL
  await expect(page.locator('header > h1')).toHaveText('Greg Kurka');
  await expect(page.locator('header > h2')).toHaveText('Sound, Composition, and Implementation for Games');
  await expect(page.locator('footer')).toContainText('Thanks for Visiting!');
  await expect(page.locator('footer')).toContainText('Contact gregkurka@gmail.com for more information');
});

test('Verify forms or buttons', async ({ page }) => {
  await page.goto('http://localhost'); // Change to the appropriate URL
  // There are no forms or buttons on this sample HTML, but if there were, you would interact with them here.
  // Example to test a button:
  // const button = page.locator('selector-for-button');
  // await button.click();
  // Add relevant assertions or navigations after button clicks.
});