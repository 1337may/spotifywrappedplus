import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { spotifyAuthRouter } from "./spotifyAuth.js";

const requiredEnvVars = ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}. Copy server/.env.example to server/.env and fill it in.`);
    process.exit(1);
  }
}

const app = express();
const port = process.env.PORT || 8888;
const isProduction = process.env.NODE_ENV === "production";

// Render sets RENDER_EXTERNAL_URL to this service's own public https URL.
const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://127.0.0.1:${port}`;
const clientUrl = process.env.CLIENT_URL || baseUrl;
const redirectUri = process.env.REDIRECT_URI || `${baseUrl}/callback`;

if (!isProduction) {
  app.use(cors({ origin: clientUrl }));
}
app.use(cookieParser());
app.use(
  spotifyAuthRouter({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri,
    clientUrl,
  })
);

if (isProduction) {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.join(dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server listening on http://127.0.0.1:${port}`);
  console.log(`Redirect URI: ${redirectUri}`);
});
