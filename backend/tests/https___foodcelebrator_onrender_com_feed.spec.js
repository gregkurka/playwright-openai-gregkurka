const { test, expect } = require('@playwright/test');

test('Test important interactive elements on the page', async ({ page }) => {
  // Go to the feed page
  await page.goto('https://foodcelebrator.onrender.com/feed');

  // Ensure navigation and sidebar elements are loaded
  await page.locator('nav').waitFor();

  // Check 'Home' link is visible and clickable
  const homeLink = page.locator('a >> text=Home');
  await expect(homeLink).toBeVisible();
  await homeLink.click();

  // Go back to the feed page
  await page.goto('https://foodcelebrator.onrender.com/feed');

  // Check 'Sign Up' link is visible and clickable
  const signupLink = page.locator('a >> text=Sign Up');
  await expect(signupLink).toBeVisible();
  await signupLink.click();

  // Go back to the feed page
  await page.goto('https://foodcelebrator.onrender.com/feed');

  // Check 'Login' link is visible and clickable
  const loginLink = page.locator('a >> text=Login');
  await expect(loginLink).toBeVisible();
  await loginLink.click();

  // Check the login form loads and elements are present
  await page.locator('form').waitFor();

  const usernameInput = page.locator('input#username');
  const passwordInput = page.locator('input#password');
  const loginButton = page.locator('button[type="submit"]');

  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(loginButton).toBeVisible();

  // Simulate login attempt
  await usernameInput.fill('testuser');
  await passwordInput.fill('password');
  await loginButton.click();

  // This assumes login might show an error; adjust logic if test environment differs
  const loginError = page.locator('.login-error');
  if (await loginError.isVisible()) {
    console.log('Login error displayed as expected for invalid credentials.');
  }

  // Handle theme toggle button
  const themeToggleButton = page.locator('button >> text=🌙');
  await expect(themeToggleButton).toBeVisible();
  await themeToggleButton.click();

  // Ensure footer social links are visible and visitable
  const facebookLink = page.locator('a[href="https://facebook.com"]');
  const twitterLink = page.locator('a[href="https://twitter.com"]');
  const instagramLink = page.locator('a[href="https://instagram.com"]');

  await expect(facebookLink).toBeVisible();
  await expect(twitterLink).toBeVisible();
  await expect(instagramLink).toBeVisible();

  // Note: Social media link clicking is not simulated here for test isolation
});