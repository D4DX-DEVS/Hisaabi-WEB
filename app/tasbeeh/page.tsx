"use client";
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Gate from "@/components/Gate";
import PageHead from "@/components/PageHead";
import Tx from "@/components/Tx";
import { items, useApi } from "@/lib/api";
import { pick, pickField, useLang } from "@/lib/lang";

const KEY = "hisaabi.tasbeeh";
const R = 130, C = 2 * Math.PI * R;

type Thasbeeh = { id: string; title: string; title_malayalam?: string; title_urdu?: string; arabic_text?: string; count?: number; isCountless?: boolean; malayalam?: string; english?: string; urdu?: string };

function Ring({ count, goal, onTap }: { count: number; goal: number; onTap: () => void }) {
  const [pulse, setPulse] = useState(0);
  const laps = Math.floor(count / goal), within = count % goal;
  return (
    <button onClick={() => { onTap(); setPulse((p) => p + 1); new Audio("/tick_sound.mp3").play().catch(() => {}); }} aria-label={`Count, currently ${count}`}
      style={{ position: "relative", width: 320, height: 320, maxWidth: "86vw", maxHeight: "86vw", background: "none", border: 0, cursor: "pointer", color: "inherit" }}>
      <svg viewBox="0 0 320 320" width="100%" height="100%">
        <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#cfe65e" /><stop offset="1" stopColor="#7f9a12" /></linearGradient></defs>
        <circle cx="160" cy="160" r={R} fill="rgba(20,34,41,.8)" stroke="rgba(166,196,32,.14)" strokeWidth="2" />
        <circle cx="160" cy="160" r={R - 18} fill="none" stroke="rgba(166,196,32,.08)" strokeDasharray="2 8" />
        <motion.circle cx="160" cy="160" r={R} fill="none" stroke="url(#g)" strokeWidth="5" strokeLinecap="round" transform="rotate(-90 160 160)"
          strokeDasharray={C} animate={{ strokeDashoffset: C * (1 - within / goal) }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </svg>
      <motion.div key={pulse} initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}
        style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", alignContent: "center" }}>
        <div className="display" style={{ fontSize: "4.4rem", lineHeight: 1, color: "var(--ivory)", fontVariantNumeric: "lining-nums tabular-nums" }}>{count}</div>
        <div className="muted" style={{ fontSize: ".85rem", marginTop: 6 }}>{laps > 0 ? `${laps} round${laps > 1 ? "s" : ""} of ${goal}` : `of ${goal}`}</div>
      </motion.div>
    </button>
  );
}

function Free() {
  const saved = (): { count?: number; goal?: number } => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
  const [count, setCount] = useState(() => saved().count ?? 0);
  const [goal, setGoal] = useState(() => saved().goal ?? 33);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify({ count, goal })); } catch {} }, [count, goal]);
  return (
    <div style={{ display: "grid", placeItems: "center", gap: 26 }}>
      <Ring count={count} goal={goal} onTap={() => setCount((c) => c + 1)} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {[33, 99, 100, 1000].map((g) => <button key={g} className={"btn" + (goal === g ? "" : " ghost")} onClick={() => setGoal(g)}>{g}</button>)}
        <button className="btn ghost" onClick={() => setCount(0)} aria-label="Reset"><RotateCcw size={16} /> Reset</button>
      </div>
    </div>
  );
}

function Guided() {
  const { lang } = useLang();
  const { data, loading, error } = useApi<unknown>("/content/thasbeehs?page=1&limit=100");
  const [active, setActive] = useState<Thasbeeh | null>(null);
  const [count, setCount] = useState(0);
  const list = items<Thasbeeh>(data, "thasbeehs");

  if (active) {
    const goal = active.isCountless || !active.count ? 100 : active.count;
    return (
      <div style={{ display: "grid", placeItems: "center", gap: 20, textAlign: "center" }}>
        <button className="btn ghost" style={{ justifySelf: "start" }} onClick={() => { setActive(null); setCount(0); }}><ArrowLeft size={16} /> All tasbeehs</button>
        <h2 className="display" style={{ fontSize: "1.6rem" }}>{pickField(lang, active as unknown as Record<string, unknown>, "title")}</h2>
        <p className="ar gold" style={{ fontSize: "1.8rem", maxWidth: 560 }}>{active.arabic_text}</p>
        <Tx text={pick(lang, active)} muted />
        <Ring count={count} goal={goal} onTap={() => setCount((c) => c + 1)} />
        <p className="muted">{active.isCountless ? "No fixed count. Recite as much as you like." : `Recite ${goal} times.`}</p>
        <button className="btn ghost" onClick={() => setCount(0)}><RotateCcw size={16} /> Reset</button>
      </div>
    );
  }
  return (
    <>
      {loading && <Loading />}
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <div style={{ display: "grid", gap: 12 }}>
        {list.map((t) => (
          <button key={t.id} className="card" onClick={() => { setActive(t); setCount(0); }} style={{ textAlign: "left", cursor: "pointer", color: "inherit" }}>
            <div className="row"><b className="display" style={{ fontSize: "1.2rem" }}>{pickField(lang, t as unknown as Record<string, unknown>, "title")}</b><span className="gold">{t.isCountless ? "No limit" : `×${t.count}`}</span></div>
            <p className="ar" style={{ fontSize: "1.4rem", margin: "6px 0" }}>{t.arabic_text}</p>
            <Tx text={pick(lang, t)} muted style={{ fontSize: ".9rem" }} />
          </button>
        ))}
      </div>
    </>
  );
}

export default function Tasbeeh() {
  const [mode, setMode] = useState<"free" | "guided">("free");
  return (
    <>
      <PageHead lang scene="beads" title="Tasbeeh" sub={mode === "free" ? "Tap the ring to count. Your count stays on this device." : "Choose a tasbeeh and recite it to its count."} />
      <div style={{ display: "flex", gap: 8, marginBottom: 22, justifyContent: "center" }}>
        <button className={"btn" + (mode === "free" ? "" : " ghost")} onClick={() => setMode("free")}>Free counter</button>
        <button className={"btn" + (mode === "guided" ? "" : " ghost")} onClick={() => setMode("guided")}>Guided tasbeehs</button>
      </div>
      {mode === "free" ? <Free /> : <Gate><Guided /></Gate>}
    </>
  );
}
