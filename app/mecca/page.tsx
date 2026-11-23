"use client";
import PageHead from "@/components/PageHead";
import { useEffect, useState } from "react";

type Link = { _id?: string; id?: string; title: string; location?: string; link: string; is_active?: boolean };

const ytId = (u: string) => u.match(/(?:v=|youtu\.be\/|\/live\/|\/embed\/)([\w-]{11})/)?.[1];

export default function Mecca() {
  const [links, setLinks] = useState<Link[]>([]);
  const [sel, setSel] = useState(0);
  const [err, setErr] = useState("");
  useEffect(() => {
    // live links are public, no sign-in needed
    fetch("/api/proxy/live-links?page=1&limit=50")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((j) => setLinks((j.live_links ?? j.data ?? []).filter((l: Link) => l.is_active !== false)))
      .catch(() => setErr("Couldn't load the live streams."));
  }, []);
  const cur = links[sel];
  const id = cur && ytId(cur.link);
  return (
    <>
      <PageHead scene="kaaba" title="Mecca & Madeena Live" sub="Live streams from the Haramain" />
      {err && <p style={{ color: "#ff6b60" }}>{err}</p>}
      {cur && (
        <div className="card" style={{ marginBottom: 16, padding: 12 }}>
          {id
            ? <iframe title={cur.title} src={`https://www.youtube.com/embed/${id}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen style={{ width: "100%", aspectRatio: "16/9", border: 0, borderRadius: 14 }} />
            : null}
          <a className="muted" href={cur.link} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 4, padding: "10px 0" }}>Not playing? Open on YouTube ↗</a>
        </div>
      )}
      <div className="grid">
        {links.map((l, i) => (
          <button key={l._id ?? l.id ?? i} className="card" onClick={() => setSel(i)} style={{ textAlign: "left", cursor: "pointer", borderColor: i === sel ? "var(--lime)" : undefined, color: "inherit" }}>
            <b>{l.title}</b>{l.location && <div className="muted">{l.location}</div>}
          </button>
        ))}
      </div>
    </>
  );
}
