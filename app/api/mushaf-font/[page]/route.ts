import { NextRequest } from "next/server";
import { unzipSync } from "fflate";
import zips from "@/lib/fontZips.json";

// Page fonts come from the same font packs the mobile app downloads (2 pages per zip).
// Each pack is fetched once, unzipped, and every font in it is stored in the edge cache (works on Cloudflare Workers).
const PACK_BASE = process.env.MUSHAF_FONT_PACK_URL!;
const FONT_HEADERS = { "Content-Type": "font/ttf", "Cache-Control": "public, max-age=31536000, immutable" };
const inflight = new Map<string, Promise<Record<string, Uint8Array>>>();

async function packFonts(zip: string) {
  let job = inflight.get(zip);
  if (!job) {
    job = (async () => {
      const res = await fetch(`${PACK_BASE}${zip}.zip`, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`font pack ${zip}: ${res.status}`);
      const files = unzipSync(new Uint8Array(await res.arrayBuffer()), { filter: (f) => /^QCF_P\d{3}\.ttf$/i.test(f.name) });
      const out: Record<string, Uint8Array> = {};
      for (const [name, data] of Object.entries(files)) out[name.toUpperCase()] = data;
      return out;
    })().finally(() => inflight.delete(zip));
    inflight.set(zip, job);
  }
  return job;
}

// the Cache API exists on Workers; locally (next dev) it may not, so caching is skipped there
const edge = () => (typeof caches !== "undefined" ? (caches as unknown as { default?: Cache }).default : undefined);
const keyFor = (req: NextRequest, name: string) => new Request(new URL(`/__fontcache/${name}`, req.nextUrl.origin));

export async function GET(req: NextRequest) {
  const n = Number(req.nextUrl.pathname.split("/").pop());
  if (!Number.isInteger(n) || n < 3 || n > 604) return new Response("Not found", { status: 404 });
  const zip = (zips as Record<string, string>)[n];
  if (!/^f\d+$/.test(zip ?? "") || zip === "f0") return new Response("No font pack for this page", { status: 404 });

  const name = `QCF_P${String(n).padStart(3, "0")}.TTF`;
  const cache = edge();
  const hit = await cache?.match(keyFor(req, name));
  if (hit) return hit;

  try {
    const fonts = await packFonts(zip);
    const data = fonts[name];
    if (!data) return new Response("Font missing from pack", { status: 404 });
    if (cache) await Promise.all(Object.entries(fonts).map(([fname, d]) => cache.put(keyFor(req, fname), new Response(new Uint8Array(d), { headers: FONT_HEADERS })).catch(() => {})));
    return new Response(new Uint8Array(data), { headers: FONT_HEADERS });
  } catch {
    return new Response("Font pack unavailable", { status: 502 });
  }
}
