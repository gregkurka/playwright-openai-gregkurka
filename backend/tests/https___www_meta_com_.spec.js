const { test, expect } = require('@playwright/test');

test.describe('Meta Website', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.meta.com/');
  });

  test('should navigate to the main content on "Skip to main content" click', async ({ page }) => {
    const skipToMainContent = page.locator('a:has-text("Skip to main content")');
    await expect(skipToMainContent).toBeVisible();
    await skipToMainContent.click();
    const mainContent = page.locator('#mdc-main-content');
    await expect(mainContent).toBeFocused();
  });

  test('should navigate to the Meta home on Meta logo click', async ({ page }) => {
    const homeLink = page.locator('a[aria-label="Meta home"]');
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL('https://www.meta.com/');
  });

  test('should navigate to About Meta page', async ({ page }) => {
    const aboutMetaLink = page.locator('a:has-text("About Meta")');
    await expect(aboutMetaLink).toBeVisible();
    await aboutMetaLink.click();
    await expect(page).toHaveURL('https://about.meta.com/');
  });

  test('should navigate to Shop All page', async ({ page }) => {
    const shopAllLink = page.locator('a:has-text("Shop all")');
    await expect(shopAllLink).toBeVisible();
    await shopAllLink.click();
    await expect(page).toHaveURL('https://www.meta.com/ai-glasses/shop-all/');
  });

  test('should navigate to AI glasses details on Learn more click', async ({ page }) => {
    const learnMoreLink = page.locator('a[aria-label="Learn more"]');
    await expect(learnMoreLink).toBeVisible();
    await learnMoreLink.click();
    await expect(page).toHaveURL('https://www.meta.com/ai-glasses/wayfarer-transparent-black-coperni-grey/');
  });

  test('should navigate to Meta Quest 3S details', async ({ page }) => {
    const quest3SLink = page.locator('a[aria-label="Learn more about Meta Quest 3S"]');
    await expect(quest3SLink).toBeVisible();
    await quest3SLink.click();
    await expect(page).toHaveURL('https://www.meta.com/quest/quest-3s/');
  });

});