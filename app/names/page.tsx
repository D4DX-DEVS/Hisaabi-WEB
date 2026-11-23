"use client";
import { useEffect, useState } from "react";
import Medal from "@/components/Medal";
import PageHead from "@/components/PageHead";
import { firstArray, useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { pick, useLang } from "@/lib/lang";

type Name = { ar: string; translit?: string; meaning: { english?: string; malayalam?: string; urdu?: string }; note?: string };
type Static = { english_name: string; arabic_name: string; english_meaning: string };
type Remote = { name: string; english_meaning?: string; malayalam_meaning?: string; urdu_meaning?: string; description?: string; order?: number };

export default function Names() {
  const { token } = useAuth();
  const { lang } = useLang();
  const [fallback, setFallback] = useState<Static[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { fetch("/data/99names.json").then((r) => r.json()).then(setFallback); }, []);
  // signed in: names with Malayalam and Urdu meanings from your account; otherwise the bundled English list
  const remote = useApi<unknown>(token ? "/content/names-of-allah?page=1&limit=120" : null);
  const fromServer = firstArray<Remote>(remote.data).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const names: Name[] = fromServer.length
    ? fromServer.map((n) => ({ ar: n.name, meaning: { english: n.english_meaning, malayalam: n.malayalam_meaning, urdu: n.urdu_meaning }, note: n.description?.replace(/^Dua benefits:\s*/i, "") }))
    : fallback.map((n) => ({ ar: n.arabic_name, translit: n.english_name, meaning: { english: n.english_meaning } }));
  const f = names.map((n, i) => ({ ...n, i: i + 1 })).filter((n) => !q || n.ar.includes(q) || (n.translit ?? "").toLowerCase().includes(q.toLowerCase()) || pick(lang, n.meaning).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHead lang scene="star" title="99 Names of Allah" sub="Asmaul Husna" />
      <audio controls src="/namesOfAllah.mp3" />
      <input className="inp" aria-label="Search names" placeholder="Search names" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 16 }} />
      {names.length > 0 && f.length === 0 && <p className="muted">No name matches &quot;{q}&quot;.</p>}
      <div className="grid">
        {f.map((n) => (
          <div key={n.i} className="card" style={{ textAlign: "center" }}>
            <div style={{ display: "grid", placeItems: "center" }}><Medal n={n.i} /></div>
            <div className="ar gold" style={{ fontSize: "2.4rem", lineHeight: 1.6 }}>{n.ar}</div>
            {n.translit && <b className="display" style={{ fontSize: "1.3rem" }}>{n.translit}</b>}
            <p className={lang === "urdu" ? "ur muted" : "muted"} dir={lang === "urdu" ? "rtl" : undefined}>{pick(lang, n.meaning)}</p>
            {n.note && <p className="muted" style={{ fontSize: ".8rem", marginTop: 8, whiteSpace: "pre-line" }}>{n.note}</p>}
          </div>
        ))}
      </div>
    </>
  );
}
