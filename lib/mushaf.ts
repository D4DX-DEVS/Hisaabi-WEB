"use client";

// Pages whose fonts ship with the app. 566 is the repaired font, which must be used instead of the pack's broken one.
const BUNDLED: Record<number, string> = { 1: "QCF_P1.TTF", 2: "QCF_P2.TTF", 305: "QCF_P305.ttf", 566: "QCF_P566.ttf", 603: "QCF_P603.TTF", 604: "QCF_P604.TTF" };
export const familyFor = (p: number) => `QCF_P${String(p).padStart(3, "0")}`;
const urlFor = (p: number) => (BUNDLED[p] ? `/fonts/mushaf/${BUNDLED[p]}` : `/api/mushaf-font/${p}`);

const loaded = new Map<string, Promise<void>>();
function load(family: string, url: string) {
  let job = loaded.get(family);
  if (!job) {
    job = new FontFace(family, `url(${url})`).load().then((f) => { document.fonts.add(f); });
    job.catch(() => loaded.delete(family)); // allow a retry later
    loaded.set(family, job);
  }
  return job;
}
export const loadBsml = () => load("QCF_BSML", "/fonts/mushaf/QCF_BSML.TTF");
export const loadPageFont = (p: number) => load(familyFor(p), urlFor(p));

export type MushafLine = { s: number; l: number; t: string };
export type MushafPage = { page: number; sura: number; juz: number; zip: string; lines: MushafLine[] };
