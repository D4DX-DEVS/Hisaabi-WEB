"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, MoonStar, Settings as Cog, Sun } from "lucide-react";
import { useAppearance } from "@/lib/appearance";
import SunDial from "@/components/SunDial";
import ImageTile from "@/components/ImageTile";
import Banner from "@/components/Banner";
import { SECTION_SCENE } from "@/lib/images";
import { GROUPS } from "@/components/Shell";
import { dayView, usePrayerSettings } from "@/lib/prayer";
import { items, useApi } from "@/lib/api";
import { pick, useLang } from "@/lib/lang";

const hijri = (d: Date) => new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(d);

// the entrance plays once per browser session, so coming back to Home is instant
const introSeen = () => { try { return sessionStorage.getItem("hisaabi.intro") === "1"; } catch { return true; } };
const GREETING = "Assalamu alaikum";
type Quote = { text?: string; english?: string; malayalam?: string; urdu?: string };
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Home() {
  const [intro] = useState(() => !introSeen());
  useEffect(() => { try { sessionStorage.setItem("hisaabi.intro", "1"); } catch {} }, []);
  const { s, loc, err } = usePrayerSettings();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const v = loc ? dayView(loc, s, now) : null;
  const tiles = GROUPS.flatMap((g) => g.items).filter(([h]) => SECTION_SCENE[h] && h !== "/saved");

  const { update } = useAppearance();
  const { lang } = useLang();
  // today's quote from the app (needs sign-in); signed-out visitors keep the greeting and verse below
  // like the app: on Fridays the Friday quote comes first, the daily quote is the fallback
  const friday = useApi<{ friday_quote?: Quote | null }>(now.getDay() === 5 ? `/content/friday-quotes/today?date=${ymd(now)}` : null).data?.friday_quote;
  const daily = items<Quote>(useApi<unknown>(`/content/daily-quotes?page=1&limit=1&date=${ymd(now)}`).data, "daily_quotes")[0];
  const quote = friday || daily;
  const quoteText = quote && pick(lang, quote)?.trim();

  return (
    <>
      <div className="home-actions">
        <button type="button" className="icon-btn" onClick={() => update({ mode: document.documentElement.dataset.theme === "light" ? "dark" : "light" })} aria-label="Switch light or dark theme" title="Light / dark">
          <Sun size={18} className="when-dark" aria-hidden /><MoonStar size={18} className="when-light" aria-hidden />
        </button>
        <Link href="/settings" className="icon-btn" aria-label="Settings" title="Settings"><Cog size={18} aria-hidden /></Link>
      </div>
      <section style={{ display: "grid", gap: 40, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "center", marginBottom: 56 }}>
        {quote && quoteText ? (
          <div>
            <p className="muted" style={{ marginBottom: 18 }}><span className="gold">Today&apos;s quote</span> · {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · {hijri(now)}</p>
            {quote.text && <p className="ar" style={{ fontSize: "clamp(1.3rem, 1.9vw, 1.75rem)", lineHeight: 2.1, color: "var(--gold)", textAlign: "left", whiteSpace: "pre-line" }}>{quote.text.trim()}</p>}
            <p className={"display" + (lang === "urdu" ? " ur" : "")} dir={lang === "urdu" ? "rtl" : undefined} style={{ fontSize: "clamp(1.3rem, 1.9vw, 1.8rem)", lineHeight: lang === "urdu" ? 2.2 : 1.3, color: "var(--ivory)", marginTop: 18 }}>{quoteText}</p>
          </div>
        ) : (
          <div>
            <p className="muted" style={{ marginBottom: 14 }}>{now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} · {hijri(now)}</p>
            <h1 className="display" style={{ fontSize: "clamp(2.2rem, 4.6vw, 3.8rem)", lineHeight: 1.05, whiteSpace: "nowrap", color: "var(--ivory)" }}>
              {intro ? Array.from(GREETING).map((ch, i) => (
                <motion.span key={i} style={{ display: "inline-block", whiteSpace: "pre" }} initial={{ opacity: 0, y: "0.35em", filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.15 + i * 0.045, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>{ch}</motion.span>
              )) : GREETING}
            </h1>
            <p className="ar" style={{ fontSize: "1.9rem", color: "var(--gold)", marginTop: 22, textAlign: "left" }}>إِنَّ مَعَ الْعُسْرِ يُسْرًا</p>
            <p className="muted" style={{ maxWidth: "36ch" }}>Indeed, with hardship comes ease. Quran 94:6</p>
            {loc && <p className="muted" style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem" }}><MapPin size={14} /> {loc.lat.toFixed(2)}, {loc.lon.toFixed(2)}</p>}
          </div>
        )}
        <div style={{ display: "grid", placeItems: "center" }}>
          {v ? <SunDial times={v.times} now={now} next={v.next} remaining={v.remaining} delay={intro ? 0.9 : 0} /> : (
            <Link href="/prayer" className="card" style={{ textAlign: "center", maxWidth: 320 }}>
              <b className="display" style={{ fontSize: "1.5rem" }}>See today&apos;s prayer times</b>
              <p className="muted" style={{ marginTop: 6 }}>{err || "Allow location, or enter coordinates."}</p>
            </Link>
          )}
        </div>
      </section>

      <Banner />

      {/* phones: small icon cards, three across, like the app's More screen */}
      <div className="icon-grid">
        {tiles.map(([href, Icon, label], i) => (
          <Link key={href} href={href} className="icon-card" style={intro ? { animation: `icon-rise 0.7s var(--ease) ${2.1 + Math.min(i, 14) * 0.04}s both` } : undefined}>
            <span className="icon-box"><Icon size={24} strokeWidth={1.6} /></span>
            <span className="icon-label">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid tiles-desktop" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
        {tiles.map(([href, , label], i) => (
          <ImageTile key={href} href={href} title={label} {...SECTION_SCENE[href]} enterDelay={intro ? 2.2 + Math.min(i, 11) * 0.06 : undefined} />
        ))}
      </div>
    </>
  );
}
