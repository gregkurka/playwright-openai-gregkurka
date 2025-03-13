const { test, expect } = require("@playwright/test");

test("Check if the first 100 articles are correctly sorted", async ({
  page,
}) => {
  await page.goto("https://news.ycombinator.com/newest");

  // Extract 100 articles
  const articles = await page.$$eval(".athing", (elements) => {
    return elements.slice(0, 100).map((element) => {
      const id = element.getAttribute("id");
      const titleElement = element.querySelector(".titleline a");
      const title = titleElement ? titleElement.textContent : "No title";
      return { id, title };
    });
  });

  // Extract timestamps
  const timestamps = await page.$$eval(".subtext", (elements) => {
    return elements.slice(0, 100).map((element) => {
      const timeElement = element.querySelector(".age a");
      const timeString = timeElement ? timeElement.getAttribute("title") : "";
      return new Date(timeString).getTime();
    });
  });

  // Validate sorting
  const isSorted = timestamps.every(
    (time, index, arr) => index === 0 || time <= arr[index - 1]
  );
  if (isSorted) {
    console.log("✅ The first 100 articles are correctly sorted");
  } else {
    console.log("❌ The articles are NOT correctly sorted");
  }

  // Log the first five articles
  console.table(articles.slice(0, 5));
});
