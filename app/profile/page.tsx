"use client";
import Loading from "@/components/Loading";
import { useState } from "react";
import Gate from "@/components/Gate";
import PageHead from "@/components/PageHead";
import { useApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Profile = { name?: string; email?: string; gender?: string | null; dob?: string | null };

function Form({ u }: { u: Profile }) {
  const { token } = useAuth();
  const locked = !!u.gender; // the app locks gender once it is set
  const [name, setName] = useState(u.name ?? "");
  const [dob, setDob] = useState(u.dob ? u.dob.slice(0, 10) : "");
  const [gender, setGender] = useState(u.gender ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [err, setErr] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setErr("Please enter your name."); setState("error"); return; }
    if (!locked && gender && !confirm("Gender can't be changed after you save it. Continue?")) return;
    setState("saving"); setErr("");
    try {
      const r = await fetch("/api/proxy/user/profile", {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), email: u.email, ...(!locked && gender ? { gender } : {}), dob: dob ? new Date(dob).toISOString() : null }),
      });
      if (!r.ok) throw new Error(`Couldn't save (${r.status}). Please try again.`);
      setState("saved");
    } catch (x) { setErr((x as Error).message); setState("error"); }
  }

  return (
    <form className="card" onSubmit={save} style={{ display: "grid", gap: 16, maxWidth: 520 }}>
      <label>Name<input className="inp" value={name} onChange={(e) => { setName(e.target.value); setState("idle"); }} autoComplete="name" /></label>
      <label>Email<input className="inp" value={u.email ?? ""} readOnly aria-readonly style={{ opacity: 0.7 }} /></label>
      <label>Date of birth<input className="inp" type="date" value={dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => { setDob(e.target.value); setState("idle"); }} /></label>
      <fieldset style={{ border: 0, padding: 0 }}>
        <legend className="muted" style={{ fontSize: ".85rem", marginBottom: 6 }}>Gender{locked ? " (locked)" : ""}</legend>
        <div style={{ display: "flex", gap: 8 }}>
          {[["m", "Male"], ["f", "Female"]].map(([v, l]) => (
            <button type="button" key={v} disabled={locked} aria-pressed={gender === v} className={"btn" + (gender === v ? "" : " ghost")} onClick={() => { setGender(v); setState("idle"); }}>{l}</button>
          ))}
        </div>
      </fieldset>
      {err && <p role="alert" style={{ color: "var(--danger)" }}>{err}</p>}
      {state === "saved" && <p className="gold" role="status">Saved.</p>}
      <button className="btn" disabled={state === "saving"} style={{ justifySelf: "start" }}>{state === "saving" ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

function Body() {
  const { data, loading, error } = useApi<Record<string, unknown>>("/user/profile");
  if (loading) return <Loading />;
  if (error || !data) return <p style={{ color: "var(--danger)" }}>{error || "Couldn't load your profile."}</p>;
  const u = ((data.user ?? data.data ?? data) as Profile);
  return <Form u={u} />;
}

export default function ProfilePage() {
  return (
    <>
      <PageHead scene="lantern" title="Edit profile" sub="Your name and details on your Hisaabi account." />
      <Gate><Body /></Gate>
    </>
  );
}
