import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join("/app/public");

// Serve dynamic config.json
app.get("/config.json", (req, res) => {
  const config = {
    baseURL: process.env.API_URL || "/api/",
    drawURL: process.env.DRAW_URL || "/api/draw/",
    termsURL: process.env.TERMS_OF_SERVICE_URL,
  };
  res.json(config);
});

// Serve static files
app.use(express.static(publicDir));

// Fallback to index.html for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, () => {
  console.log(`UI Server listening on port ${port}`);
});
