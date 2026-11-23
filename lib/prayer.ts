"use client";
import { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";

export const METHODS = [
  "MuslimWorldLeague", "Egyptian", "Karachi", "UmmAlQura", "Dubai", "Qatar", "Kuwait", "Singapore", "NorthAmerica", "Turkey", "MoonsightingCommittee", "Tehran",
] as const;

export type Settings = { method: (typeof METHODS)[number]; hanafi: boolean };
export type Loc = { lat: number; lon: number } | null;

const KEY = "hisaabi.prayer";

// Dart enum names the mobile app stores in the account -> adhan method names.
const ACCOUNT_METHOD: Record<string, Settings["method"]> = {
  muslim_world_league: "MuslimWorldLeague", north_america: "NorthAmerica", umm_al_qura: "UmmAlQura", egyptian: "Egyptian",
  karachi: "Karachi", dubai: "Dubai", qatar: "Qatar", kuwait: "Kuwait", singapore: "Singapore", turkey: "Turkey", tehran: "Tehran",
};

const stored = (): { s?: Settings; loc?: Loc } => { try { return JSON.parse(localStorage.getItem(KEY) || "{}") ?? {}; } catch { return {}; } };

// Pages render only in the browser (see Shell), so reading localStorage in the initialisers is safe.
/** Writes the calculation method and madhab back to the account, the same keys the mobile app uses. */
export async function saveAccountPrayer(token: string, s: Settings) {
  const method = Object.entries(ACCOUNT_METHOD).find(([, v]) => v === s.method)?.[0];
  if (!method) return false; // no equivalent in the mobile app, keep it on this browser only
  const r = await fetch("/api/proxy/user/settings", {
    method: "PUT", headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ settings: { prayer_location: { method, madhab: s.hanafi ? 1 : 0 } } }),
  });
  return r.ok;
}

export function usePrayerSettings() {
  const [s, setS] = useState<Settings>(() => stored().s ?? { method: "MuslimWorldLeague", hanafi: false });
  const [loc, setLoc] = useState<Loc>(() => stored().loc ?? null);
  const [err, setErr] = useState("");
  const { token } = useAuth();
  useEffect(() => {
    if (loc) return;
    const askBrowser = () => navigator.geolocation?.getCurrentPosition(
      (p) => setLoc({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => setErr("Location blocked. Allow location access to see local prayer times."),
    );
    // signed in: continue with the location and method saved by the mobile app
    if (!token) { askBrowser(); return; }
    fetch("/api/proxy/user/settings", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const pl = (j?.settings ?? j?.data ?? j)?.prayer_location;
        if (pl?.latitude != null && pl?.longitude != null) {
          setLoc({ lat: pl.latitude, lon: pl.longitude });
          setS({ method: ACCOUNT_METHOD[pl.method] ?? "MuslimWorldLeague", hanafi: pl.madhab === 1 });
        } else askBrowser();
      })
      .catch(askBrowser);
  }, [token, loc]);
  useEffect(() => {
    if (loc) try { localStorage.setItem(KEY, JSON.stringify({ s, loc })); } catch {}
  }, [s, loc]);
  const update = (next: Settings) => { setS(next); if (token) saveAccountPrayer(token, next).catch(() => {}); };
  return { s, setS, update, loc, setLoc, err };
}

export function compute(loc: NonNullable<Loc>, s: Settings, date = new Date()) {
  const params = CalculationMethod[s.method]();
  params.madhab = s.hanafi ? Madhab.Hanafi : Madhab.Shafi;
  return new PrayerTimes(new Coordinates(loc.lat, loc.lon), date, params);
}

export const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** Today's five prayers as a timeline, plus the next one and its countdown. */
export function dayView(loc: NonNullable<Loc>, s: Settings, now: Date) {
  const t = compute(loc, s, now);
  const times = [{ name: "Fajr", at: t.fajr }, { name: "Dhuhr", at: t.dhuhr }, { name: "Asr", at: t.asr }, { name: "Maghrib", at: t.maghrib }, { name: "Isha", at: t.isha }];
  const n = t.nextPrayer(now);
  const next = n === "none" || n === "sunrise" ? (n === "sunrise" ? "Dhuhr" : null) : n[0].toUpperCase() + n.slice(1);
  const target = next ? times.find((x) => x.name === next)!.at : null;
  const left = target ? Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000)) : 0;
  const remaining = [Math.floor(left / 3600), Math.floor(left / 60) % 60, left % 60].map((x) => String(x).padStart(2, "0")).join(":");
  return { times, sunrise: t.sunrise, next, remaining };
}
