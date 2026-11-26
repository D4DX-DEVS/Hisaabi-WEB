// Original line-and-shape illustrations in the Hisaabi palette (teal, lime, a touch of sun gold).
// Used where the app has no photo for a category, so every tile looks designed, not stock.
export type Scene = "mosque" | "lantern" | "beads" | "kaaba" | "book" | "dates" | "arch" | "moon" | "drop" | "leaf" | "star" | "hands" | "mushaf" | "chat" | "bookmark";

// colours come from CSS variables so light mode can repaint the art; the fallbacks are the dark palette
const L = "var(--art-l, #a6c420)", LL = "var(--art-ll, #cfe65e)", S = "var(--art-s, #ffd369)", D = "var(--art-d, #14232a)";

const Stars = () => (
  <g fill={LL} opacity=".7" className="art-stars">
    {[[40, 40, 2], [120, 25, 1.4], [330, 50, 2], [280, 22, 1.4], [70, 100, 1.2], [360, 110, 1.4], [210, 40, 1.2]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
  </g>
);
const Crescent = ({ x, y, r }: { x: number; y: number; r: number }) => {
  const id = `cm-${x}-${y}-${r}`;
  return (
    <g>
      <mask id={id}><rect x="0" y="0" width="400" height="300" fill="#fff" /><circle cx={x + r * 0.45} cy={y - r * 0.15} r={r * 0.85} fill="#000" /></mask>
      <circle cx={x} cy={y} r={r} fill={S} mask={`url(#${id})`} />
    </g>
  );
};

const SCENES: Record<Scene, React.ReactNode> = {
  mosque: (<>
    <Stars /><Crescent x={310} y={70} r={20} />
    <g fill={L} opacity=".95">
      <path d="M120 250V150a80 70 0 0 1 160 0v100z" />
      <rect x="196" y="62" width="8" height="26" /><circle cx="200" cy="58" r="5" />
    </g>
    <g fill={LL}><rect x="62" y="130" width="22" height="120" /><path d="M62 130l11-34 11 34z" /><rect x="316" y="130" width="22" height="120" /><path d="M316 130l11-34 11 34z" /></g>
    <path d="M180 250v-46a20 26 0 0 1 40 0v46z" fill={D} />
    <rect x="0" y="250" width="400" height="50" fill={D} opacity=".8" />
  </>),
  lantern: (<>
    <Stars />
    <path d="M200 0v70" stroke={L} strokeWidth="3" />
    <g fill="none" stroke={LL} strokeWidth="4" strokeLinejoin="round"><path d="M170 74h60l-10 22h-40z" /><path d="M176 96h48l14 80h-76z" fill={L} fillOpacity=".25" /><path d="M162 176h76l-12 26h-52z" /></g>
    <path d="M200 112c14 14 14 38 0 52-14-14-14-38 0-52z" fill={S} />
    <path d="M200 202v34" stroke={LL} strokeWidth="3" /><circle cx="200" cy="242" r="6" fill={S} />
  </>),
  beads: (<>
    <Stars />
    {Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2 - Math.PI / 2; return <circle key={i} cx={200 + 84 * Math.cos(a)} cy={140 + 84 * Math.sin(a)} r="11" fill={i % 8 === 0 ? S : L} opacity={i % 8 === 0 ? 1 : 0.9} />; })}
    <path d="M200 224v34" stroke={LL} strokeWidth="3" /><path d="M188 258h24l-6 24h-12z" fill={S} />
  </>),
  kaaba: (<>
    <Stars /><Crescent x={70} y={60} r={18} />
    <path d="M110 110l90-26 90 26v130l-90 26-90-26z" fill={D} stroke={L} strokeWidth="3" />
    <path d="M110 140l90-26 90 26v22l-90 26-90-26z" fill={S} opacity=".9" />
    <path d="M200 84v182" stroke={L} strokeWidth="2" opacity=".6" />
    <rect x="212" y="196" width="32" height="56" rx="3" fill={L} opacity=".85" />
    <rect x="0" y="266" width="400" height="34" fill={D} opacity=".8" />
  </>),
  book: (<>
    <Stars />
    <path d="M200 90C160 70 110 74 70 92v140c40-18 90-22 130-2z" fill={L} opacity=".95" />
    <path d="M200 90c40-20 90-16 130 2v140c-40-18-90-22-130-2z" fill={LL} opacity=".95" />
    <g stroke={D} strokeWidth="3" opacity=".55" strokeLinecap="round">{[116, 138, 160, 182, 204].map((y) => <g key={y}><path d={`M88 ${y}h86`} /><path d={`M226 ${y}h86`} /></g>)}</g>
    <path d="M110 250l90 24 90-24" fill="none" stroke={L} strokeWidth="6" strokeLinecap="round" />
  </>),
  dates: (<>
    <Stars /><Crescent x={300} y={80} r={34} />
    <path d="M90 190h220c0 50-44 84-110 84S90 240 90 190z" fill={L} />
    {[[140, 176], [186, 164], [232, 172], [272, 182], [162, 192], [214, 190]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="20" ry="13" fill="#7a5530" transform={`rotate(${i * 25 - 40} ${x} ${y})`} />)}
    <g stroke={LL} strokeWidth="4" strokeLinecap="round" fill="none"><path d="M70 120c10-30 30-44 50-48M70 120c-4-24 4-44 18-58" /></g>
  </>),
  arch: (<>
    <Stars />
    <path d="M110 270V150c0-70 45-100 90-130 45 30 90 60 90 130v120z" fill={L} opacity=".18" stroke={L} strokeWidth="4" />
    <path d="M140 270V156c0-50 28-72 60-94 32 22 60 44 60 94v114z" fill="none" stroke={LL} strokeWidth="3" />
    <g stroke={LL} strokeWidth="2" opacity=".8" fill="none"><path d="M200 120l22 22-22 22-22-22z" /><path d="M200 170l22 22-22 22-22-22z" /><path d="M200 220l22 22-22 22-22-22z" /></g>
    <circle cx="200" cy="80" r="6" fill={S} />
  </>),
  moon: (<>
    <Stars /><Crescent x={200} y={120} r={78} />
    <path d="M0 250C80 200 150 215 220 235S340 225 400 200V300H0z" fill={L} opacity=".85" />
    <path d="M0 275C100 240 200 265 400 245V300H0z" fill={D} opacity=".9" />
  </>),
  drop: (<>
    <Stars />
    <path d="M200 50c46 66 70 100 70 144a70 70 0 0 1-140 0c0-44 24-78 70-144z" fill={L} opacity=".95" />
    <path d="M168 190c0 22 12 40 32 46" stroke={D} strokeWidth="7" strokeLinecap="round" fill="none" opacity=".4" />
    <g fill="none" stroke={LL} strokeWidth="3" opacity=".7"><ellipse cx="200" cy="262" rx="62" ry="12" /><ellipse cx="200" cy="262" rx="96" ry="18" opacity=".5" /></g>
  </>),
  leaf: (<>
    <Stars />
    <path d="M200 270V110" stroke={LL} strokeWidth="5" strokeLinecap="round" />
    <path d="M200 200c-70-8-96-58-86-100 52 4 88 36 86 100z" fill={L} />
    <path d="M200 160c60-6 90-44 82-88-50 4-84 30-82 88z" fill={LL} />
    <circle cx="300" cy="70" r="26" fill={S} opacity=".95" />
  </>),
  star: (<>
    {[0, 1, 2].map((i) => <path key={i} d="M200 60l22 52 54-22-22 54 52 22-52 22 22 54-54-22-22 52-22-52-54 22 22-54-52-22 52-22-22-54 54 22z" fill="none" stroke={i === 1 ? S : L} strokeWidth="3" opacity={0.9 - i * 0.22} transform={`translate(200 150) scale(${1 - i * 0.28}) translate(-200 -150)`} />)}
    <circle cx="200" cy="150" r="10" fill={LL} />
  </>),
  hands: (<>
    <Stars />
    <path d="M200 250c-70 0-110-36-122-96 22 6 44 22 58 44 8-60 30-98 64-122 34 24 56 62 64 122 14-22 36-38 58-44-12 60-52 96-122 96z" fill={L} opacity=".95" />
    <path d="M200 250c-26 0-44-30-44-72 16 10 30 28 44 28s28-18 44-28c0 42-18 72-44 72z" fill={LL} />
    <circle cx="200" cy="64" r="22" fill={S} opacity=".95" />
  </>),
  mushaf: (<>
    <Stars />
    <rect x="112" y="34" width="176" height="236" rx="10" fill={D} stroke={L} strokeWidth="3" />
    <rect x="124" y="46" width="152" height="212" rx="6" fill="none" stroke={LL} strokeWidth="1.5" opacity=".7" />
    <path d="M200 58l7 12 13-3-5 12 11 8-13 3 1 13-14-7-14 7 1-13-13-3 11-8-5-12 13 3z" fill={S} transform="translate(0 6) scale(1)" />
    {[104, 128, 152, 176, 200, 224].map((y, i) => (
      <g key={y}><path d={`M136 ${y}h${i % 3 === 2 ? 70 : 128}`} stroke={L} strokeWidth="5" strokeLinecap="round" opacity={0.9 - i * 0.05} />{i % 3 !== 2 && <circle cx="270" cy={y} r="0" />}</g>
    ))}
    <circle cx="258" cy="152" r="8" fill="none" stroke={S} strokeWidth="2" /><circle cx="258" cy="200" r="8" fill="none" stroke={S} strokeWidth="2" />
    <path d="M276 34v52l-12-10-12 10V34z" fill={S} />
  </>),
  chat: (<>
    <Stars /><Crescent x={330} y={56} r={18} />
    <path d="M70 70h170a14 14 0 0 1 14 14v84a14 14 0 0 1-14 14h-96l-34 30v-30H70a14 14 0 0 1-14-14V84a14 14 0 0 1 14-14z" fill={L} opacity=".95" />
    <path d="M148 108l5 11 12-2-6 10 9 8-12 3 1 12-11-6-11 6 1-12-12-3 9-8-6-10 12 2z" fill={D} opacity=".75" />
    <path d="M170 196h110a14 14 0 0 1 14 14v40a14 14 0 0 1-14 14h-14v26l-30-26h-66a14 14 0 0 1-14-14v-40a14 14 0 0 1 14-14z" fill={LL} opacity=".95" transform="translate(40 -16)" />
    {[0, 1, 2].map((i) => <circle key={i} cx={238 + i * 22} cy="250" r="5" fill={D} opacity=".6" transform="translate(40 -16)" />)}
  </>),
  bookmark: (<>
    <Stars />
    <path d="M140 40h120a10 10 0 0 1 10 10v220l-70-52-70 52V50a10 10 0 0 1 10-10z" fill={L} />
    <path d="M200 86l9 18 20 3-14 14 3 20-18-9-18 9 3-20-14-14 20-3z" fill={D} opacity=".7" />
    <path d="M155 40h90" stroke={LL} strokeWidth="3" />
    <circle cx="300" cy="70" r="22" fill={S} opacity=".95" />
  </>),
};

// The pool used to pick art for categories with no matching keyword. The three section-only scenes stay out of it.
export const SCENE_LIST = (Object.keys(SCENES) as Scene[]).filter((k) => !["mushaf", "chat", "bookmark"].includes(k));

export default function Art({ scene, hue = 0, fit = "slice" }: { scene: Scene; hue?: number; fit?: "slice" | "meet" }) {
  const id = `bg-${scene}-${hue}`;
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio={fit === "meet" ? "xMidYMid meet" : "xMidYMid slice"} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: -2 }}>
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`var(--art-bg1, ${["#25434b", "#233f3a", "#1f3b4d"][hue % 3]})`} /><stop offset="1" stopColor="var(--art-bg2, #14232a)" />
        </linearGradient>
        <radialGradient id={id} cx=".5" cy=".4" r=".6"><stop offset="0" stopColor="#a6c420" stopOpacity=".22" /><stop offset="1" stopColor="#a6c420" stopOpacity="0" /></radialGradient>
      </defs>
      {fit === "slice" && <><rect width="400" height="300" fill={`url(#bg-${id})`} /><rect width="400" height="300" fill={`url(#${id})`} /></>}
      {SCENES[scene]}
    </svg>
  );
}
