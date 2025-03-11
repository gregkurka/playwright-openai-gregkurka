const { test, expect } = require('@playwright/test');

test('Hacker News homepage loads successfully', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/');
  await expect(page).toHaveTitle('Hacker News');
});

test('Main navigation links are visible', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/');
  const navLinks = ['newest', 'past', 'comments', 'ask', 'show', 'jobs', 'submit'];
  for (const link of navLinks) {
    await expect(page.locator(`a[href="${link}"]`)).toBeVisible();
  }
});

test('Login link is visible', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/');
  await expect(page.locator('a[href^="login"]')).toBeVisible();
});

test('First news item is visible with title and link', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/');
  const firstItem = page.locator('tr.athing').first();
  await expect(firstItem.locator('span.rank')).toHaveText('1.');
  await expect(firstItem.locator('span.titleline > a')).toBeVisible();
});

test('Footer links are visible', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/');
  const footerLinks = ['Guidelines', 'FAQ', 'Lists', 'API', 'Security', 'Legal', 'Apply to YC', 'Contact'];
  for (const text of footerLinks) {
    await expect(page.getByRole('link', { name: text })).toBeVisible();
  }
});

test('Search input is visible in footer', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/');
  await expect(page.getByRole('textbox', { name: 'Search:' })).toBeVisible();
});

test('RSS feed link is present in head', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/');
  const rssLink = page.locator('link[type="application/rss+xml"]');
  await expect(rssLink).toHaveAttribute('href', 'rss');
});

test('Y Combinator event announcement is visible', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/');
  await expect(page.getByText('Join us for AI Startup School this June 16-17 in San Francisco!')).toBeVisible();
});