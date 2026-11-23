"use client";
import { tidy } from "@/lib/text";
import Loading from "@/components/Loading";
import { useState } from "react";
import Gate from "@/components/Gate";
import Html from "@/components/Html";
import PageHead from "@/components/PageHead";
import { firstArray, useApi } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";

type Tr = { english?: string; malayalam?: string; urdu?: string };
type Item = { id?: string; _id?: string; title?: Tr; description?: Tr; verse?: string; source?: string };
const TABS = [["verse-importance", "Quran and Sunnah"], ["dhikr-importance", "Dhikr"], ["dua-importance", "Dua"]] as const;

function Body() {
  const { lang } = useLang();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>(TABS[0][0]);
  const { data, loading, error } = useApi<unknown>(`/content/${tab}?page=1&limit=50`);
  const list = firstArray<Item>(data);
  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {TABS.map(([k, l]) => <button key={k} className={"btn" + (tab === k ? "" : " ghost")} onClick={() => setTab(k)}>{l}</button>)}
      </div>
      {loading && <Loading />}
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      {!loading && !error && list.length === 0 && <p className="muted">Nothing here yet.</p>}
      {list.map((it, i) => (
        <article key={it.id ?? it._id ?? i} className="card" style={{ marginBottom: 14 }}>
          <h2 className={"display" + (lang === "urdu" ? " ur" : "")} dir={lang === "urdu" ? "rtl" : undefined} style={{ fontSize: "1.4rem", marginBottom: 10 }}>{pick(lang, it.title)}</h2>
          {it.verse?.trim() && <p className="ar gold" style={{ fontSize: "1.6rem", whiteSpace: "pre-line" }}>{tidy(it.verse)}</p>}
          <Html html={pick(lang, it.description)} />
          {it.source?.trim() && <p className="muted" style={{ fontSize: ".85rem" }}>Source: {it.source.trim()}</p>}
        </article>
      ))}
    </>
  );
}

export default function Importance() {
  return (
    <>
      <PageHead lang scene="arch" title="Importance" sub="Why the Quran, dhikr and dua matter." />
      <Gate><Body /></Gate>
    </>
  );
}
