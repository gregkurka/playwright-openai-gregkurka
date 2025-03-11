const { test, expect } = require('@playwright/test');

test.describe('Greg Kurka Website Tests', () => {

  test('Page should load successfully', async ({ page }) => {
    await page.goto('https://www.gregkurka.com/');
    await expect(page).toHaveTitle('Greg Kurka');
  });

  test('Header should contain main headings', async ({ page }) => {
    await page.goto('https://www.gregkurka.com/');
    await expect(page.getByRole('heading', { name: 'Greg Kurka' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sound, Composition, and Implementation for Games' })).toBeVisible();
  });

  test('Main content should have video sections', async ({ page }) => {
    await page.goto('https://www.gregkurka.com/');
    const videoTitles = [
      'Music Reel',
      'Sound Design Reel',
      '3d Game Kit Project for Unity and Wwise',
      'Lyra Project for Unreal Engine and FMOD',
      'Piano Improvisations'
    ];
    for (const title of videoTitles) {
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
    }
  });

  test('Headshot image should be visible', async ({ page }) => {
    await page.goto('https://www.gregkurka.com/');
    const headshot = page.locator('.headshot img');
    await expect(headshot).toBeVisible();
    await expect(headshot).toHaveAttribute('alt', 'Greg Kurka Headshot');
  });

  test('Footer should contain contact information', async ({ page }) => {
    await page.goto('https://www.gregkurka.com/');
    await expect(page.getByText('Thanks for Visiting!')).toBeVisible();
    await expect(page.getByRole('link', { name: 'gregkurka@gmail.com' })).toHaveAttribute('href', 'mailto:gregkurka@gmail.com');
  });

  test('Links to external and internal pages should be present', async ({ page }) => {
    await page.goto('https://www.gregkurka.com/');
    await expect(page.getByRole('link', { name: "Greg Kurka's LinkedIn" })).toHaveAttribute('href', 'https://www.linkedin.com/in/greg-kurka-14874a148');
    await expect(page.getByRole('link', { name: 'Learn more about my programming work with Kooapps' })).toHaveAttribute('href', 'https://gregkurka.com/programming/');
    await expect(page.getByRole('link', { name: 'Learn more about my music composition work with Kooapps' })).toHaveAttribute('href', 'https://gregkurka.com/composition/');
  });

});