const STORAGE_KEY = "spotify_tokens";

function getStoredTokens() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function storeTokens(tokens) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function isAuthenticated() {
  return Boolean(getStoredTokens());
}

export function logout() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function consumeTokensFromUrlHash() {
  if (!window.location.hash) return;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get("access_token");
  if (!accessToken) return;

  storeTokens({
    accessToken,
    refreshToken: params.get("refresh_token"),
    expiresAt: Date.now() + Number(params.get("expires_in")) * 1000,
    clientId: params.get("client_id"),
    clientSecret: params.get("client_secret"),
  });
  window.history.replaceState(null, "", window.location.pathname);
}

async function getValidAccessToken() {
  const tokens = getStoredTokens();
  if (!tokens) return null;
  if (Date.now() < tokens.expiresAt - 10_000) {
    return tokens.accessToken;
  }

  const res = await fetch("/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh_token: tokens.refreshToken,
      client_id: tokens.clientId,
      client_secret: tokens.clientSecret,
    }),
  });
  if (!res.ok) {
    logout();
    return null;
  }

  const refreshed = await res.json();
  storeTokens({
    ...tokens,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token ?? tokens.refreshToken,
    expiresAt: Date.now() + refreshed.expires_in * 1000,
  });
  return refreshed.access_token;
}

async function spotifyGet(accessToken, path) {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = new Error("spotify_api_error");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function getSummary(range) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    const err = new Error("not_authenticated");
    err.status = 401;
    throw err;
  }

  const [tracksData, artistsData, profile] = await Promise.all([
    spotifyGet(accessToken, `/me/top/tracks?time_range=${range}&limit=50`),
    spotifyGet(accessToken, `/me/top/artists?time_range=${range}&limit=50`),
    spotifyGet(accessToken, "/me"),
  ]);

  return buildSummary(tracksData, artistsData, profile);
}

function buildSummary(tracksData, artistsData, profile) {
  const topTracks = tracksData.items.map((track) => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map((a) => a.name).join(", "),
    albumImage: track.album?.images?.[2]?.url ?? track.album?.images?.[0]?.url ?? null,
    url: track.external_urls?.spotify ?? null,
  }));

  const topArtists = artistsData.items.map((artist) => ({
    id: artist.id,
    name: artist.name,
    image: artist.images?.[2]?.url ?? artist.images?.[0]?.url ?? null,
    url: artist.external_urls?.spotify ?? null,
  }));

  const uniqueArtistIds = new Set(tracksData.items.flatMap((t) => t.artists.map((a) => a.id)));
  const explicitCount = tracksData.items.filter((t) => t.explicit).length;

  const stats = {
    uniqueArtistsCount: uniqueArtistIds.size,
    explicitPercent: tracksData.items.length
      ? Math.round((explicitCount / tracksData.items.length) * 100)
      : 0,
  };

  return {
    topTracks,
    topArtists,
    stats,
    profile: {
      displayName: profile.display_name ?? null,
      image: profile.images?.[0]?.url ?? null,
    },
  };
}
