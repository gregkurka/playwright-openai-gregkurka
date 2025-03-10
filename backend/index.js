require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const playwright = require("playwright");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.post("/api/submit-url", async (req, res) => {
  const { url } = req.body;
  console.log(`Received URL: ${url}`);
  res.json({ message: "URL received" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
