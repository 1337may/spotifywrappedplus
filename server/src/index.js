import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { spotifyAuthRouter } from "./spotifyAuth.js";

const app = express();
const port = process.env.PORT || 8888;
const isProduction = process.env.NODE_ENV === "production";

// Render sets RENDER_EXTERNAL_URL to this service's own public https URL.
const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://127.0.0.1:${port}`;
const clientUrl = process.env.CLIENT_URL || baseUrl;
// The redirect_uri must be reachable via the client-facing origin: in
// local dev that's the Vite dev server (which proxies /callback here),
// in production it's the same origin as baseUrl.
const redirectUri = process.env.REDIRECT_URI || `${clientUrl}/callback`;

if (!isProduction) {
  app.use(cors({ origin: clientUrl }));
}
app.use(cookieParser());
app.use(spotifyAuthRouter({ redirectUri, clientUrl }));

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
