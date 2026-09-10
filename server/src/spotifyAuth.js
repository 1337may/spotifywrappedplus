import crypto from "node:crypto";
import express from "express";

const AUTH_SCOPE = "user-top-read";

export function spotifyAuthRouter({ clientId, clientSecret, redirectUri, clientUrl }) {
  const router = express.Router();

  function basicAuthHeader() {
    return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  async function exchangeCodeForTokens(code) {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader(),
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Spotify token exchange failed: ${response.status}`);
    }
    return response.json();
  }

  async function refreshAccessToken(refreshToken) {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader(),
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Spotify token refresh failed: ${response.status}`);
    }
    return response.json();
  }

  router.get("/login", (req, res) => {
    const state = crypto.randomBytes(16).toString("hex");
    res.cookie("spotify_auth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 5 * 60 * 1000,
    });

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: AUTH_SCOPE,
      redirect_uri: redirectUri,
      state,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
  });

  router.get("/callback", async (req, res) => {
    const { code, state } = req.query;
    const storedState = req.cookies?.spotify_auth_state;
    res.clearCookie("spotify_auth_state");

    if (!state || state !== storedState) {
      return res.redirect(`${clientUrl}/?error=state_mismatch`);
    }
    if (!code) {
      return res.redirect(`${clientUrl}/?error=access_denied`);
    }

    try {
      const tokens = await exchangeCodeForTokens(code);
      const fragment = new URLSearchParams({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: String(tokens.expires_in),
      });
      res.redirect(`${clientUrl}/summary#${fragment.toString()}`);
    } catch (err) {
      console.error("Token exchange failed:", err);
      res.redirect(`${clientUrl}/?error=token_exchange_failed`);
    }
  });

  router.post("/refresh", express.json(), async (req, res) => {
    const refreshToken = req.body?.refresh_token;
    if (!refreshToken) {
      return res.status(400).json({ error: "missing_refresh_token" });
    }

    try {
      const refreshed = await refreshAccessToken(refreshToken);
      res.json(refreshed);
    } catch (err) {
      console.error("Token refresh failed:", err);
      res.status(401).json({ error: "refresh_failed" });
    }
  });

  return router;
}
