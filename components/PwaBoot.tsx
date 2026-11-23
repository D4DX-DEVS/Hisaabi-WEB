"use client";
import { useEffect } from "react";
import { registerSW, scheduleAlerts } from "@/lib/notify";

/** Runs once on every page: registers the service worker and re-arms today's prayer reminders. */
export default function PwaBoot() {
  useEffect(() => { registerSW(); scheduleAlerts(); }, []);
  return null;
}
