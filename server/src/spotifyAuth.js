import crypto from "node:crypto";
import express from "express";

const AUTH_SCOPE = "user-top-read";
const CREDS_COOKIE = "spotify_app_creds";

export function spotifyAuthRouter({ redirectUri, clientUrl }) {
  const router = express.Router();

  function basicAuthHeader(clientId, clientSecret) {
    return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  }

  async function exchangeCodeForTokens(code, clientId, clientSecret) {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader(clientId, clientSecret),
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Spotify token exchange failed: ${response.status}`);
    }
    return response.json();
  }

  async function refreshAccessToken(refreshToken, clientId, clientSecret) {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: basicAuthHeader(clientId, clientSecret),
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Spotify token refresh failed: ${response.status}`);
    }
    return response.json();
  }

  router.post("/login", express.urlencoded({ extended: false }), (req, res) => {
    const clientId = req.body?.client_id?.trim();
    const clientSecret = req.body?.client_secret?.trim();
    if (!clientId || !clientSecret) {
      return res.redirect(`${clientUrl}/?error=missing_credentials`);
    }

    const state = crypto.randomBytes(16).toString("hex");
    res.cookie("spotify_auth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });
    res.cookie(CREDS_COOKIE, JSON.stringify({ clientId, clientSecret }), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
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
    const storedCreds = req.cookies?.[CREDS_COOKIE];
    res.clearCookie("spotify_auth_state");
    res.clearCookie(CREDS_COOKIE);

    if (!state || state !== storedState) {
      return res.redirect(`${clientUrl}/?error=state_mismatch`);
    }
    if (!code) {
      return res.redirect(`${clientUrl}/?error=access_denied`);
    }
    if (!storedCreds) {
      return res.redirect(`${clientUrl}/?error=missing_credentials`);
    }

    const { clientId, clientSecret } = JSON.parse(storedCreds);

    try {
      const tokens = await exchangeCodeForTokens(code, clientId, clientSecret);
      const fragment = new URLSearchParams({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: String(tokens.expires_in),
        client_id: clientId,
        client_secret: clientSecret,
      });
      res.redirect(`${clientUrl}/summary#${fragment.toString()}`);
    } catch (err) {
      console.error("Token exchange failed:", err);
      res.redirect(`${clientUrl}/?error=token_exchange_failed`);
    }
  });

  router.post("/refresh", express.json(), async (req, res) => {
    const { refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret } = req.body ?? {};
    if (!refreshToken || !clientId || !clientSecret) {
      return res.status(400).json({ error: "missing_fields" });
    }

    try {
      const refreshed = await refreshAccessToken(refreshToken, clientId, clientSecret);
      res.json(refreshed);
    } catch (err) {
      console.error("Token refresh failed:", err);
      res.status(401).json({ error: "refresh_failed" });
    }
  });

  return router;
}
