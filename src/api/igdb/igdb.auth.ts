import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || "";
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function fetchToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 10000) {
    return cachedToken;
  }

  const url = `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(
    TWITCH_CLIENT_ID
  )}&client_secret=${encodeURIComponent(
    TWITCH_CLIENT_SECRET
  )}&grant_type=client_credentials`;

  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twitch token fetch error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

export { fetchToken };
