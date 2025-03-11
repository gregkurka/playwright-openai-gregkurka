const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.gregkurka.com/');
});

test('Page loads successfully with correct title', async ({ page }) => {
  await expect(page).toHaveTitle(/Greg Kurka/);
});

test('Header displays correct main heading and subheading', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Greg Kurka' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sound, Composition, and Implementation for Games' })).toBeVisible();
});

test('All video reels are visible', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Music Reel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sound Design Reel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '3d Game Kit Project for Unity and Wwise' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lyra Project for Unreal Engine and FMOD' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Piano Improvisations' })).toBeVisible();

  const videoFrames = page.locator('.video-container iframe');
  await expect(videoFrames).toHaveCount(5);
  for (let i = 0; i < 5; i++) {
    await expect(videoFrames.nth(i)).toBeVisible();
  }
});

test('Headshot image is visible with correct alt text', async ({ page }) => {
  const headshot = page.getByAltText('Greg Kurka Headshot');
  await expect(headshot).toBeVisible();
});

test('LinkedIn link is visible and has correct URL', async ({ page }) => {
  const linkedInLink = page.getByRole('link', { name: "Greg Kurka's LinkedIn" });
  await expect(linkedInLink).toBeVisible();
  await expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/in/greg-kurka-14874a148');
});

test('Programming and Composition links are visible and correct', async ({ page }) => {
  const programmingLink = page.getByRole('link', { name: 'Learn more about my programming work with Kooapps' });
  const compositionLink = page.getByRole('link', { name: 'Learn more about my music composition work with Kooapps' });

  await expect(programmingLink).toBeVisible();
  await expect(programmingLink).toHaveAttribute('href', 'https://gregkurka.com/programming/');

  await expect(compositionLink).toBeVisible();
  await expect(compositionLink).toHaveAttribute('href', 'https://gregkurka.com/composition/');
});

test('Footer displays contact email correctly', async ({ page }) => {
  const emailLink = page.getByRole('link', { name: 'gregkurka@gmail.com' });
  await expect(emailLink).toBeVisible();
  await expect(emailLink).toHaveAttribute('href', 'mailto:gregkurka@gmail.com');
});