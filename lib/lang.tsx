"use client";
import { createContext, useCallback, useContext, useState } from "react";

export type Lang = "english" | "malayalam" | "urdu";
export const LANGS: [Lang, string][] = [["english", "EN"], ["malayalam", "മല"], ["urdu", "اردو"]];
const KEY = "hisaabi.lang";

type Tr = Partial<Record<Lang, string | null | undefined>> | null | undefined;

/** Text in the chosen language, falling back to English, then whatever exists. Works on {english, malayalam, urdu} objects and flat items. */
export const pick = (lang: Lang, t: Tr) => (t ? t[lang] || t.english || t.malayalam || t.urdu || "" : "");

/** Same for titles stored as `title`, `title_malayalam`, `title_urdu` (or `name`, `name_malayalam`, ...). */
export const pickField = (lang: Lang, o: Record<string, unknown> | null | undefined, base = "title") =>
  o ? pick(lang, { english: o[base] as string, malayalam: o[`${base}_malayalam`] as string, urdu: o[`${base}_urdu`] as string }) : "";

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "english", setLang: () => {} });
export const useLang = () => useContext(Ctx);

export function LangProvider({ children }: { children: React.ReactNode }) {
  // also rendered on the server, where there is no localStorage; pages only render in the browser
  const [lang, set] = useState<Lang>(() => { try { const v = typeof window === "undefined" ? null : localStorage.getItem(KEY); return v === "malayalam" || v === "urdu" ? v : "english"; } catch { return "english"; } });
  const setLang = useCallback((l: Lang) => { set(l); try { localStorage.setItem(KEY, l); } catch {} }, []);
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}
