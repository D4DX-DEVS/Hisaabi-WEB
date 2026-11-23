/** Placeholder blocks shown while a page loads its data. */
export default function Loading({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading" style={{ display: "grid", gap: 12 }}>
      {Array.from({ length: rows }, (_, i) => <div key={i} className="shimmer" style={{ height: i === 0 ? 96 : 72, opacity: 1 - i * 0.2 }} />)}
    </div>
  );
}
