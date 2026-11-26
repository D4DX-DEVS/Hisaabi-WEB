"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, Suspense, useEffect, useState, useSyncExternalStore } from "react";
import PwaBoot from "./PwaBoot";
import { MotionConfig, motion } from "framer-motion";
import {
  Bot, BookOpen, BookText, Flower2, Lightbulb, CircleDot, Clock, Home, Library, Moon, Quote, Scroll, Sparkles, Settings as Cog, Star, UserRound, MessageSquare, Heart, PanelLeftClose, PanelLeftOpen, Info, Mail, ShieldCheck, HandHeart, LayoutGrid, X,
  type LucideIcon,
} from "lucide-react";

type Item = readonly [href: string, Icon: LucideIcon, label: string];
export const GROUPS: { title: string; items: Item[] }[] = [
  { title: "Daily", items: [["/", Home, "Home"], ["/prayer", Clock, "Prayer times"], ["/quran", BookOpen, "Quran"], ["/tasbeeh", CircleDot, "Tasbeeh"]] },
  { title: "Remembrance", items: [["/duas", HandHeart, "Duas"], ["/adhkar", Scroll, "Adhkar"], ["/names", Sparkles, "Names of Allah"], ["/hadith", Library, "Hadith"], ["/quotes", Quote, "Quotes"]] },
  { title: "Learn", items: [["/library", BookText, "Library"], ["/importance", Lightbulb, "Importance"], ["/special", Flower2, "Special duas"], ["/ramadan", Moon, "Ramadan"]] },
  { title: "Help", items: [["/feedback", MessageSquare, "Feedback"], ["/about", Info, "About"], ["/contact", Mail, "Contact"], ["/privacy", ShieldCheck, "Privacy"], ["/ai", Bot, "Assistant"]] },
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
              <Link key={href} href={href} title={label} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
                {on && <motion.span layoutId="pill" className="pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <Icon /> <span className="lbl">{label}</span>
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

const SUPPORT = process.env.NEXT_PUBLIC_SUPPORT_URL;
/** Opens the same support page as the app's Support Us button. */
function Support({ className }: { className: string }) {
  if (!SUPPORT) return null;
  return <a href={SUPPORT} target="_blank" rel="noreferrer" className={className} title="Support us"><Heart size={16} aria-hidden /> <span className="lbl">Support us</span></a>;
}

const RAIL_EVENT = "hisaabi-rail";
const subscribeRail = (cb: () => void) => { window.addEventListener(RAIL_EVENT, cb); return () => window.removeEventListener(RAIL_EVENT, cb); };

export default function Shell({ children }: { children: React.ReactNode }) {
  // pages read the clock/localStorage/geolocation, so render them only in the browser
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  // the sidebar can shrink to icons; the choice is remembered on this browser
  const mini = useSyncExternalStore(subscribeRail, () => { try { return localStorage.getItem("hisaabi.rail") === "mini"; } catch { return false; } }, () => false);
  const toggleRail = () => { try { localStorage.setItem("hisaabi.rail", mini ? "full" : "mini"); } catch {} window.dispatchEvent(new Event(RAIL_EVENT)); };
  return (
    <MotionConfig reducedMotion="user">
      <div className="shell">
        <nav className={"rail" + (mini ? " mini" : "")} aria-label="Main">
          <div className="rail-head">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Link href="/" aria-label="Hisaabi home"><img className="logo when-dark" src="/img/Hisaabi-grn.png" alt="Hisaabi" /><img className="logo when-light" src="/img/Hisaabi-drk.png" alt="Hisaabi" /><img className="logo-mini" src="/img/hisaabi_round.png" alt="Hisaabi" /></Link>
            <button type="button" className="rail-toggle" onClick={toggleRail} aria-label={mini ? "Expand sidebar" : "Collapse sidebar"} title={mini ? "Expand sidebar" : "Collapse sidebar"}>{mini ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</button>
          </div>
          <Support className="support" />
          <Suspense fallback={null}><NavLinks /></Suspense>
        </nav>
        <main className="main">
          <div className="page">
            <div className="topbar">
              <Link href="/" className="logo-m" aria-label="Hisaabi home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="when-dark" src="/img/Hisaabi-grn.png" alt="Hisaabi" /><img className="when-light" src="/img/Hisaabi-drk.png" alt="Hisaabi" />
              </Link>
              <Support className="support sm" />
            </div>
            {mounted ? children : null}
            <footer className="foot">
              <span>© {new Date().getFullYear()} D4DX Innovations LLP. All rights reserved.</span>
              <nav aria-label="Legal">
                <a href="https://d4dx.co/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>
                <a href="https://d4dx.co/terms-conditions" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>
              </nav>
              <a href="https://d4dx.co/" target="_blank" rel="noreferrer" className="foot-by">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                Powered by <img src="/img/d4dx.png" alt="" width={18} height={18} /> <b>D4DX Innovations</b>
              </a>
            </footer>
          </div>
        </main>
        {mounted && <PwaBoot />}
        {mounted && <Suspense fallback={null}><TabBar /></Suspense>}
      </div>
    </MotionConfig>
  );
}
