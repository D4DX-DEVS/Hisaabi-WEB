import { NextRequest } from "next/server";

// Forwards browser calls to the Hisaabi backend so the browser never hits CORS.
const BASE = process.env.BACKEND_URL ?? "https://hisaabi-vtw9k.ondigitalocean.app/api";

// Writes are limited to what the web app needs, so the proxy can never be used to hit e.g. account deletion.
const WRITES = new Set(["POST /auth/login", "POST /ai-assistant/chat", "PUT /user/settings", "PUT /user/profile"]);

async function forward(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/^\/api\/proxy/, "");
  if (req.method !== "GET" && !WRITES.has(`${req.method} ${path}`)) return new Response(JSON.stringify({ error: "Not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const auth = req.headers.get("authorization");
  if (auth) headers.Authorization = auth;
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const res = await fetch(BASE + path + req.nextUrl.search, {
    method: req.method,
    headers,
    body: hasBody ? await req.text() : undefined,
    cache: "no-store",
  });
  return new Response(await res.text(), { status: res.status, headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" } });
}

export { forward as GET, forward as POST, forward as PUT, forward as DELETE };
