const { test, expect } = require("@playwright/test");

let articles = []; // list of articles with timestamps

test("Check if the first 100 articles are correctly sorted", async ({
  page,
}) => {
  await page.goto("https://news.ycombinator.com/newest");

  while (articles.length < 100) {
    // Extract articles and timestamps together
    let newArticles = await page.$$eval(
      ".athing",
      (articleElements, subtextElements) => {
        return articleElements.map((article, index) => {
          const id = article.getAttribute("id");
          const titleElement = article.querySelector(".titleline a");
          const title = titleElement
            ? titleElement.textContent.trim()
            : "No title";

          // Matching subtext element for timestamp
          const subtext = subtextElements[index];
          const timeElement = subtext ? subtext.querySelector(".age") : null;
          const timeString = timeElement
            ? timeElement.getAttribute("title")
            : "";

          console.log(`Extracted raw timestamp: "${timeString}"`); // Debugging

          // Convert timeString to a proper timestamp
          let timestamp = null;
          if (timeString) {
            try {
              // Extract only the date-time part before the space (ignoring Unix timestamp)
              const formattedTime = timeString.split(" ")[0];
              timestamp = new Date(formattedTime).getTime();
              if (isNaN(timestamp)) throw new Error("Invalid timestamp format");
            } catch (error) {
              console.error(`❌ Error parsing timestamp: "${timeString}"`);
              timestamp = null;
            }
          }

          return { id, title, timestamp };
        });
      },
      await page.$$(".subtext") // Passing subtext elements to maintain index alignment
    );

    // Add new data
    articles = articles.concat(newArticles);

    // If we have enough articles, stop
    if (articles.length >= 100) break;

    // Click "More" to load additional articles
    const moreButton = await page.$("a.morelink");
    if (!moreButton) break; // No more pages

    await moreButton.click();
    await page.waitForLoadState("networkidle"); // Wait for the new page to load
  }

  // Ensure we only take the first 100 entries
  articles = articles.slice(0, 100);

  // Validate sorting
  const isSorted = articles.every(
    (article, index, arr) =>
      index === 0 || article.timestamp <= arr[index - 1].timestamp
  );

  //tells playwright it should expect a certain outcome or fail
  expect(isSorted).toBe(true);

  if (isSorted) {
    console.log("✅ The first 100 articles are correctly sorted");
  } else {
    console.log("❌ The articles are NOT correctly sorted");
  }
});

// Ensure logging happens **after** the test is done
test.afterAll(async () => {
  console.log("\n Final List of Articles with Timestamps:");
  console.table(
    articles.map((article) => ({
      Title: article.title,
      Timestamp: article.timestamp
        ? new Date(article.timestamp).toLocaleString()
        : "Invalid Timestamp",
    }))
  );
});
