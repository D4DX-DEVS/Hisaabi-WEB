"use client";
import { useEffect, useState } from "react";
import { compute, type Loc, type Settings } from "./prayer";

const FLAG = "hisaabi.notify";
const PRAYER = "hisaabi.prayer";
const NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

export const alertsSupported = () => typeof Notification !== "undefined";
export const alertsOn = () => { try { return localStorage.getItem(FLAG) === "1" && Notification.permission === "granted"; } catch { return false; } };

/** Registers the service worker once: it makes the site installable and shows notifications on phones. */
export function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  // a worker in `next dev` fights hot reload, so only production gets one
  if (process.env.NODE_ENV !== "production") { navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())); return; }
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

async function show(title: string, body: string) {
  const opts = { body, icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", tag: "hisaabi-prayer" };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) return void (await reg.showNotification(title, opts));
  } catch {}
  new Notification(title, opts);
}

let timers: ReturnType<typeof setTimeout>[] = [];

/**
 * Schedules a notification for each remaining prayer today, then again after midnight.
 * shortcut: timers only fire while the site (or installed app) is open, true background alerts need a push server, add one if reminders must arrive with the app closed.
 */
export function scheduleAlerts() {
  timers.forEach(clearTimeout); timers = [];
  if (!alertsOn()) return;
  let saved: { s?: Settings; loc?: Loc } = {};
  try { saved = JSON.parse(localStorage.getItem(PRAYER) || "{}") ?? {}; } catch {}
  if (!saved.s || !saved.loc) return;
  const now = new Date();
  const t = compute(saved.loc, saved.s, now);
  [t.fajr, t.dhuhr, t.asr, t.maghrib, t.isha].forEach((at, i) => {
    const wait = at.getTime() - now.getTime();
    if (wait > 0 && wait < 2 ** 31 - 1) timers.push(setTimeout(() => show(`${NAMES[i]} time`, `It is time for ${NAMES[i]} prayer.`), wait));
  });
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5).getTime() - now.getTime();
  timers.push(setTimeout(scheduleAlerts, midnight));
}

/** Toggle state for the prayer page. Turning on asks the browser for permission first. */
export function useAlerts() {
  const [on, setOn] = useState(alertsOn);
  const [msg, setMsg] = useState("");
  useEffect(() => { scheduleAlerts(); }, [on]);
  const toggle = async () => {
    setMsg("");
    if (on) { try { localStorage.setItem(FLAG, "0"); } catch {} return setOn(false); }
    const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (perm !== "granted") return setMsg("Notifications are blocked. Allow them for this site in your browser settings.");
    try { localStorage.setItem(FLAG, "1"); } catch {}
    setOn(true);
    show("Prayer reminders on", "You'll get a notification at each prayer time while Hisaabi is open.");
  };
  return { on, toggle, msg };
}
