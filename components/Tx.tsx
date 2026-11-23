"use client";
import { useLang } from "@/lib/lang";

/** A paragraph of translated text; Urdu is set right to left in its own face. */
export default function Tx({ text, muted = false, style }: { text?: string; muted?: boolean; style?: React.CSSProperties }) {
  const { lang } = useLang();
  if (!text) return null;
  return <p className={"tr " + (lang === "urdu" ? "ur " : "") + (muted ? "muted" : "")} dir={lang === "urdu" ? "rtl" : undefined} style={{ maxWidth: "70ch", marginLeft: lang === "urdu" ? "auto" : undefined, ...style }}>{text}</p>;
}
