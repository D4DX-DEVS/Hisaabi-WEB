"use client";
import PageHead from "@/components/PageHead";
import { useMemo, useState } from "react";

const hijri = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", o).format(d);
const EVENTS: Record<string, string> = {
  "1-1": "Islamic New Year", "1-10": "Day of Ashura", "3-12": "Mawlid an-Nabi", "7-27": "Isra and Mi'raj",
  "8-15": "Mid-Sha'ban", "9-1": "First day of Ramadan", "9-27": "Laylat al-Qadr (likely)", "10-1": "Eid al-Fitr", "12-9": "Day of Arafah", "12-10": "Eid al-Adha",
};

export default function Calendar() {
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const days = useMemo(() => {
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: last }, (_, i) => {
      const d = new Date(month.getFullYear(), month.getMonth(), i + 1);
      const [m, dd] = [hijri(d, { month: "numeric" }), hijri(d, { day: "numeric" })];
      return { d, g: i + 1, h: dd, ev: EVENTS[`${m}-${dd}`] };
    });
  }, [month]);
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1)); // functional, so quick repeated clicks all count
  const today = new Date().toDateString();
  return (
    <>
      <PageHead scene="moon" title="Islamic calendar" sub={`Today: ${hijri(new Date(), { day: "numeric", month: "long", year: "numeric" })}. Umm al-Qura dates can differ by a day locally.`} />
      <div className="row" style={{ marginBottom: 14 }}>
        <button className="btn ghost" onClick={() => shift(-1)}>←</button>
        <b>{month.toLocaleString("en", { month: "long", year: "numeric" })}</b>
        <button className="btn ghost" onClick={() => shift(1)}>→</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((x) => <div key={x} className="muted" style={{ textAlign: "center" }}>{x}</div>)}
        {Array.from({ length: month.getDay() }, (_, i) => <div key={"e" + i} />)}
        {days.map((x) => (
          <div key={x.g} className="card" style={{ padding: 8, textAlign: "center", borderColor: x.d.toDateString() === today ? "var(--lime)" : undefined, background: x.ev ? "rgba(255,211,105,.15)" : undefined }}>
            <div>{x.g}</div><div className="lime" style={{ fontSize: ".75rem" }}>{x.h}</div>
          </div>
        ))}
      </div>
      <h2 style={{ margin: "22px 0 8px", fontWeight: 600 }}>Events this month</h2>
      {days.filter((x) => x.ev).map((x) => <div key={x.g} className="pr"><span>{x.ev}</span><span className="muted">{x.d.toDateString()}</span></div>)}
      {!days.some((x) => x.ev) && <p className="muted">No major events.</p>}
    </>
  );
}
