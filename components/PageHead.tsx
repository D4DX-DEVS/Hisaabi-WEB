"use client";
import { useEffect } from "react";
import { Star } from "lucide-react";
import Art, { type Scene } from "./Art";
import ContentBar from "./ContentBar";

/** Sets the browser tab title for the current page. */
export function useTitle(title: string) {
  useEffect(() => {
    const want = title ? `${title} · Hisaabi` : "Hisaabi";
    const apply = () => { if (document.title !== want) document.title = want; };
    apply();
    // Next re-writes the <title> from the layout after hydration; put ours back
    const el = document.querySelector("title");
    const obs = el ? new MutationObserver(apply) : null;
    if (el) obs?.observe(el, { childList: true, characterData: true, subtree: true });
    return () => obs?.disconnect();
  }, [title]);
}

export default function PageHead({ title, sub, scene, lang = false }: { title: string; sub?: string; scene?: Scene; lang?: boolean }) {
  useTitle(title);
  if (scene) return (
    <>
    <header className="banner">
      <div className="banner-art"><Art scene={scene} fit="meet" /></div>
      <div className="banner-text">
        <h1 className="h1">{title}</h1>
        {sub && <p className="sub" style={{ margin: "8px 0 0" }}>{sub}</p>}
      </div>
    </header>
    {lang && <ContentBar />}
    </>
  );
  return (
    <header style={{ marginBottom: 28 }}>
      <h1 className="h1">{title}</h1>
      <div className="orn"><Star fill="currentColor" /></div>
      {sub && <p className="sub" style={{ marginBottom: 0 }}>{sub}</p>}
    </header>
  );
}
