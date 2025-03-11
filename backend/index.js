require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const playwright = require("playwright");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const cheerio = require("cheerio");
const { spawn } = require("child_process");

async function runPlaywrightTest(filePath) {
  return new Promise((resolve, reject) => {
    const normalizedPath = path.normalize(filePath).replace(/\\/g, "/");
    const args = ["playwright", "test", normalizedPath, "--reporter=json"];
    const child = spawn("npx", args, {
      cwd: path.join(__dirname, "tests"),
      shell: true,
    });

    let stdoutData = "";
    let stderrData = "";

    child.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderrData += data.toString();
    });

    child.on("close", (code) => {
      let parsedResults;
      try {
        // The JSON reporter output is in stdout
        parsedResults = JSON.parse(stdoutData);
      } catch (err) {
        console.error("Failed to parse Playwright JSON reporter output:", err);
      }

      if (code === 0) {
        // All tests passed
        return resolve({
          success: true,
          results: parsedResults, // The structured test results
          rawStdout: stdoutData, // Optional raw output
          rawStderr: stderrData,
        });
      } else {
        // Some or all tests failed
        console.error("Playwright test failed:", stderrData || stdoutData);
        // IMPORTANT: We still resolve, but with success: false
        return resolve({
          success: false,
          results: parsedResults, // We can still see which tests failed
          rawStdout: stdoutData,
          rawStderr: stderrData || stdoutData,
          error: stderrData || stdoutData || "Unknown error",
        });
      }
    });
  });
}

function extractMainContent(html) {
  const $ = cheerio.load(html);
  return $("h1, h2, h3, p, button, a, form").slice(0, 100).toString(); // Limit elements
}

function savePlaywrightTest(url, testScript) {
  const sanitizedUrl = url.replace(/[^a-zA-Z0-9]/g, "_"); // Replace non-alphanumeric chars
  const filePath = path.join(__dirname, "tests", `${sanitizedUrl}.spec.js`);

  fs.writeFileSync(filePath, testScript, "utf8");
  console.log(`Test script saved: ${filePath}`);
  return filePath;
}

// Function to fetch HTML from a given URL
async function fetchHTML(url) {
  const browser = await playwright.chromium.launch(); // Launch browser
  const page = await browser.newPage(); // Open a new page
  await page.goto(url, { waitUntil: "domcontentloaded" }); // Navigate to the URL
  const html = await page.content(); // Get page HTML
  await browser.close(); // Close browser
  return html;
}

function cleanPlaywrightTest(testScript) {
  return testScript.replace(/```javascript|```/g, "").trim();
}

async function generatePlaywrightTest(html, url) {
  try {
    const prompt = `Analyze the following HTML for ${url} and generate a Playwright test script that:
  - Focuses on **critical user interactions** (e.g., login, form submissions, page navigation, button clicks).
  - Ensures elements **exist and are visible before interacting**.
  - Uses **robust Playwright best practices**, including:
    - **Waiting for elements** using \`await page.waitForLoadState('domcontentloaded')\`, \`locator.waitFor()\`, or \`page.waitForSelector()\`.
    - Using **assertions** to verify elements are present before interacting (e.g., \`expect(locator).toBeVisible()\` before clicking).
    - **Handling nested elements** properly (e.g., verifying elements within divs, spans, or shadow DOM).
    - Using **\`page.locator()\` instead of brittle selectors** for better stability.
    - **Validating element presence dynamically** to avoid flaky tests.
    - Adapting to **JavaScript-rendered content** by waiting for the page to settle before interaction.
  - Avoids:
    - **Overly specific or brittle selectors** that may change frequently.
    - **Strict assumptions about text content** unless found in the actual HTML.
    - **Unrealistic test cases** that rely on elements that may not always be present.
  
  **If elements might load asynchronously, add appropriate waiting strategies.**  
  **If multiple elements match a selector, ensure the test selects the correct one.**  

  **Return only the JavaScript Playwright test script, without explanations.**  

  **HTML:**  
  ${html}
  `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.5-preview",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 3500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let testScript = response.data.choices[0].message.content;
    return cleanPlaywrightTest(testScript); // Sanitize script before returning
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return null;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/api/submit-url", async (req, res) => {
  const { url } = req.body;

  try {
    console.log(`Fetching HTML for: ${url}`);
    const browser = await playwright.chromium.launch(); // Start browser
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" }); // Ensures dynamic content is loaded
    const html = await page.content(); // Extracts the actual HTML
    await browser.close(); // Close browser after use

    console.log(`Generating Playwright test for: ${url}`);
    const playwrightTest = await generatePlaywrightTest(html, url);

    if (!playwrightTest) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to generate test" });
    }

    // Save the test script
    const testFilePath = savePlaywrightTest(url, playwrightTest);

    res.json({ success: true, html, playwrightTest, testFilePath });
  } catch (error) {
    console.error("Error processing request:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to process request" });
  }
});

app.post("/api/run-test", async (req, res) => {
  const { testFilePath } = req.body;
  if (!testFilePath) {
    return res
      .status(400)
      .json({ success: false, error: "Test file path is missing" });
  }

  try {
    const result = await runPlaywrightTest(testFilePath);
    // `result` is the object we resolved in runPlaywrightTest
    res.json(result);
  } catch (error) {
    // If something truly unexpected happens (like a spawn error),
    // then we 500. But normal test failures won't land here anymore.
    console.error("Error running test:", error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
