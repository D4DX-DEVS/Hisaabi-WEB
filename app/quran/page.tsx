"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import Medal from "@/components/Medal";
import PageHead from "@/components/PageHead";

type Surah = { id: number; nameMal: string; ayas: number; startPage: number; makki: boolean };
type Juz = { juz: number; page: number };

/** The Quran is read as Mushaf pages, as in the mobile app. This page is the index: by surah or by juz. */
export default function Quran() {
  const [list, setList] = useState<Surah[]>([]);
  const [juz, setJuz] = useState<Juz[]>([]);
  const [tab, setTab] = useState<"surah" | "juz">("surah");
  const [q, setQ] = useState("");
  const [last] = useState<number>(() => { try { return Number(localStorage.getItem("hisaabi.mushaf.page")) || 0; } catch { return 0; } });
  useEffect(() => {
    fetch("/data/surahs.json").then((r) => r.json()).then(setList);
    fetch("/data/juz.json").then((r) => r.json()).then(setJuz);
  }, []);
  const f = list.filter((s) => !q || String(s.id) === q || s.nameMal.includes(q));
  return (
    <>
      <PageHead scene="mushaf" title="Quran" sub="Read the Mushaf page by page, with recitation audio." />
      <Link href={`/mushaf/${last || 1}`} className="card" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <BookOpen size={22} color="var(--gold)" style={{ flexShrink: 0 }} />
        <div><b>{last ? "Continue reading" : "Start reading"}</b><div className="muted" style={{ fontSize: ".85rem" }}>{last ? `Page ${last} of 604` : "Open the first page"}</div></div>
      </Link>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }} role="tablist" aria-label="Index">
        <button role="tab" aria-selected={tab === "surah"} className={"btn" + (tab === "surah" ? "" : " ghost")} onClick={() => setTab("surah")}>Surah</button>
        <button role="tab" aria-selected={tab === "juz"} className={"btn" + (tab === "juz" ? "" : " ghost")} onClick={() => setTab("juz")}>Juz</button>
      </div>
      {tab === "surah" ? (
        <>
          <input className="inp" aria-label="Search surah" placeholder="Search surah number or name" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 16 }} />
          {list.length > 0 && f.length === 0 && <p className="muted">No surah matches &quot;{q}&quot;.</p>}
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }}>
            {f.map((s) => (
              <Link key={s.id} href={`/mushaf/${s.startPage}`} className="card">
                <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
                  <Medal n={s.id} />
                  <div style={{ minWidth: 0 }}>
                    <div className="ml" style={{ fontSize: "1rem" }}>{s.nameMal}</div>
                    <div className="muted" style={{ fontSize: ".82rem" }}>{s.makki ? "Makki" : "Madani"}, {s.ayas} ayahs, page {s.startPage}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
          {juz.map((j) => (
            <Link key={j.juz} href={`/mushaf/${j.page}`} className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Medal n={j.juz} />
              <div><b>Juz {j.juz}</b><div className="muted" style={{ fontSize: ".82rem" }}>page {j.page}</div></div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
