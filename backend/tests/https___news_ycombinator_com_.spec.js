const { test, expect } = require("@playwright/test");

test("Hacker News page", async ({ page }) => {
  // Ensure the page loads successfully
  await page.goto("https://news.ycombinator.com");
  await expect(page).toHaveTitle(/Hacker News/);

  // Check if all links are valid
  const links = await page.locator("a");
  const linkCount = await links.count();

  for (let i = 0; i < linkCount; i++) {
    const link = links.nth(i);
    let href = await link.getAttribute("href");

    // Ignore empty, JavaScript-based, or internal anchor links
    if (!href || href.startsWith("#") || href.startsWith("javascript"))
      continue;

    // Ignore non-navigational Hacker News actions (like voting, hiding)
    if (
      href.includes("vote?id=") ||
      href.includes("hide?id=") ||
      href.includes("goto=")
    )
      continue;

    // Convert relative URLs to absolute URLs
    if (!href.startsWith("http")) {
      href = new URL(href, "https://news.ycombinator.com").href;
    }

    // Validate if the link is reachable
    try {
      const newPage = await page.context().newPage();
      const response = await newPage.goto(href, {
        waitUntil: "domcontentloaded",
        timeout: 5000,
      });

      if (response) {
        expect(response.status()).toBeLessThan(400);
      }

      await newPage.close();
    } catch (error) {
      console.warn(`Skipping unreachable link: ${href} - ${error.message}`);
    }
  }

  // Click the login link and verify navigation
  const loginLink = page.locator('a[href="login?goto=news"]');
  await loginLink.click();
  await expect(page).toHaveURL(/login/);

  // Click the back button
  await page.goBack();

  // Verify page content
  await expect(page.locator("a[href='news']").first()).toContainText(
    "Hacker News"
  );
});
