require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const playwright = require("playwright");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

async function runPlaywrightTest(filePath) {
  return new Promise((resolve, reject) => {
    exec(
      `npx playwright test ${filePath} --reporter=json`,
      (error, stdout, stderr) => {
        if (error) {
          reject(stderr);
        } else {
          resolve(stdout);
        }
      }
    );
  });
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

async function generatePlaywrightTest(html) {
  try {
    const prompt = `Given the following HTML, generate a Playwright test script that:
      - Ensures the page loads successfully
      - Checks if all links are valid
      - Tests any forms or buttons
      - Verifies text content

      Return only the JavaScript Playwright test script, without any explanations.

      HTML:
      ${html}`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
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
    const html = await fetchHTML(url);

    console.log(`Generating Playwright test for: ${url}`);
    const playwrightTest = await generatePlaywrightTest(html);

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

  try {
    console.log(`Running Playwright test: ${testFilePath}`);
    const result = await runPlaywrightTest(testFilePath);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Error running test:", error);
    res.status(500).json({ success: false, error: "Failed to run test" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
