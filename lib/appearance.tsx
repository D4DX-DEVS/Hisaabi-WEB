"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ArabicFont = "amiri" | "uthmani" | "naskh" | "lateef";
export type Size = "small" | "normal" | "large" | "xlarge";

export const ARABIC_FONTS: { id: ArabicFont; label: string }[] = [
  { id: "amiri", label: "Amiri" }, { id: "uthmani", label: "Uthmani" }, { id: "naskh", label: "Noto Naskh" }, { id: "lateef", label: "Lateef" },
];
export const SIZES: { id: Size; label: string; scale: number }[] = [
  { id: "small", label: "Small", scale: 0.85 }, { id: "normal", label: "Normal", scale: 1 }, { id: "large", label: "Large", scale: 1.2 }, { id: "xlarge", label: "Extra large", scale: 1.4 },
];

type Prefs = { arabicFont: ArabicFont; arabicSize: Size; translationSize: Size };
const KEY = "hisaabi.appearance";
const DEFAULT: Prefs = { arabicFont: "amiri", arabicSize: "normal", translationSize: "normal" };

const read = (): Prefs => {
  try {
    const v = JSON.parse(typeof window === "undefined" ? "{}" : localStorage.getItem(KEY) || "{}");
    return {
      arabicFont: ARABIC_FONTS.some((f) => f.id === v.arabicFont) ? v.arabicFont : DEFAULT.arabicFont,
      arabicSize: SIZES.some((s) => s.id === v.arabicSize) ? v.arabicSize : DEFAULT.arabicSize,
      translationSize: SIZES.some((s) => s.id === v.translationSize) ? v.translationSize : DEFAULT.translationSize,
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
  const update = useCallback((p: Partial<Prefs>) => {
    setPrefs((cur) => { const next = { ...cur, ...p }; try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} return next; });
  }, []);
  return <Ctx.Provider value={{ prefs, update }}>{children}</Ctx.Provider>;
}
