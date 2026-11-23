"use client";
import { useEffect, useState } from "react";
import { useAuth } from "./auth";

/** GET a backend path (e.g. "/content/duas?limit=50"). Logs out on 401. */
export function useApi<T>(path: string | null) {
  const { token, logout } = useAuth();
  // keep each result tagged with the path it answers, so a stale answer is never shown for a new path
  const [res, setRes] = useState<{ path: string; data?: T; error?: string } | null>(null);
  useEffect(() => {
    if (!token || !path) return;
    let live = true;
    fetch("/api/proxy" + path, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (r.status === 401) { logout(); return; }
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        const data = (await r.json()) as T;
        if (live) setRes({ path, data });
      })
      .catch((e) => live && setRes({ path, error: e.message }));
    return () => { live = false; };
  }, [path, token, logout]);
  const current = res && res.path === path ? res : null;
  return { data: current?.data ?? null, error: current?.error ?? "", loading: !!token && !!path && !current };
}

/** Backend lists come back as {<name>: [...]} or {data: [...]}. */
export const items = <T,>(j: unknown, key: string): T[] => {
  const o = j as Record<string, unknown> | null;
  return ((o?.[key] ?? o?.data) as T[]) ?? [];
};

/** First array found in a response, for lists whose key name varies. */
export const firstArray = <T,>(j: unknown): T[] => {
  const o = j as Record<string, unknown> | null;
  return (Object.values(o ?? {}).find((v) => Array.isArray(v)) as T[]) ?? [];
};
