import { createServer } from "node:http";
import { randomBytes } from "node:crypto";

const PORT = 8888;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
const SCOPE = "user-top-read";

const id = process.env.SPOTIFY_CLIENT_ID;
const secret = process.env.SPOTIFY_CLIENT_SECRET;
if (!id || !secret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first, then run this again.");
  process.exit(1);
}

const state = randomBytes(12).toString("hex");
const url = `https://accounts.spotify.com/authorize?${new URLSearchParams({ client_id: id, response_type: "code", redirect_uri: REDIRECT, scope: SCOPE, state })}`;

const server = createServer(async (req, res) => {
  const q = new URL(req.url, REDIRECT).searchParams;
  if (!req.url.startsWith("/callback")) return res.writeHead(404).end();
  if (q.get("state") !== state || !q.get("code")) {
    res.writeHead(400).end("Something went wrong. Close this tab and run the script again.");
    return;
  }
  try {
    const r = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "authorization_code", code: q.get("code"), redirect_uri: REDIRECT }),
    });
    const data = await r.json();
    if (!r.ok || !data.refresh_token) throw new Error(data.error_description || data.error || `status ${r.status}`);
    res.writeHead(200, { "Content-Type": "text/plain" }).end("Done. You can close this tab and go back to the terminal.");
    console.log("\nSPOTIFY_REFRESH_TOKEN=" + data.refresh_token + "\n");
    console.log("Add it to Vercel with SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET, then redeploy.");
  } catch (e) {
    res.writeHead(500).end("Spotify said no: " + e.message);
    console.error("Spotify said no:", e.message);
  } finally {
    server.close();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Add this redirect URI to your Spotify app: ${REDIRECT}`);
  console.log("\nThen open this link and click Agree:\n");
  console.log(url + "\n");
});
