"use client";
import { useEffect, useState } from "react";
import PageHead from "@/components/PageHead";
import SunDial from "@/components/SunDial";
import { METHODS, dayView, fmt, usePrayerSettings } from "@/lib/prayer";

export default function Prayer() {
  const { s, update, loc, setLoc, err } = usePrayerSettings();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  if (!loc) return (
    <>
      <PageHead scene="mosque" title="Prayer times" sub={err || "Finding your location…"} />
      {err && (
        <form className="card" style={{ display: "grid", gap: 12, maxWidth: 380 }}
          onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); const lat = Number(f.get("lat")), lon = Number(f.get("lon")); if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) setLoc({ lat, lon }); }}>
          <b className="display" style={{ fontSize: "1.3rem" }}>Enter coordinates</b>
          <input className="inp" name="lat" type="number" step="any" placeholder="Latitude, for example 11.25" required />
          <input className="inp" name="lon" type="number" step="any" placeholder="Longitude, for example 75.78" required />
          <button className="btn">Use this location</button>
        </form>
      )}
    </>
  );

  const v = dayView(loc, s, now);
  const rows = [["Fajr", v.times[0].at], ["Sunrise", v.sunrise], ...v.times.slice(1).map((t) => [t.name, t.at] as [string, Date])] as [string, Date][];
  return (
    <>
      <PageHead scene="mosque" title="Prayer times" sub={`${now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}, at ${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)}`} />
      <div style={{ display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "start" }}>
        <div style={{ display: "grid", placeItems: "center" }}><SunDial times={v.times} now={now} next={v.next} remaining={v.remaining} /></div>
        <div>
          {rows.map(([n, d]) => <div key={n} className={"pr" + (n === v.next ? " on" : "")}><span>{n}</span><span>{fmt(d)}</span></div>)}
          <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
            <label>Calculation method
              <select className="inp" value={s.method} onChange={(e) => update({ ...s, method: e.target.value as typeof s.method })}>
                {METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </label>
            <label>Asr
              <select className="inp" value={s.hanafi ? "h" : "s"} onChange={(e) => update({ ...s, hanafi: e.target.value === "h" })}>
                <option value="s">Shafi, Maliki, Hanbali</option><option value="h">Hanafi</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
