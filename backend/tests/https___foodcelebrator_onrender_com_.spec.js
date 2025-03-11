const { test, expect } = require('@playwright/test');

test.describe('Food Celebrator User Interactions', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://foodcelebrator.onrender.com/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Navigates to Sign Up page', async ({ page }) => {
    const signUpLink = page.locator('a:has-text("Sign Up")');
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL('https://foodcelebrator.onrender.com/signup');
  });

  test('Navigates to Login page', async ({ page }) => {
    const loginLink = page.locator('a:has-text("Login")');
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL('https://foodcelebrator.onrender.com/login');
  });
  
  test('Validates Home button visibility', async ({ page }) => {
    const homeButton = page.locator('a:has-text("Home")');
    await expect(homeButton).toBeVisible();
  });

  test('Toggles theme mode', async ({ page }) => {
    const themeToggle = page.locator('button:text("🌙")');
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
  });

  test('Footer links are visible', async ({ page }) => {
    const aboutLink = page.locator('footer a:has-text("About")');
    const contactLink = page.locator('footer a:has-text("Contact")');
    const privacyPolicyLink = page.locator('footer a:has-text("Privacy Policy")');
    
    await expect(aboutLink).toBeVisible();
    await expect(contactLink).toBeVisible();
    await expect(privacyPolicyLink).toBeVisible();
  });
  
  test('Handles mobile menu button and visibility', async ({ page }) => {
    const mobileMenuButton = page.locator('button:text("☰")', { hasText: '☰' });
    
    await page.setViewportSize({ width: 375, height: 812 }); // Simulate mobile

    await expect(mobileMenuButton).toBeVisible();
    await mobileMenuButton.click();
    // Example handling of the expected action on the menu button click
    // const someMenu = ... 
    // await expect(someMenu).toBeVisible();
  });

});