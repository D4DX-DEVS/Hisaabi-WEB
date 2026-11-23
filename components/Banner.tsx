"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";

type B = { type?: "image" | "slider" | "video"; images?: string[]; video?: string; link_url?: string };

const UPLOADS = process.env.NEXT_PUBLIC_UPLOADS_URL ?? "";
const safeLink = (u?: string) => { try { const p = new URL(u ?? ""); return p.protocol === "https:" || p.protocol === "http:" ? p.href : null; } catch { return null; } };

/** Today's banner from the backend (image, slider or video). Renders nothing when there isn't one. */
export default function Banner() {
  const { data } = useApi<{ banner: B | null }>("/content/banner/today");
  const b = data?.banner;
  const images = b?.images ?? [];
  const [i, setI] = useState(0);
  const slider = b?.type === "slider" && images.length > 1;
  useEffect(() => {
    if (!slider) return;
    const t = setInterval(() => setI((x) => (x + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [slider, images.length]);
  if (!b) return null;

  const href = safeLink(b.link_url);
  const media = b.type === "video" && b.video
    ? <video src={`${UPLOADS}/${b.video}`} autoPlay muted loop playsInline style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }} />
    : images.length > 0
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={`${UPLOADS}/${images[slider ? i : 0]}`} alt="" style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }} />
      : null;
  if (!media) return null;

  const body = (
    <div className="card" style={{ padding: 0, marginBottom: 28, position: "relative" }}>
      {media}
      {slider && (
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", gap: 6, justifyContent: "center" }}>
          {images.map((_, k) => <span key={k} style={{ width: k === i ? 18 : 6, height: 6, borderRadius: 6, background: k === i ? "var(--gold)" : "rgba(255,255,255,.5)", transition: "width .3s" }} />)}
        </div>
      )}
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>{body}</a> : body;
}
