"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { GoogleAuthProvider, OAuthProvider, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signInWithPopup, type User } from "firebase/auth";

const app = getApps()[0] ?? initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const TOKEN = "hisaabi.token";
type Ctx = {
  token: string | null; ready: boolean;
  google: () => Promise<void>;
  apple: () => Promise<void>;
  email: (email: string, password: string, create: boolean) => Promise<void>;
  logout: () => void;
};
const AuthCtx = createContext<Ctx>(null as never);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // the provider also renders on the server, where there is no localStorage; pages only render in the browser
  const [token, setToken] = useState<string | null>(() => { try { return typeof window === "undefined" ? null : localStorage.getItem(TOKEN); } catch { return null; } });
  const ready = true;

  // Exchange a Firebase user for a backend JWT (same call the mobile app makes).
  const exchange = useCallback(async (u: User) => {
    const r = await fetch("/api/proxy/auth/login", {
      method: "POST",
      body: JSON.stringify({ id_token: await u.getIdToken(), uid: u.uid, email: u.email ?? "", name: u.displayName ?? "" }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.token) throw new Error(j.message || j.error || `Login failed (${r.status})`);
    localStorage.setItem(TOKEN, j.token);
    setToken(j.token);
  }, []);

  const value: Ctx = {
    token, ready,
    google: async () => exchange((await signInWithPopup(getAuth(app), new GoogleAuthProvider())).user),
    apple: async () => exchange((await signInWithPopup(getAuth(app), new OAuthProvider("apple.com"))).user),
    email: async (e, p, create) => {
      const a = getAuth(app);
      await exchange((await (create ? createUserWithEmailAndPassword(a, e, p) : signInWithEmailAndPassword(a, e, p))).user);
    },
    logout: () => { localStorage.removeItem(TOKEN); setToken(null); },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
