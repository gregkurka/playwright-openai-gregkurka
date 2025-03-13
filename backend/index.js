require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const playwright = require("playwright");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const cheerio = require("cheerio");

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Utility: Run the Playwright test at the given file path and return structured results.
 */
async function runPlaywrightTest(filePath) {
  return new Promise((resolve, reject) => {
    const normalizedPath = path.normalize(filePath).replace(/\\/g, "/");
    // Note: We use JSON reporter to get structured results
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
        parsedResults = JSON.parse(stdoutData);
      } catch (err) {
        console.error("Failed to parse JSON reporter output:", err);
      }

      const finalResults = {
        success: code === 0,
        // We'll pass through the raw logs in case the user wants them
        rawStdout: stdoutData,
        rawStderr: stderrData,
        // The structured test results
        results: parsedResults,
        // Provide an error if something went wrong
        error: code === 0 ? null : stderrData || stdoutData || "Unknown error",
      };
      resolve(finalResults);
    });
  });
}

/**
 * Utility: Clean the AI's response of markdown fences if needed
 */
function cleanPlaywrightTest(testScript) {
  return testScript.replace(/```javascript|```js|```/g, "").trim();
}

/**
 * Utility: Save the generated Playwright test to the local filesystem.
 */
function savePlaywrightTest(url, testScript) {
  const sanitizedUrl = url.replace(/[^a-zA-Z0-9]/g, "_");
  const filePath = path.join(__dirname, "tests", `${sanitizedUrl}.spec.js`);

  fs.writeFileSync(filePath, testScript, "utf8");
  console.log(`Test script saved to: ${filePath}`);
  return filePath;
}

/**
 * Utility: Launch a browser, fetch and return the HTML for the given URL.
 */
async function fetchHTML(url) {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const html = await page.content();
  await browser.close();
  return html;
}

/**
 * Generates a production-ready Playwright test script using the real OpenAI API.
 *
 * @param {string} html - The fetched HTML of the target URL (may be partial or dynamic).
 * @param {string} url - The target URL for which we generate a test script.
 * @returns {string|null} The cleaned test script as a string, or null if generation fails.
 */
async function generatePlaywrightTest(html, url) {
  try {
    // The prompt is carefully designed to produce stable, universal test scripts.
    // Modify as needed for your production environment.
    const prompt =
      "We want a production-ready Playwright test script for " +
      url +
      ". The HTML below may be partial or dynamic, so produce stable tests likely to pass.\n\n" +
      "**Key instructions**:\n" +
      "1. Separate checks into multiple test() blocks with descriptive names.\n" +
      "2. Use robust locators (e.g., page.getByRole(), page.getByText(), page.locator()) and wait for elements to be visible.\n" +
      "3. Validate basic functionality: page load, main elements (headings, links, buttons), etc.\n" +
      "4. Keep tests universal; avoid relying on dynamic data or complex interactions.\n" +
      "5. **If multiple elements match the same locator in strict mode, refine the selector or use .first() (or .nth()) to pick one.**\n" +
      "6. **Skip or refine checks for text strings that may appear multiple times (like 'new', 'More', 'Search'). Only test them if you can disambiguate via a unique attribute, exact text, or .first() usage.**\n" +
      "7. **Only create a test for an element if there's clear evidence it exists in the snippet (e.g., a ‘search’ input or a specific link text). If it's not clearly in the HTML, do not test it.**\n" +
      "8. Return only the JavaScript test script without extra commentary.\n\n" +
      "HTML:\n" +
      html;

    // Make sure OPENAI_API_KEY is set in your environment or .env file
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        // You can fine-tune temperature and max_tokens as appropriate.
        temperature: 0.2,
        max_tokens: 3500,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    let testScript = response.data.choices[0]?.message?.content || "";
    testScript = cleanPlaywrightTest(testScript);

    // Optional: Ensure we got something that looks like JS code.
    if (!testScript || !testScript.includes("test(")) {
      console.warn(
        "AI did not return a valid Playwright test script. Response:",
        testScript
      );
      return null;
    }

    return testScript;
  } catch (error) {
    console.error("Error generating Playwright test via OpenAI:", error);
    return null;
  }
}

/**
 * Main route - just a sanity check
 */
app.get("/", (req, res) => {
  res.send("Server is up and running");
});

/**
 * Endpoint: Submit a URL to fetch HTML, generate a test, and save the test file.
 */

app.post("/api/submit-url", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: "No URL provided. Please include 'url' in the request body.",
    });
  }

  try {
    console.log(`[submit-url] Fetching HTML for: ${url}`);
    // fetch the HTML
    const html = await fetchHTML(url);

    console.log(`[submit-url] Generating Playwright test for: ${url}`);

    // Convert the URL into a valid filename format
    const urlAsFilename =
      "https___" +
      url
        // Remove "http://" or "https://"
        .replace(/^https?:\/\//, "")
        // Replace anything NOT a-z, A-Z, 0-9, or underscore with underscore
        .replace(/[^a-zA-Z0-9_]/g, "_") +
      ".spec.js";

    const testFilePath = path.join("tests", urlAsFilename);

    if (fs.existsSync(testFilePath)) {
      console.log(`[submit-url] Found existing test file for: ${url}`);

      const playwrightTest = fs.readFileSync(testFilePath, "utf8");

      return res.json({
        success: true,
        html,
        playwrightTest,
        testFilePath,
      });
    } else {
      // Generate a new test script if one does not exist
      const playwrightTest = await generatePlaywrightTest(html, url);

      if (!playwrightTest) {
        return res.status(500).json({
          success: false,
          error: "Failed to generate test script.",
        });
      }

      // Save the test script
      fs.writeFileSync(testFilePath, playwrightTest, "utf8");

      return res.json({
        success: true,
        html,
        playwrightTest,
        testFilePath,
      });
    }
  } catch (error) {
    console.error("[submit-url] Error:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while processing your request.",
    });
  }
});

/**
 * Endpoint: Run the test script that was saved previously
 */
app.post("/api/run-test", async (req, res) => {
  const { testFilePath } = req.body;

  if (!testFilePath) {
    return res.status(400).json({
      success: false,
      error:
        "Test file path not provided. Include 'testFilePath' in the request.",
    });
  }

  try {
    console.log(`[run-test] Running test for file: ${testFilePath}`);
    const result = await runPlaywrightTest(testFilePath);
    return res.json(result);
  } catch (error) {
    console.error("[run-test] Error running test:", error);
    return res.status(500).json({
      success: false,
      error:
        error.message || "An unknown error occurred while running the test.",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
