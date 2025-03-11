import { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([]);

  // Handle submitting a new URL to generate a test
  const handleSubmit = async () => {
    if (!url) return;

    // Add a new entry to our list of URLs, marking it as "loading"
    setUrls((prevUrls) => [
      ...prevUrls,
      {
        url,
        loading: true,
        html: null,
        playwrightTest: null,
        testFilePath: null,
        runningTest: false,
        testSuccess: null,
        testResults: null, // structured object from JSON reporter
        testError: null,
      },
    ]);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/submit-url",
        {
          url,
        }
      );

      // Update the newly added item with the returned info
      setUrls((prevUrls) =>
        prevUrls.map((item) =>
          item.url === url
            ? {
                ...item,
                loading: false,
                html: response.data.html,
                playwrightTest: response.data.playwrightTest,
                testFilePath: response.data.testFilePath,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error fetching HTML and generating tests:", error);
      // Optionally, store an error for the user here
    }
  };

  // Handle running the test
  const handleRunTest = async (testFilePath, url) => {
    if (!testFilePath) return;

    // Mark the selected URL object as "runningTest"
    setUrls((prevUrls) =>
      prevUrls.map((item) =>
        item.url === url
          ? { ...item, runningTest: true, testResults: null, testError: null }
          : item
      )
    );

    try {
      // The server returns an object like:
      // {
      //   success: boolean,
      //   results: <JSON reporter object>,
      //   error: string,
      //   rawStdout: string,
      //   rawStderr: string
      // }
      const response = await axios.post("http://localhost:5000/api/run-test", {
        testFilePath,
      });
      const { success, results, error } = response.data;

      setUrls((prevUrls) =>
        prevUrls.map((item) =>
          item.url === url
            ? {
                ...item,
                runningTest: false,
                testSuccess: success,
                testResults: results,
                testError: error || null,
              }
            : item
        )
      );
    } catch (error) {
      // This .catch typically only triggers if there's a network or server error.
      console.error("Error running test (request failed):", error);
      setUrls((prevUrls) =>
        prevUrls.map((item) =>
          item.url === url
            ? { ...item, runningTest: false, testError: error.toString() }
            : item
        )
      );
    }
  };

  // Safely format the JSON reporter results:
  //  - handle top-level suite.specs
  //  - handle nested suite.suites[].specs
  const formatTestResults = (results) => {
    if (!results || !Array.isArray(results.suites)) {
      return "No valid test results found.";
    }

    // Flatten out all specs from each top-level suite
    const allSpecs = results.suites.flatMap((suite) => {
      // 1) Gather top-level specs if present
      const topLevelSpecs = (suite.specs || []).map((spec) => spec);

      // 2) If there's a sub-suites array, flatten those specs too
      const nestedSpecs = (suite.suites || []).flatMap((subSuite) =>
        (subSuite.specs || []).map((spec) => spec)
      );

      return [...topLevelSpecs, ...nestedSpecs];
    });

    // Map each spec's result to a pass/fail line
    return allSpecs
      .map((spec) => {
        const firstResult = spec.tests?.[0]?.results?.[0];
        if (!firstResult) {
          return `❓ ${spec.title} → No test result found`;
        }
        const status = firstResult.status;
        const duration = firstResult.duration;
        // Pass/fail indicator:
        const icon = status === "passed" ? "✅" : "❌";
        return `${icon} ${spec.title} → ${status} (${duration} ms)`;
      })
      .join("\n");
  };

  return (
    <div className="p-5 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        URL Playwright Tester
      </h1>

      {/* Input + Submit */}
      <div className="flex mb-4">
        <input
          className="border border-gray-300 rounded-l-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a URL (e.g., https://example.com)"
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600 transition"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>

      {/* List of submitted URLs */}
      <div className="space-y-4">
        {urls.map((item, index) => (
          <div key={index} className="p-4 border rounded-md shadow-sm bg-white">
            {/* The URL */}
            <p className="font-semibold text-lg">{item.url}</p>

            {/* Loading Indicator */}
            {item.loading && (
              <p className="text-gray-500">
                Fetching HTML and generating tests...
              </p>
            )}

            {/* Show HTML in a collapsible panel */}
            {item.html && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-500">
                  Show HTML
                </summary>
                <pre className="overflow-auto max-h-40 p-2 bg-gray-200 border rounded-md">
                  {item.html}
                </pre>
              </details>
            )}

            {/* Show generated Playwright test script */}
            {item.playwrightTest && (
              <details className="mt-2">
                <summary className="cursor-pointer text-green-500">
                  Show Playwright Test
                </summary>
                <pre className="overflow-auto max-h-40 p-2 bg-gray-200 border rounded-md">
                  {item.playwrightTest}
                </pre>
              </details>
            )}

            {/* Button to run test, if we have a testFilePath */}
            {item.testFilePath && (
              <button
                className="mt-2 bg-purple-500 text-white p-2 rounded-md hover:bg-purple-600 transition"
                onClick={() => handleRunTest(item.testFilePath, item.url)}
                disabled={item.runningTest}
              >
                {item.runningTest ? "Running..." : "Run Playwright Test"}
              </button>
            )}

            {/* If we have test results, show them */}
            {item.testResults && (
              <details className="mt-2">
                <summary className="cursor-pointer text-red-500">
                  Show Test Results
                </summary>
                <pre className="overflow-auto max-h-40 p-2 bg-gray-200 border rounded-md">
                  {formatTestResults(item.testResults)}
                </pre>
              </details>
            )}

            {/* If success is false, show the error message */}
            {item.testSuccess === false && item.testError && (
              <div className="mt-2 text-red-600 font-semibold">
                Some tests failed: {item.testError}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
