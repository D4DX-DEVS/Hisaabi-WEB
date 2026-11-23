"use client";
import { useEffect, useState } from "react";
import PageHead from "@/components/PageHead";
import { useLang, type Lang } from "@/lib/lang";

export default function About() {
  const { lang } = useLang();
  const [text, setText] = useState<Record<Lang, string> | null>(null);
  useEffect(() => { fetch("/data/about.json").then((r) => r.json()).then(setText); }, []);
  const [title, ...paras] = (text?.[lang] || text?.english || "").split("\n\n");
  return (
    <>
      <PageHead lang scene="star" title="About Hisaabi" sub={title} />
      <div className={"card" + (lang === "urdu" ? " ur" : "")} dir={lang === "urdu" ? "rtl" : undefined} style={{ display: "grid", gap: 16, maxWidth: 760 }}>
        {paras.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </>
  );
}
