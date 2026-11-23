"use client";
import Loading from "@/components/Loading";
import { useState } from "react";
import { Share2 } from "lucide-react";
import Gate from "@/components/Gate";
import PageHead from "@/components/PageHead";
import SaveBtn from "@/components/SaveBtn";
import Tx from "@/components/Tx";
import { items, useApi } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";

type Q = { _id?: string; text?: string; english?: string; malayalam?: string; urdu?: string; author?: string; source?: string };

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

function ShareBtn({ q, text }: { q: Q; text: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const body = [q.text?.trim(), text].filter(Boolean).join("\n\n");
    try {
      if (navigator.share) await navigator.share({ text: body });
      else { await navigator.clipboard.writeText(body); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* the share sheet was dismissed */ }
  }
  return <button className="btn ghost sm" onClick={share}><Share2 size={14} /> {copied ? "Copied" : "Share"}</button>;
}

function QuoteCard({ q, id, label }: { q: Q; id: string; label?: string }) {
  const { lang } = useLang();
  const tr = pick(lang, { english: q.english, malayalam: q.malayalam, urdu: q.urdu });
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      {label && <div className="gold" style={{ fontSize: ".85rem", marginBottom: 8 }}>{label}</div>}
      {q.text && <p className="ar" style={{ fontSize: "1.5rem" }}>{q.text}</p>}
      <Tx text={tr} />
      {(q.author || q.source) && <div className="gold" style={{ fontSize: ".85rem", marginTop: 6 }}>{q.author || q.source}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <SaveBtn item={{ key: "quote:" + id, kind: "quote", arabic: q.text, malayalam: q.malayalam, english: q.english }} />
        <ShareBtn q={q} text={tr} />
      </div>
    </div>
  );
}

function Body() {
  const [date, setDate] = useState(today);
  const friday = useApi<{ friday_quote?: Q | null }>(`/content/friday-quotes/today?date=${today()}`);
  const day = useApi<unknown>(`/content/daily-quotes?page=1&limit=1&date=${date}`);
  const all = useApi<unknown>("/content/daily-quotes?page=1&limit=30");
  const fq = friday.data?.friday_quote;
  const dq = items<Q>(day.data, "daily_quotes")[0];
  return (
    <>
      {fq && <QuoteCard q={fq} id={fq._id ?? "friday"} label="Friday reminder" />}

      <div className="row" style={{ margin: "8px 0 14px", flexWrap: "wrap" }}>
        <h2 className="display" style={{ fontSize: "1.4rem" }}>Quote for</h2>
        <input className="inp" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Quote date" style={{ width: 190 }} />
      </div>
      {day.loading && <Loading />}
      {!day.loading && !dq && <p className="muted" style={{ marginBottom: 12 }}>No quote is set for this date.</p>}
      {dq && <QuoteCard q={dq} id={dq._id ?? date} />}

      <h2 className="display" style={{ fontSize: "1.4rem", margin: "26px 0 14px" }}>More quotes</h2>
      {all.loading && <Loading />}
      {all.error && <p style={{ color: "var(--danger)" }}>{all.error}</p>}
      {items<Q>(all.data, "daily_quotes").map((q, i) => <QuoteCard key={q._id ?? i} q={q} id={q._id ?? String(i)} />)}
    </>
  );
}

export default function Quotes() {
  return (
    <>
      <PageHead lang scene="moon" title="Quotes" sub="Daily reminders to save and share." />
      <Gate><Body /></Gate>
    </>
  );
}
