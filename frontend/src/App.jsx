import { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([]);

  // Function to submit a URL, fetch HTML, generate Playwright test, and save it
  const handleSubmit = async () => {
    if (!url) return;

    setUrls((prevUrls) => [
      ...prevUrls,
      {
        url,
        loading: true,
        html: null,
        playwrightTest: null,
        testFilePath: null,
      },
    ]);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/submit-url",
        { url }
      );

      setUrls((prevUrls) =>
        prevUrls.map((u) =>
          u.url === url
            ? {
                ...u,
                loading: false,
                html: response.data.html,
                playwrightTest: response.data.playwrightTest,
                testFilePath: response.data.testFilePath,
              }
            : u
        )
      );
    } catch (error) {
      console.error("Error fetching HTML:", error);
    }
  };

  // Function to run a saved Playwright test
  const handleRunTest = async (testFilePath, url) => {
    if (!testFilePath) return;

    setUrls((prevUrls) =>
      prevUrls.map((u) =>
        u.url === url ? { ...u, runningTest: true, testResult: null } : u
      )
    );

    try {
      const response = await axios.post("http://localhost:5000/api/run-test", {
        testFilePath,
      });

      setUrls((prevUrls) =>
        prevUrls.map((u) =>
          u.url === url
            ? { ...u, runningTest: false, testResult: response.data.result }
            : u
        )
      );
    } catch (error) {
      console.error("Error running test:", error);
    }
  };

  return (
    <div className="p-5 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        URL Playwright Tester
      </h1>

      {/* Input field for the user to enter a URL */}
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

      {/* Displaying the list of submitted URLs and their results */}
      <div className="space-y-4">
        {urls.map(
          (
            {
              url,
              loading,
              html,
              playwrightTest,
              testFilePath,
              runningTest,
              testResult,
            },
            index
          ) => (
            <div
              key={index}
              className="p-4 border rounded-md shadow-sm bg-white"
            >
              <p className="font-semibold text-lg">{url}</p>

              {/* Show loading state */}
              {loading && (
                <p className="text-gray-500">
                  Fetching HTML and generating tests...
                </p>
              )}

              {/* Display the fetched HTML */}
              {html && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-blue-500">
                    Show HTML
                  </summary>
                  <pre className="overflow-auto max-h-40 p-2 bg-gray-200 border rounded-md">
                    {html}
                  </pre>
                </details>
              )}

              {/* Display the generated Playwright test script */}
              {playwrightTest && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-green-500">
                    Show Playwright Test
                  </summary>
                  <pre className="overflow-auto max-h-40 p-2 bg-gray-200 border rounded-md">
                    {playwrightTest}
                  </pre>
                </details>
              )}

              {/* Run Playwright Test Button */}
              {testFilePath && (
                <button
                  className="mt-2 bg-purple-500 text-white p-2 rounded-md hover:bg-purple-600 transition"
                  onClick={() => handleRunTest(testFilePath, url)}
                  disabled={runningTest}
                >
                  {runningTest ? "Running..." : "Run Playwright Test"}
                </button>
              )}

              {/* Display Playwright Test Results */}
              {testResult && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-red-500">
                    Show Test Results
                  </summary>
                  <pre className="overflow-auto max-h-40 p-2 bg-gray-200 border rounded-md">
                    {testResult}
                  </pre>
                </details>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
