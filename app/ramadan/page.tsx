"use client";
import { tidy } from "@/lib/text";
import Loading from "@/components/Loading";
import PageHead from "@/components/PageHead";
import { useState } from "react";
import Gate from "@/components/Gate";
import { items, useApi } from "@/lib/api";
import Tx from "@/components/Tx";
import { pick, pickField, useLang } from "@/lib/lang";

type R = { _id?: string; title?: string; title_malayalam?: string; arabic_text?: string; count?: number; malayalam?: string; english?: string };

function Body() {
  const { lang } = useLang();
  const [day, setDay] = useState(1);
  const { data, loading, error } = useApi<unknown>(`/content/ramadan-duas?page=1&limit=50&day=${day}`);
  return (
    <>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
          <button key={d} className={"btn" + (d === day ? "" : " ghost")} style={{ padding: "6px 12px" }} onClick={() => setDay(d)}>{d}</button>
        ))}
      </div>
      {loading && <Loading />}
      {error && <p style={{ color: "#ff6b60" }}>{error}</p>}
      {!loading && !error && items<R>(data, "ramadan_duas").length === 0 && <p className="muted">No duas for day {day}.</p>}
      {items<R>(data, "ramadan_duas").map((d, i) => (
        <div key={d._id ?? i} className="card" style={{ marginBottom: 12 }}>
          <div className="row"><b className="lime">{pickField(lang, d as unknown as Record<string, unknown>, "title")}</b>{d.count ? <span className="gold">×{d.count}</span> : null}</div>
          {d.arabic_text && <p className="ar" style={{ fontSize: "1.6rem", margin: "8px 0", whiteSpace: "pre-line" }}>{tidy(d.arabic_text)}</p>}
          <Tx text={pick(lang, d)} />
        </div>
      ))}
    </>
  );
}

export default function Ramadan() {
  return (
    <>
      <PageHead lang scene="moon" title="Ramadan" sub="Duas for each day of the blessed month" />
      <Gate><Body /></Gate>
    </>
  );
}
