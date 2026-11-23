// Eight-point star medallion that holds a number (surah, name, day).
export default function Medal({ n }: { n: number | string }) {
  return (
    <div className="medal">
      <svg viewBox="0 0 48 48" strokeWidth="1.2"><path d="M24 2l5.5 11.6L42 9l-4.6 12.5L46 24l-8.6 2.5L42 39l-12.5-4.6L24 46l-5.5-11.6L6 39l4.6-12.5L2 24l8.6-2.5L6 9l12.5 4.6z" /></svg>
      <span>{n}</span>
    </div>
  );
}
