"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";

export type SavedItem = { key: string; kind: "dua" | "hadith" | "quote"; title?: string; arabic?: string; malayalam?: string; english?: string };
export type SyncState = "signed-out" | "syncing" | "synced" | "device-only";
const KEY = "hisaabi.saved";
const MAX = 200;

const read = (): SavedItem[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
const write = (l: SavedItem[]) => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {} };
const merge = (a: SavedItem[], b: SavedItem[]) => [...a, ...b.filter((x) => !a.some((y) => y.key === x.key))].slice(0, MAX);

const settingsUrl = "/api/proxy/user/settings";
async function pull(token: string): Promise<SavedItem[] | null> {
  const r = await fetch(settingsUrl, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  const j = await r.json();
  const items = (j?.settings ?? j?.data ?? j)?.web_saved?.items;
  return Array.isArray(items) ? items : [];
}
/** Saves the list to the account, then reads it back to confirm the backend really kept it. */
async function push(token: string, items: SavedItem[]) {
  const r = await fetch(settingsUrl, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ settings: { web_saved: { version: 1, items } } }) });
  if (!r.ok) return false;
  const back = await pull(token);
  return back !== null && back.length === items.length;
}

/** Bookmarks: kept in this browser, and in your account when signed in so other browsers see them. The mobile app keeps its own list on the phone. */
export function useSaved() {
  const { token } = useAuth();
  const [list, setList] = useState<SavedItem[]>(read);
  const [sync, setSync] = useState<SyncState>(token ? "syncing" : "signed-out");

  useEffect(() => {
    if (!token) return;
    let live = true;
    (async () => {
      try {
        const remote = await pull(token);
        if (!live) return;
        const merged = merge(read(), remote ?? []);
        write(merged); setList(merged);
        // write back only if the merge added something the account didn't have
        const ok = merged.length === (remote?.length ?? 0) ? remote !== null : await push(token, merged);
        if (live) setSync(ok ? "synced" : "device-only");
      } catch { if (live) setSync("device-only"); }
    })();
    return () => { live = false; };
  }, [token]);

  const toggle = useCallback((it: SavedItem) => {
    const cur = read();
    const next = cur.some((x) => x.key === it.key) ? cur.filter((x) => x.key !== it.key) : [it, ...cur].slice(0, MAX);
    write(next); setList(next);
    if (token) { setSync("syncing"); push(token, next).then((ok) => setSync(ok ? "synced" : "device-only")).catch(() => setSync("device-only")); }
  }, [token]);

  return { list, toggle, sync: token ? sync : ("signed-out" as SyncState), has: (k: string) => list.some((x) => x.key === k) };
}
