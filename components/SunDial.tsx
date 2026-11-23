"use client";
import { motion } from "framer-motion";

type T = { name: string; at: Date };

// 240° arc from lower-left to lower-right; Fajr sits at the start, Isha at the end.
const START = 150, SWEEP = 240;
const pt = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];

export default function SunDial({ times, now, next, remaining, size = 380, delay = 0 }: { times: T[]; now: Date; next: string | null; remaining: string; size?: number; delay?: number }) {
  const c = size / 2, r = size / 2 - 58;
  const t0 = times[0].at.getTime(), t1 = times[times.length - 1].at.getTime();
  const frac = (d: Date) => Math.min(1, Math.max(0, (d.getTime() - t0) / (t1 - t0)));
  const pos = (f: number) => pt(c, c, r, START + SWEEP * f);
  const [x0, y0] = pos(0), [x1, y1] = pos(1);
  const arc = `M ${x0} ${y0} A ${r} ${r} 0 1 1 ${x1} ${y1}`;
  const f = frac(now);
  const soon = !!next && remaining < "00:10:00"; // the last ten minutes before the adhan
  const [sx, sy] = pos(f);
  return (
    <div style={{ width: "100%", maxWidth: size, aspectRatio: "1", position: "relative" }}>
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" role="img" aria-label="Prayer times for today">
        <defs>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#cfe65e" /><stop offset="0.55" stopColor="#a6c420" /><stop offset="1" stopColor="#7f9a12" /></linearGradient>
          <radialGradient id="halo"><stop offset="0" stopColor="#ffd369" stopOpacity="0.6" /><stop offset="1" stopColor="#ffd369" stopOpacity="0" /></radialGradient>
        </defs>
        <circle cx={c} cy={c} r={r - 26} fill="none" stroke="rgba(166,196,32,0.08)" strokeDasharray="2 7" />
        <path d={arc} fill="none" stroke="rgba(166,196,32,0.14)" strokeWidth="2" />
        <motion.path d={arc} fill="none" stroke="url(#gold)" strokeWidth="3.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: f }} transition={{ delay, duration: 2.2, ease: [0.22, 1, 0.36, 1] }} />
        {times.map((t) => {
          const [mx, my] = pos(frac(t.at));
          const [lx, ly] = pt(c, c, r + 30, START + SWEEP * frac(t.at));
          const done = t.at <= now, on = t.name === next;
          return (
            <g key={t.name}>
              <circle cx={mx} cy={my} r={on ? 6 : 4} fill={done ? "#a6c420" : "#121f26"} stroke="#a6c420" strokeWidth="1.5" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="12.5" fill={on ? "#cfe65e" : "#9fb0b6"} style={{ letterSpacing: "0.04em" }}>{t.name}</text>
            </g>
          );
        })}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}>
          <circle cx={sx} cy={sy} r="26" fill="url(#halo)" />
          <circle cx={sx} cy={sy} r="8" fill="#ffd369" />
        </motion.g>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", pointerEvents: "none" }}>
        <div>
          <div className="muted" style={{ fontSize: ".8rem", letterSpacing: ".14em" }}>{next ? `NEXT · ${next.toUpperCase()}` : "TODAY"}</div>
          <div className={"display" + (soon ? " count-soon" : "")} style={{ fontSize: "clamp(2rem, 5.5vw, 3rem)", color: "var(--ivory)", fontVariantNumeric: "lining-nums tabular-nums", lineHeight: 1.1 }}>{next ? remaining : "Done"}</div>
          <div className="muted" style={{ fontSize: ".8rem" }}>{next ? "until the adhan" : "all prayers prayed"}</div>
        </div>
      </div>
    </div>
  );
}
