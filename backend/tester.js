const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // Launch a Chromium browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to Hacker News' "newest" section
  await page.goto("https://news.ycombinator.com/newest");

  // Extract article elements
  const articles = await page.$$eval(".athing", (elements) => {
    return elements.slice(0, 100).map((article) => {
      const id = article.getAttribute("id");
      const title =
        article.querySelector(".titleline a")?.innerText || "No title";
      return { id, title };
    });
  });

  // Extract timestamps from the next row of each article (if available)
  const timestamps = await page.$$eval(".subtext", (elements) => {
    return elements.slice(0, 100).map((subtext) => {
      const ageElement = subtext.querySelector(".age a");
      return ageElement
        ? new Date(ageElement.getAttribute("title")).getTime()
        : 0;
    });
  });

  // Validate sorting: timestamps should be in **descending order** (newest first)
  const isSorted = timestamps.every(
    (time, index, arr) => index === 0 || time <= arr[index - 1]
  );

  if (isSorted) {
    console.log(
      "✅ The first 100 articles are correctly sorted from newest to oldest."
    );
  } else {
    console.log("❌ The articles are NOT correctly sorted.");
  }

  console.log("\nFirst 5 articles for reference:");
  console.table(articles.slice(0, 5));

  // Close browser
  await browser.close();
}

// Run the function
(async () => {
  await sortHackerNewsArticles();
})();
