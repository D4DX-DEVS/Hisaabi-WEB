"use client";
import { tidy } from "@/lib/text";
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import PageHead from "@/components/PageHead";
import Tx from "@/components/Tx";
import { firstArray, items, useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { pick, pickField, useLang } from "@/lib/lang";

type Doc = { sections: { repetitions: number; prayers: { arabic: string; description?: string; reference?: string }[] }[] };
type Cat = { _id: string; name: string; display_name?: string; display_name_malayalam?: string; display_name_urdu?: string; parent?: string | null };
type Dhikr = { _id: string; name?: string; arabic_text?: string; count?: number; malayalam?: string; english?: string; urdu?: string };
const STATIC = [["morning_prayer", "Morning"], ["evening_prayer", "Evening"], ["after_salah", "After salah"]] as const;

/** Tap-to-count chip for one dhikr; the count only lives on this page. */
function Counter({ target }: { target?: number }) {
  const [n, setN] = useState(0);
  if (!target || target < 2) return target ? <span className="gold">×{target}</span> : null;
  const done = n >= target;
  return <button className={"btn sm" + (done ? "" : " ghost")} onClick={() => setN(done ? 0 : n + 1)} aria-label={`Count, ${n} of ${target}`}>{done ? "Done ✓" : `${n} / ${target}`}</button>;
}

function Server({ catId }: { catId: string }) {
  const { lang } = useLang();
  const { data, loading, error } = useApi<unknown>(`/content/dhikr-types?page=1&limit=100&category=${catId}`);
  const list = items<Dhikr>(data, "dhikr_types");
  return (
    <>
      {loading && <Loading />}
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      {list.map((d) => (
        <div key={d._id} className="card" style={{ marginBottom: 12 }}>
          <div className="row"><b className="lime">{d.name}</b><Counter target={d.count} /></div>
          <p className="ar" style={{ fontSize: "1.5rem", margin: "8px 0", whiteSpace: "pre-line" }}>{tidy(d.arabic_text)}</p>
          <Tx text={pick(lang, d)} />
        </div>
      ))}
    </>
  );
}

function Local({ file }: { file: string }) {
  const [docs, setDocs] = useState<Record<string, Doc>>({});
  useEffect(() => { fetch(`/data/${file}.json`).then((r) => r.json()).then((d) => setDocs((p) => ({ ...p, [file]: d }))); }, [file]);
  return (
    <>
      {docs[file]?.sections.map((s, i) => s.prayers.map((p, j) => (
        <div key={`${i}-${j}`} className="card" style={{ marginBottom: 12 }}>
          <div className="row"><b className="lime">{p.description}</b><Counter target={s.repetitions} /></div>
          <p className="ar" style={{ fontSize: "1.5rem", margin: "8px 0", whiteSpace: "pre-line" }}>{tidy(p.arabic)}</p>
          {p.reference && <div className="muted">{p.reference}</div>}
        </div>
      )))}
    </>
  );
}

export default function Adhkar() {
  const { token } = useAuth();
  const { lang } = useLang();
  const cats = useApi<unknown>(token ? "/content/dhikr-categories?page=1&limit=50" : null);
  const children = firstArray<Cat>(cats.data).filter((c) => c.parent).sort((x, y) => Number(/morning/i.test(y.name)) - Number(/morning/i.test(x.name)));
  // signed in: the lists from your account; after-salah stays on the bundled list
  const tabs = [...children.map((c) => ({ key: `s:${c._id}`, label: pickField(lang, c as unknown as Record<string, unknown>, "display_name") || c.name })), ...(children.length ? [{ key: "l:after_salah", label: "After salah" }] : STATIC.map(([k, l]) => ({ key: `l:${k}`, label: l })))];
  const [picked, setPicked] = useState("");
  const tab = tabs.some((t) => t.key === picked) ? picked : tabs[0].key;
  return (
    <>
      <PageHead lang scene="lantern" title="Adhkar" sub={token ? "Morning, evening and after-prayer remembrance. Tap a counter as you recite." : "Sign in to load the full adhkar from your account."} />
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {tabs.map((t) => <button key={t.key} className={"btn" + (tab === t.key ? "" : " ghost")} onClick={() => setPicked(t.key)}>{t.label}</button>)}
      </div>
      {tab.startsWith("s:") ? <Server key={tab} catId={tab.slice(2)} /> : <Local key={tab} file={tab.slice(2)} />}
    </>
  );
}
