"use client";
import Title from "@/components/Title";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { google, apple, email, token, logout } = useAuth();
  const router = useRouter();
  const [e, setE] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const run = (f: () => Promise<void>) => async () => {
    setBusy(true); setErr("");
    try { await f(); router.push("/"); } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  if (token) return (
    <div className="card" style={{ maxWidth: 420 }}>
      <Title text="Account" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/hisaabi_round.png" alt="" style={{ height: 52, width: 52, borderRadius: "50%", marginBottom: 14 }} />
      <h1 className="display" style={{ fontSize: "1.7rem" }}>You&apos;re signed in</h1>
      <p className="muted" style={{ margin: "6px 0 18px" }}>Duas, hadith, quotes, Ramadan and the assistant now load from your Hisaabi account.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/profile" className="btn">Edit profile</Link>
        <button className="btn ghost" onClick={logout}>Sign out</button>
      </div>
    </div>
  );
  return (
    <>
      <Title text="Sign in" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/Hisaabi-grn.png" alt="Hisaabi" style={{ height: 44, width: "auto", marginBottom: 22 }} />
      <h1 className="h1">Sign in</h1>
      <p className="sub">Sign in with the same Google or Apple account you use in the Hisaabi app to continue with your account.</p>
      <div className="card" style={{ display: "grid", gap: 10, maxWidth: 380 }}>
        <button className="btn" disabled={busy} onClick={run(google)}>Continue with Google</button>
        <button className="btn ghost" disabled={busy} onClick={run(apple)}>Continue with Apple</button>
        <div className="muted" style={{ textAlign: "center", fontSize: ".8rem", margin: "4px 0" }}>or use email</div>
        <form style={{ display: "grid", gap: 10 }} onSubmit={(ev) => { ev.preventDefault(); if (e && p) run(() => email(e, p, false))(); }}>
          <label>Email<input className="inp" type="email" autoComplete="email" value={e} onChange={(x) => setE(x.target.value)} /></label>
          <label>Password<input className="inp" type="password" autoComplete="current-password" value={p} onChange={(x) => setP(x.target.value)} /></label>
          <button className="btn ghost" disabled={busy || !e || !p}>Sign in with email</button>
        </form>
        {err && <p role="alert" style={{ color: "var(--danger)" }}>{err}</p>}
      </div>
    </>
  );
}
