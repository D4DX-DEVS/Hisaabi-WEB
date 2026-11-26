"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ArabicFont = "amiri" | "uthmani" | "naskh" | "lateef";
export type Size = "small" | "normal" | "large" | "xlarge";
export type Theme = "dark" | "light" | "system";

export const ARABIC_FONTS: { id: ArabicFont; label: string }[] = [
  { id: "amiri", label: "Amiri" }, { id: "uthmani", label: "Uthmani" }, { id: "naskh", label: "Noto Naskh" }, { id: "lateef", label: "Lateef" },
];
export const SIZES: { id: Size; label: string; scale: number }[] = [
  { id: "small", label: "Small", scale: 0.85 }, { id: "normal", label: "Normal", scale: 1 }, { id: "large", label: "Large", scale: 1.2 }, { id: "xlarge", label: "Extra large", scale: 1.4 },
];

export const THEMES: { id: Theme; label: string }[] = [{ id: "dark", label: "Dark" }, { id: "light", label: "Light" }, { id: "system", label: "Match device" }];

type Prefs = { arabicFont: ArabicFont; arabicSize: Size; translationSize: Size; mode: Theme };
const KEY = "hisaabi.appearance";
const DEFAULT: Prefs = { arabicFont: "amiri", arabicSize: "normal", translationSize: "normal", mode: "system" };

const read = (): Prefs => {
  try {
    const v = JSON.parse(typeof window === "undefined" ? "{}" : localStorage.getItem(KEY) || "{}");
    return {
      arabicFont: ARABIC_FONTS.some((f) => f.id === v.arabicFont) ? v.arabicFont : DEFAULT.arabicFont,
      arabicSize: SIZES.some((s) => s.id === v.arabicSize) ? v.arabicSize : DEFAULT.arabicSize,
      translationSize: SIZES.some((s) => s.id === v.translationSize) ? v.translationSize : DEFAULT.translationSize,
      // stored as "mode": the older "theme" value was saved as dark for everyone, so it is ignored and all start on match device
      mode: THEMES.some((t) => t.id === v.mode) ? v.mode : DEFAULT.mode,
    };
  } catch { return DEFAULT; }
};

const Ctx = createContext<{ prefs: Prefs; update: (p: Partial<Prefs>) => void }>({ prefs: DEFAULT, update: () => {} });
export const useAppearance = () => useContext(Ctx);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(read);
  // push the choices onto <html>, where the stylesheet picks them up
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.arfont = prefs.arabicFont;
    root.style.setProperty("--ar-scale", String(SIZES.find((s) => s.id === prefs.arabicSize)?.scale ?? 1));
    root.style.setProperty("--tr-scale", String(SIZES.find((s) => s.id === prefs.translationSize)?.scale ?? 1));
  }, [prefs]);
  // theme lives on <html data-theme>; the inline script in layout.tsx sets it before first paint, this keeps it in sync
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: light)");
    const apply = () => { document.documentElement.dataset.theme = prefs.mode === "system" ? (mq.matches ? "light" : "dark") : prefs.mode; };
    apply();
    if (prefs.mode !== "system") return;
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [prefs.mode]);
  const update = useCallback((p: Partial<Prefs>) => {
    setPrefs((cur) => { const next = { ...cur, ...p }; try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} return next; });
  }, []);
  return <Ctx.Provider value={{ prefs, update }}>{children}</Ctx.Provider>;
}
