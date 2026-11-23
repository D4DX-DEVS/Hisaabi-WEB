import { NextRequest } from "next/server";

// Feedback and feature requests go through the same email service the mobile app uses.
// The service key stays on the server; the browser only talks to this route.
const BASE = process.env.COMMON_EMAIL_BASE_URL ?? "";
const KEY = process.env.COMMON_EMAIL_API_KEY ?? "";
const BRANDING = { primaryColor: "#7B9215", gradientStart: "#7B9215", gradientEnd: "#5E700F", accentColor: "#4a5a0d" };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const json = (body: unknown, status: number) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function POST(req: NextRequest) {
  const kind = req.nextUrl.pathname.split("/").pop();
  if (kind !== "feedback" && kind !== "feature-request") return json({ error: "Not found" }, 404);
  if (!BASE || !KEY) return json({ error: "Sending is not configured on this server." }, 503);

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ error: "Invalid request." }, 400); }
  if (b.website) return json({ ok: true }, 200); // hidden field, only bots fill it

  const common = { appName: "Hisabi", name: str(b.name, 100), email: str(b.email, 200), phone: str(b.phone, 30), source: "web", branding: BRANDING };
  if (!common.name) return json({ error: "Name is required." }, 400);
  if (!EMAIL.test(common.email)) return json({ error: "Enter a valid email address." }, 400);
  const digits = common.phone.replace(/\D/g, "");
  if (digits.length < 5 || digits.length > 15) return json({ error: "Enter a valid phone number." }, 400);

  let payload: Record<string, unknown>;
  if (kind === "feedback") {
    const message = str(b.message, 4000), platform = str(b.platform, 40), rating = str(b.rating, 20);
    if (!message) return json({ error: "Feedback message is required." }, 400);
    if (!["excellent", "good", "average", "poor"].includes(rating)) return json({ error: "Please select a rating." }, 400);
    if (!platform) return json({ error: "Please select at least one option." }, 400);
    payload = { ...common, platform, rating, message };
  } else {
    const title = str(b.title, 150), description = str(b.description, 4000), target = str(b.target_platform, 20), category = str(b.category, 30);
    if (!title || !description) return json({ error: "Title and description are required." }, 400);
    if (!["android", "ios", "both"].includes(target) || !["ui_ux", "content", "performance", "accessibility", "other"].includes(category)) return json({ error: "Choose a platform and a category." }, 400);
    payload = { ...common, target_platform: target, category, title, description };
  }

  try {
    const r = await fetch(`${BASE}/send-${kind}`, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": KEY }, body: JSON.stringify(payload), signal: AbortSignal.timeout(30000) });
    if (r.status === 200 || r.status === 201) return json({ ok: true }, 200);
    if (r.status === 429) return json({ error: "Too many submissions. Please try again later." }, 429);
    return json({ error: "Couldn't send right now. Please try again." }, 502);
  } catch {
    return json({ error: "Couldn't reach the server. Check your connection and try again." }, 502);
  }
}
