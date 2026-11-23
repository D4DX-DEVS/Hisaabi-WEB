"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { MotionConfig, motion } from "framer-motion";
import {
  Bot, BookOpen, BookText, Flower2, Lightbulb, Calculator, CalendarDays, CircleDot, Clock, Home, Library, Moon, Quote, Scroll, Sparkles, Settings as Cog, Star, UserRound, MessageSquare, Info, Mail, ShieldCheck, Video, HandHeart, LayoutGrid, X,
  type LucideIcon,
} from "lucide-react";

type Item = readonly [href: string, Icon: LucideIcon, label: string];
export const GROUPS: { title: string; items: Item[] }[] = [
  { title: "Daily", items: [["/", Home, "Home"], ["/prayer", Clock, "Prayer times"], ["/quran", BookOpen, "Quran"], ["/tasbeeh", CircleDot, "Tasbeeh"]] },
  { title: "Remembrance", items: [["/duas", HandHeart, "Duas"], ["/adhkar", Scroll, "Adhkar"], ["/names", Sparkles, "Names of Allah"], ["/hadith", Library, "Hadith"], ["/quotes", Quote, "Quotes"]] },
  { title: "Learn", items: [["/library", BookText, "Library"], ["/importance", Lightbulb, "Importance"], ["/special", Flower2, "Special duas"]] },
  { title: "Tools", items: [["/calendar", CalendarDays, "Calendar"], ["/zakat", Calculator, "Zakat"], ["/ramadan", Moon, "Ramadan"], ["/mecca", Video, "Mecca live"], ["/ai", Bot, "Assistant"]] },
  { title: "Help", items: [["/feedback", MessageSquare, "Feedback"], ["/about", Info, "About"], ["/contact", Mail, "Contact"], ["/privacy", ShieldCheck, "Privacy"]] },
  { title: "You", items: [["/saved", Star, "Saved"], ["/settings", Cog, "Settings"], ["/login", UserRound, "Account"]] },
];
export const NAV = GROUPS.flatMap((g) => g.items);

// the Quran is read as Mushaf pages, so those pages belong to the Quran entry
const isOn = (p: string, href: string) => (href === "/" ? p === "/" : p.startsWith(href) || (href === "/quran" && p.startsWith("/mushaf")));
// the four sections people open most; everything else is under "More" on phones
const TABS: Item[] = [["/", Home, "Home"], ["/prayer", Clock, "Prayer"], ["/quran", BookOpen, "Quran"], ["/duas", HandHeart, "Duas"]];

function NavLinks() {
  const p = usePathname();
  return (
    <>
      {GROUPS.map((g) => (
        <Fragment key={g.title}>
          <div className="group">{g.title.toUpperCase()}</div>
          {g.items.map(([href, Icon, label]) => {
            const on = isOn(p, href);
            return (
              <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
                {on && <motion.span layoutId="pill" className="pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <Icon /> {label}
              </Link>
            );
          })}
        </Fragment>
      ))}
    </>
  );
}

/** Phone navigation: four tabs plus a sheet with every section. */
function TabBar() {
  const p = usePathname();
  // remember where the sheet was opened; it closes by itself once the page changes
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === p;
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpenAt(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  const inTabs = TABS.some(([h]) => isOn(p, h));
  return (
    <>
      <nav className="tabbar" aria-label="Main">
        {TABS.map(([href, Icon, label]) => {
          const on = isOn(p, href);
          return <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}><Icon size={20} strokeWidth={1.7} />{label}</Link>;
        })}
        <button type="button" className={!inTabs ? "on" : ""} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpenAt(p)}><LayoutGrid size={20} strokeWidth={1.7} />More</button>
      </nav>
      {open && (
        <>
          <div className="sheet-back" onClick={() => setOpenAt(null)} />
          <div className="sheet" role="dialog" aria-modal="true" aria-label="All sections">
            <div className="row" style={{ marginBottom: 12 }}>
              <b className="display" style={{ fontSize: "1.3rem" }}>All sections</b>
              <button type="button" className="icon-btn" aria-label="Close" onClick={() => setOpenAt(null)} autoFocus><X size={20} /></button>
            </div>
            {GROUPS.map((g) => (
              <section key={g.title} style={{ marginBottom: 14 }}>
                <div className="group" style={{ margin: "6px 4px" }}>{g.title.toUpperCase()}</div>
                <div className="sheet-grid">
                  {g.items.map(([href, Icon, label]) => (
                    <Link key={href} href={href} className={isOn(p, href) ? "on" : ""}><Icon size={22} strokeWidth={1.6} />{label}</Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  // pages read the clock/localStorage/geolocation, so render them only in the browser
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  return (
    <MotionConfig reducedMotion="user">
      <div className="shell">
        <nav className="rail" aria-label="Main">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Link href="/" aria-label="Hisaabi home"><img className="logo" src="/img/Hisaabi-grn.png" alt="Hisaabi" /></Link>
          <Suspense fallback={null}><NavLinks /></Suspense>
        </nav>
        <main className="main">
          <div className="page">
            <div className="topbar">
              <Link href="/" className="logo-m" aria-label="Hisaabi home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/Hisaabi-grn.png" alt="Hisaabi" />
              </Link>
            </div>
            {mounted ? children : null}
          </div>
        </main>
        {mounted && <Suspense fallback={null}><TabBar /></Suspense>}
      </div>
    </MotionConfig>
  );
}
