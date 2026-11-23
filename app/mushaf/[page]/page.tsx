"use client";
import Title from "@/components/Title";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { useMushafMarks } from "@/lib/mushafMarks";
import { loadBsml, loadPageFont, familyFor, type MushafPage } from "@/lib/mushaf";

const QURAN_API = process.env.NEXT_PUBLIC_QURAN_API_URL;
const RECITER = process.env.NEXT_PUBLIC_QURAN_RECITER_ID;

type Surah = { id: number; nameMal: string; startPage: number };
type State = { page: number; data?: MushafPage; fontOk?: boolean };

export default function MushafReader() {
  const n = Math.min(604, Math.max(1, Number(useParams<{ page: string }>().page) || 1));
  const router = useRouter();
  const [st, setSt] = useState<State | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [jump, setJump] = useState("");
  const { marks, toggle } = useMushafMarks();
  const marked = marks.includes(n);

  useEffect(() => { fetch("/data/surahs.json").then((r) => r.json()).then(setSurahs); }, []);
  useEffect(() => {
    let live = true;
    try { localStorage.setItem("hisaabi.mushaf.page", String(n)); } catch {}
    (async () => {
      const data: MushafPage = await (await fetch(`/data/mushaf/${n}.json`)).json();
      let fontOk = true;
      try { await Promise.all([loadBsml(), loadPageFont(n)]); } catch { fontOk = false; }
      if (live) setSt({ page: n, data, fontOk });
    })();
    // warm the next page's font so turning the page is instant
    if (n < 604) loadPageFont(n + 1).catch(() => {});
    return () => { live = false; };
  }, [n]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "SELECT") return;
      // the Quran reads right to left, so the left arrow goes forward
      if (e.key === "ArrowLeft" && n < 604) router.push(`/mushaf/${n + 1}`);
      if (e.key === "ArrowRight" && n > 1) router.push(`/mushaf/${n - 1}`);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [n, router]);

  const ready = st?.page === n ? st : null;
  // a surah that begins partway down the page owns the heading, otherwise the surah the page opens in
  const headSura = ready?.data?.lines.find((l) => l.l === -1)?.s ?? ready?.data?.sura;
  const sura = surahs.find((s) => s.id === headSura);
  const family = familyFor(n);

  // chapter recitation for the surah this page belongs to
  const suraId = headSura;
  const [audioFor, setAudioFor] = useState<{ sura: number; url: string } | null>(null);
  useEffect(() => {
    if (!suraId) return;
    fetch(`${QURAN_API}/chapter_recitations/${RECITER}/${suraId}`).then((r) => r.json()).then((j) => setAudioFor({ sura: suraId, url: j.audio_file?.audio_url ?? "" })).catch(() => {});
  }, [suraId]);
  const audio = audioFor?.sura === suraId ? audioFor?.url : "";

  return (
    <>
      <Title text={`${sura?.nameMal ?? "Quran"} · page ${n}`} />
      <div className="row" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="h1">{sura?.nameMal ?? "Quran"}</h1>
          <p className="muted">Page {n} of 604{ready?.data ? `, Juz ${ready.data.juz}` : ""}</p>
        </div>
        <div className="mushaf-tools">
          <select className="inp" aria-label="Go to surah" value="" onChange={(e) => { const s = surahs.find((x) => x.id === Number(e.target.value)); if (s) router.push(`/mushaf/${s.startPage}`); }}>
            <option value="">Go to surah</option>
            {surahs.map((s) => <option key={s.id} value={s.id}>{s.id}. {s.nameMal}</option>)}
          </select>
          <button type="button" className={"btn" + (marked ? "" : " ghost")} aria-pressed={marked} onClick={() => toggle(n)}><Bookmark size={16} fill={marked ? "currentColor" : "none"} /> {marked ? "Bookmarked" : "Bookmark"}</button>
          {marks.length > 0 && (
            <select className="inp" aria-label="Bookmarked pages" value="" onChange={(e) => e.target.value && router.push(`/mushaf/${e.target.value}`)}>
              <option value="">Bookmarks ({marks.length})</option>
              {marks.map((m) => <option key={m} value={m}>Page {m}</option>)}
            </select>
          )}
          <form onSubmit={(e) => { e.preventDefault(); const p = Number(jump); if (p >= 1 && p <= 604) { router.push(`/mushaf/${p}`); setJump(""); } }} className="page-jump">
            <input className="inp" aria-label="Go to page" inputMode="numeric" placeholder="Page" value={jump} onChange={(e) => setJump(e.target.value.replace(/\D/g, ""))} />
          </form>
        </div>
      </div>

      {audio && <audio controls src={audio} aria-label="Recitation of this surah" style={{ marginBottom: 16 }} />}

      <div className="mushaf" style={{ containerType: "inline-size" }}>
        {!ready && <p className="muted" style={{ textAlign: "center", padding: 60 }}>Loading page {n}…</p>}
        {ready && !ready.fontOk && (
          <p style={{ textAlign: "center", padding: 40 }}>
            This page&apos;s font couldn&apos;t be loaded. Check your connection and reload, or <Link href="/quran" className="gold">read by surah</Link>.
          </p>
        )}
        {ready?.fontOk && ready.data?.lines.map((ln, i) => {
          if (ln.l <= 0) return (
            <div key={i} className={ln.l === -1 ? "m-head" : "m-bism"} style={{ fontFamily: "QCF_BSML" }}>{ln.t}</div>
          );
          const glyphs = Array.from(ln.t);
          const center = n <= 2 || glyphs.length < 7;
          return (
            <div key={i} className="m-line" style={{ fontFamily: family, justifyContent: center ? "center" : "space-between", gap: center ? "1.4cqw" : 0 }}>
              {glyphs.map((g, k) => <span key={k}>{g}</span>)}
            </div>
          );
        })}
      </div>

      <div className="row" style={{ marginTop: 20 }}>
        <Link className={"btn ghost" + (n >= 604 ? " off" : "")} href={`/mushaf/${Math.min(604, n + 1)}`} aria-label="Next page"><ChevronLeft size={16} /> Next</Link>
        <span className="muted">{n}</span>
        <Link className={"btn" + (n <= 1 ? " off" : "")} href={`/mushaf/${Math.max(1, n - 1)}`} aria-label="Previous page">Previous <ChevronRight size={16} /></Link>
      </div>
    </>
  );
}
