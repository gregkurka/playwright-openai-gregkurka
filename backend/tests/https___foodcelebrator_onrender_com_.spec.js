const { test, expect } = require('@playwright/test');

test('Food Celebrator critical interactions', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('https://foodcelebrator.onrender.com/');
  await page.waitForLoadState('domcontentloaded');

  // Verify Home, Sign Up, and Login links are visible in the sidebar
  const homeLink = page.locator('a[href="/"]').first();
  await homeLink.waitFor();
  await expect(homeLink).toBeVisible();

  const signUpLink = page.locator('a[href="/signup"]').first();
  await signUpLink.waitFor();
  await expect(signUpLink).toBeVisible();

  const loginLink = page.locator('a[href="/login"]').first();
  await loginLink.waitFor();
  await expect(loginLink).toBeVisible();

  // Test navigation to Sign Up page
  await signUpLink.click();
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL('https://foodcelebrator.onrender.com/signup');

  // Return to homepage
  await page.goBack();
  await page.waitForLoadState('domcontentloaded');

  // Test navigation to Login page
  await loginLink.click();
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL('https://foodcelebrator.onrender.com/login');

  // Return to homepage
  await page.goBack();
  await page.waitForLoadState('domcontentloaded');

  // Verify "Upload your photo!" button is present and interactable
  const uploadButton = page.locator('button', { hasText: 'Upload your photo!' });
  await uploadButton.waitFor();
  await expect(uploadButton).toBeVisible();

  // Click the Login button on the main page
  const mainLoginButton = page.locator('button:has-text("Login")').first();
  await mainLoginButton.waitFor();
  await expect(mainLoginButton).toBeVisible();
  await mainLoginButton.click();

  // Ensure the page navigates to login
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL('https://foodcelebrator.onrender.com/login');
});