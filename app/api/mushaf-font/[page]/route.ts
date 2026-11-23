import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { unzipSync } from "fflate";

// Page fonts come from the same font packs the mobile app downloads (2 pages per zip).
// They are fetched once, extracted, cached on disk, and served from our own origin.
const PACK_BASE = process.env.MUSHAF_FONT_PACK_URL ?? "http://lalithasaram.net/downloads/qfonts/";
const CACHE = process.env.MUSHAF_FONT_CACHE_DIR || path.join(os.tmpdir(), "hisaabi-mushaf-fonts");
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

export async function GET(req: NextRequest) {
  const n = Number(req.nextUrl.pathname.split("/").pop());
  if (!Number.isInteger(n) || n < 3 || n > 604) return new Response("Not found", { status: 404 });
  const name = `QCF_P${String(n).padStart(3, "0")}.TTF`;
  const cached = path.join(CACHE, name);
  try { return new Response(new Uint8Array(await fs.readFile(cached)), { headers: FONT_HEADERS }); } catch {}

  try {
    const meta = JSON.parse(await fs.readFile(path.join(process.cwd(), "public", "data", "mushaf", `${n}.json`), "utf8"));
    if (!/^f\d+$/.test(meta.zip) || meta.zip === "f0") return new Response("No font pack for this page", { status: 404 });
    const fonts = await packFonts(meta.zip);
    await fs.mkdir(CACHE, { recursive: true });
    for (const [fname, data] of Object.entries(fonts)) await fs.writeFile(path.join(CACHE, fname), data).catch(() => {});
    const data = fonts[name];
    if (!data) return new Response("Font missing from pack", { status: 404 });
    return new Response(new Uint8Array(data), { headers: FONT_HEADERS });
  } catch {
    return new Response("Font pack unavailable", { status: 502 });
  }
}
