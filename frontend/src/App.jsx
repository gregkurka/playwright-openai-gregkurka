import { useState } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([]);

  const handleSubmit = async () => {
    if (!url) return;
    setUrls([...urls, { url, loading: true }]);

    try {
      await axios.post("http://localhost:5000/api/submit-url", { url });
      setUrls(urls.map((u) => (u.url === url ? { ...u, loading: false } : u)));
    } catch (error) {
      console.error("Error submitting URL:", error);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">URL Tester</h1>
      <input
        className="border p-2 mr-2"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <button className="bg-blue-500 text-white p-2" onClick={handleSubmit}>
        Submit
      </button>

      <div className="mt-4">
        {urls.map(({ url, loading }, index) => (
          <div key={index} className="p-2 border">
            {url} {loading ? " - Loading..." : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
