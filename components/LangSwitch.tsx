"use client";
import { useLang, type Lang } from "@/lib/lang";

const CHIPS: { id: Lang; short: string; full: string }[] = [
  { id: "english", short: "EN", full: "English" },
  { id: "malayalam", short: "ML", full: "Malayalam" },
  { id: "urdu", short: "UR", full: "Urdu" },
];

/** Content language chips, as in the mobile app: English, Malayalam or Urdu for duas, hadith, names and articles. */
export default function LangSwitch({ full = false }: { full?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div className={"langs" + (full ? " full" : "")} role="group" aria-label="Content language">
      {CHIPS.map((c) => (
        <button key={c.id} type="button" aria-label={c.full} aria-pressed={lang === c.id} className={lang === c.id ? "on" : ""} onClick={() => setLang(c.id)}>{full ? c.full : c.short}</button>
      ))}
    </div>
  );
}
