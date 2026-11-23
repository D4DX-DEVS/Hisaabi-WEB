"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import SunDial from "@/components/SunDial";
import ImageTile from "@/components/ImageTile";
import Banner from "@/components/Banner";
import { SECTION_SCENE } from "@/lib/images";
import { GROUPS } from "@/components/Shell";
import { dayView, usePrayerSettings } from "@/lib/prayer";

const hijri = (d: Date) => new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(d);

export default function Home() {
  const { s, loc, err } = usePrayerSettings();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const v = loc ? dayView(loc, s, now) : null;
  const tiles = GROUPS.flatMap((g) => g.items).filter(([h]) => SECTION_SCENE[h] && h !== "/saved");

  return (
    <>
      <section style={{ display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "center", marginBottom: 56 }}>
        <div>
          <p className="muted" style={{ marginBottom: 14 }}>{now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · {hijri(now)}</p>
          <h1 className="display" style={{ fontSize: "clamp(2.2rem, 4.6vw, 3.8rem)", lineHeight: 1.05, color: "var(--ivory)" }}>
            Assalamu alaikum
          </h1>
          <p className="ar" style={{ fontSize: "1.9rem", color: "var(--gold)", marginTop: 22, textAlign: "left" }}>إِنَّ مَعَ الْعُسْرِ يُسْرًا</p>
          <p className="muted" style={{ maxWidth: "36ch" }}>Indeed, with hardship comes ease. Quran 94:6</p>
          {loc && <p className="muted" style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem" }}><MapPin size={14} /> {loc.lat.toFixed(2)}, {loc.lon.toFixed(2)}</p>}
        </div>
        <div style={{ display: "grid", placeItems: "center" }}>
          {v ? <SunDial times={v.times} now={now} next={v.next} remaining={v.remaining} /> : (
            <Link href="/prayer" className="card" style={{ textAlign: "center", maxWidth: 320 }}>
              <b className="display" style={{ fontSize: "1.5rem" }}>See today&apos;s prayer times</b>
              <p className="muted" style={{ marginTop: 6 }}>{err || "Allow location, or enter coordinates."}</p>
            </Link>
          )}
        </div>
      </section>

      <Banner />

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
        {tiles.map(([href, , label]) => (
          <ImageTile key={href} href={href} title={label} {...SECTION_SCENE[href]} />
        ))}
      </div>
    </>
  );
}
