"use client";
import { useCallback, useState } from "react";

const KEY = "hisaabi.mushaf.marks";
const read = (): number[] => { try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v.filter((n) => Number.isInteger(n) && n >= 1 && n <= 604) : []; } catch { return []; } };

/** Bookmarked Mushaf pages, kept in this browser. Pages render only in the browser, so the initialiser can read storage. */
export function useMushafMarks() {
  const [marks, setMarks] = useState<number[]>(read);
  const toggle = useCallback((p: number) => {
    const cur = read();
    const next = (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]).sort((a, b) => a - b);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    setMarks(next);
  }, []);
  return { marks, toggle };
}
