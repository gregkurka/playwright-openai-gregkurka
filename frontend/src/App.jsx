import { useState } from "react";
import axios from "axios";

function App() {
  const [urlInput, setUrlInput] = useState("");
  // We store a list of "TestItems" for each URL the user has submitted
  const [testItems, setTestItems] = useState([]);

  /**
   * Submit a URL to the backend to fetch HTML and generate the Playwright test script.
   */
  const handleSubmitUrl = async () => {
    if (!urlInput) return;

    // Immediately add an item to the list in "loading" state
    const newItem = {
      url: urlInput,
      loadingGeneration: true,
      html: null,
      testScript: null,
      testFilePath: null,
      generationError: null,

      // We'll also track test execution states
      runningTest: false,
      testResults: null,
      testSuccess: null,
      testError: null,
    };

    setTestItems((prev) => [...prev, newItem]);
    setUrlInput("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/submit-url",
        {
          url: urlInput,
        }
      );
      if (response.data.success) {
        // Update the new item with the data
        setTestItems((prev) =>
          prev.map((item) => {
            if (item.url === urlInput) {
              return {
                ...item,
                loadingGeneration: false,
                html: response.data.html,
                testScript: response.data.playwrightTest,
                testFilePath: response.data.testFilePath,
              };
            }
            return item;
          })
        );
      } else {
        // If success is false, we have a generation error
        setTestItems((prev) =>
          prev.map((item) => {
            if (item.url === urlInput) {
              return {
                ...item,
                loadingGeneration: false,
                generationError: response.data.error || "Unknown error",
              };
            }
            return item;
          })
        );
      }
    } catch (err) {
      console.error("Error generating test:", err);
      setTestItems((prev) =>
        prev.map((item) => {
          if (item.url === urlInput) {
            return {
              ...item,
              loadingGeneration: false,
              generationError: err.message || "Unknown error",
            };
          }
          return item;
        })
      );
    }
  };

  /**
   * Execute the saved test script on the server, parse results, and store them.
   */
  const handleRunTest = async (testFilePath, url) => {
    if (!testFilePath) return;

    // Mark the item as running
    setTestItems((prev) =>
      prev.map((item) =>
        item.url === url
          ? { ...item, runningTest: true, testResults: null, testError: null }
          : item
      )
    );

    try {
      const response = await axios.post("http://localhost:5000/api/run-test", {
        testFilePath,
      });
      const { success, results, error } = response.data;

      setTestItems((prev) =>
        prev.map((item) => {
          if (item.url === url) {
            return {
              ...item,
              runningTest: false,
              testSuccess: success,
              testResults: results,
              testError: error,
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error("Error running test:", err);
      setTestItems((prev) =>
        prev.map((item) =>
          item.url === url
            ? {
                ...item,
                runningTest: false,
                testError: err.message || "Unknown error",
              }
            : item
        )
      );
    }
  };

  /**
   * Utility to flatten and format the structured JSON reporter results.
   * We'll gather suite -> specs, and suite -> suites -> specs, etc.
   */
  const formatTestResults = (results) => {
    if (!results || !results.suites) {
      return ["No valid test results found."];
    }

    let lines = [];
    for (const suite of results.suites) {
      // Possibly push suite title if available
      if (suite.title) {
        lines.push(`Suite: ${suite.title}`);
      }

      // Specs in the current suite
      if (Array.isArray(suite.specs)) {
        for (const spec of suite.specs) {
          lines.push(formatSingleSpec(spec));
        }
      }

      // Nested suites
      if (Array.isArray(suite.suites)) {
        for (const nested of suite.suites) {
          lines.push(`  Sub-suite: ${nested.title}`);
          if (Array.isArray(nested.specs)) {
            for (const spec of nested.specs) {
              lines.push("    " + formatSingleSpec(spec));
            }
          }
        }
      }
    }

    return lines;
  };

  const formatSingleSpec = (spec) => {
    const testTitle = spec.title;
    const testResults = spec.tests?.[0]?.results ?? [];
    // We only pick the first result for simplicity, or you might iterate if there are multiple runs
    if (!testResults.length) {
      return `❓ ${testTitle} → No result data`;
    }
    const { status, duration, error } = testResults[0];
    const icon = status === "passed" ? "✅" : "❌";
    let line = `${icon} ${testTitle} → ${status} (${duration} ms)`;
    if (status !== "passed" && error?.message) {
      line += `\n      Error: ${error.message}`;
    }
    return line;
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Playwright Tester</h1>

      {/* URL input */}
      <div className="flex mb-6">
        <input
          className="border flex-grow p-2 rounded-l"
          placeholder="Enter a URL..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-r"
          onClick={handleSubmitUrl}
        >
          Submit
        </button>
      </div>

      {/* List of test items */}
      <div className="space-y-4">
        {testItems.map((item, idx) => {
          return (
            <div className="bg-white p-4 rounded shadow" key={idx}>
              <h2 className="font-semibold text-lg">
                URL: <span className="text-blue-800">{item.url}</span>
              </h2>

              {/* If generation is loading */}
              {item.loadingGeneration && (
                <p className="italic text-gray-500">
                  Generating test script...
                </p>
              )}

              {/* If generation error */}
              {item.generationError && (
                <p className="text-red-600 font-semibold">
                  Generation Error: {item.generationError}
                </p>
              )}

              {/* If generation succeeded, show some details */}
              {!item.loadingGeneration &&
                !item.generationError &&
                item.html && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-500">
                      View Fetched HTML
                    </summary>
                    <pre className="max-h-40 overflow-auto border bg-gray-100 p-2 mt-1">
                      {item.html}
                    </pre>
                  </details>
                )}

              {/* Show the test script */}
              {!item.loadingGeneration && item.testScript && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-green-600">
                    View Generated Test Script
                  </summary>
                  <pre className="max-h-60 overflow-auto border bg-gray-100 p-2 mt-1">
                    {item.testScript}
                  </pre>
                </details>
              )}

              {/* Button to run test, if we have a filePath */}
              {item.testFilePath && !item.loadingGeneration && (
                <button
                  className={`mt-3 px-4 py-2 rounded text-white ${
                    item.runningTest
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                  onClick={() => handleRunTest(item.testFilePath, item.url)}
                  disabled={item.runningTest}
                >
                  {item.runningTest ? "Running test..." : "Run Playwright Test"}
                </button>
              )}

              {/* Display test results if we have them */}
              {item.testResults && (
                <div className="mt-4 bg-gray-50 border p-2 rounded">
                  <h3 className="font-semibold text-md mb-2">
                    Test Results for {item.url}:
                  </h3>
                  {/* If success is true or false, show summary */}
                  {item.testSuccess && (
                    <p className="text-green-700 font-medium">
                      All tests passed successfully!
                    </p>
                  )}
                  {item.testSuccess === false && (
                    <p className="text-red-700 font-medium">
                      Some or all tests failed.
                    </p>
                  )}

                  {/* Show the detailed lines */}
                  <div className="text-sm whitespace-pre-wrap">
                    {formatTestResults(item.testResults).map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>

                  {/* If we have a testError from the server */}
                  {item.testError && (
                    <p className="mt-2 text-red-500">
                      <strong>Error details:</strong> {item.testError}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
