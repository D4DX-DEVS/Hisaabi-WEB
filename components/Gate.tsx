"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

/** Shows children only when signed in; otherwise a sign-in prompt. */
export default function Gate({ children }: { children: React.ReactNode }) {
  const { token, ready } = useAuth();
  if (!ready) return null;
  if (!token) return (
    <div className="card" style={{ maxWidth: 420, margin: "clamp(8px, 5vh, 40px) auto 0", textAlign: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/hisaabi_round.png" alt="" style={{ height: 44, width: 44, borderRadius: "50%", marginBottom: 12 }} />
      <b className="display" style={{ fontSize: "1.4rem" }}>Sign in to continue</b>
      <p className="muted" style={{ margin: "8px 0 14px" }}>This section loads from your Hisaabi account.</p>
      <Link href="/login" className="btn">Sign in</Link>
    </div>
  );
  return <>{children}</>;
}
