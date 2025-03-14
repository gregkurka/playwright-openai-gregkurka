const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  let articles = [];

  await page.goto("https://news.ycombinator.com/newest");

  while (articles.length < 100) {
    let newArticles = await page.$$eval(
      ".athing",
      (articleElements, subtextElements) => {
        return articleElements.map((article, index) => {
          const id = article.getAttribute("id");
          const titleElement = article.querySelector(".titleline a");
          const title = titleElement
            ? titleElement.textContent.trim()
            : "No title";

          const subtext = subtextElements[index];
          const timeElement = subtext ? subtext.querySelector(".age") : null;
          const timeString = timeElement
            ? timeElement.getAttribute("title")
            : "";

          let timestamp = null;
          if (timeString) {
            try {
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
      await page.$$(".subtext")
    );

    articles = articles.concat(newArticles);

    if (articles.length >= 100) break;

    const moreButton = await page.$("a.morelink");
    if (!moreButton) break;
    await moreButton.click();
    await page.waitForLoadState("networkidle");
  }

  articles = articles.slice(0, 100);
  articles.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  console.log("✅ Sorted List of Articles with Timestamps:");
  console.table(
    articles.map((article) => ({
      Title: article.title,
      Timestamp: article.timestamp
        ? new Date(article.timestamp).toLocaleString()
        : "Invalid Timestamp",
    }))
  );

  await browser.close();
}

(async () => {
  await sortHackerNewsArticles();
})();
