"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import PageHead from "@/components/PageHead";

const COUNTRIES: [string, string][] = [["India", "+91"], ["Saudi Arabia", "+966"], ["UAE", "+971"], ["Qatar", "+974"], ["Kuwait", "+965"], ["Oman", "+968"], ["Bahrain", "+973"], ["United Kingdom", "+44"], ["United States", "+1"], ["Canada", "+1"], ["Australia", "+61"], ["Pakistan", "+92"], ["Bangladesh", "+880"], ["Malaysia", "+60"], ["Singapore", "+65"], ["Indonesia", "+62"], ["Sri Lanka", "+94"], ["Maldives", "+960"], ["Turkey", "+90"], ["Egypt", "+20"], ["Germany", "+49"], ["France", "+33"]];
const PLATFORMS = [["android", "Android"], ["ios", "iOS"], ["all", "All"]] as const;
const TARGETS = [["android", "Android"], ["ios", "iOS"], ["both", "Both"]] as const;
const CATEGORIES = [["ui_ux", "UI/UX improvement"], ["content", "Content feature"], ["performance", "Performance or speed"], ["accessibility", "Accessibility"], ["other", "Other"]] as const;
const rating = (stars: number) => (stars >= 5 ? "excellent" : stars >= 4 ? "good" : stars >= 3 ? "average" : "poor");

export default function Feedback() {
  const [kind, setKind] = useState<"feedback" | "feature-request">("feedback");
  const [stars, setStars] = useState(0);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const togglePlatform = (p: string) => setPlatforms((cur) => p === "all" ? (cur.includes("all") ? [] : ["all"]) : cur.includes(p) ? cur.filter((x) => x !== p) : [...cur.filter((x) => x !== "all"), p]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const base = { name: f.get("name"), email: f.get("email"), phone: `${f.get("code")}${String(f.get("phone") ?? "").trim()}`, website: f.get("website") };
    let body: Record<string, unknown>;
    if (kind === "feedback") {
      if (!stars) return setErr("Please select a rating.");
      if (!platforms.length) return setErr("Please select at least one option.");
      body = { ...base, platform: platforms.join(", "), rating: rating(stars), message: f.get("message") };
    } else {
      body = { ...base, target_platform: f.get("target"), category: f.get("category"), title: f.get("title"), description: f.get("description") };
    }
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/api/send/${kind}`, { method: "POST", body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Couldn't send right now. Please try again.");
      setDone(true);
    } catch (x) { setErr((x as Error).message); }
    finally { setBusy(false); }
  }

  if (done) return (
    <>
      <PageHead scene="lantern" title="Thank you" sub="Your message was sent to the Hisaabi team." />
      <button className="btn ghost" onClick={() => { setDone(false); setStars(0); setPlatforms([]); }}>Send another</button>
    </>
  );

  return (
    <>
      <PageHead scene="lantern" title="Feedback" sub="Tell us what works and what doesn't, or suggest a feature." />
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className={"btn" + (kind === "feedback" ? "" : " ghost")} onClick={() => { setKind("feedback"); setErr(""); }}>Feedback</button>
        <button className={"btn" + (kind === "feature-request" ? "" : " ghost")} onClick={() => { setKind("feature-request"); setErr(""); }}>Feature request</button>
      </div>
      <form className="card" onSubmit={submit} style={{ display: "grid", gap: 14, maxWidth: 640 }} noValidate>
        <label>Name<input className="inp" name="name" required autoComplete="name" /></label>
        <label>Email<input className="inp" name="email" type="email" required autoComplete="email" /></label>
        <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 }}>
          <label>Country code
            <select className="inp" name="code" defaultValue="+91">{COUNTRIES.map(([n, c]) => <option key={n} value={c}>{n} {c}</option>)}</select>
          </label>
          <label>Phone<input className="inp" name="phone" type="tel" inputMode="tel" required autoComplete="tel-national" /></label>
        </div>
        {kind === "feedback" ? (
          <>
            <fieldset style={{ border: 0, padding: 0 }}>
              <legend className="muted" style={{ fontSize: ".85rem", marginBottom: 6 }}>Platform</legend>
              <div style={{ display: "flex", gap: 8 }}>{PLATFORMS.map(([v, l]) => <button type="button" key={v} aria-pressed={platforms.includes(v)} className={"btn" + (platforms.includes(v) ? "" : " ghost")} onClick={() => togglePlatform(v)}>{l}</button>)}</div>
            </fieldset>
            <fieldset style={{ border: 0, padding: 0 }}>
              <legend className="muted" style={{ fontSize: ".85rem", marginBottom: 6 }}>Rating</legend>
              <div style={{ display: "flex", gap: 6 }} role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => setStars(n)} style={{ background: "none", border: 0, cursor: "pointer", minWidth: 44, minHeight: 44, display: "grid", placeItems: "center" }}><Star size={28} color="var(--gold)" fill={n <= stars ? "var(--gold)" : "none"} /></button>)}
              </div>
            </fieldset>
            <label>Your feedback<textarea className="inp" name="message" rows={5} required maxLength={4000} /></label>
          </>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label>Platform<select className="inp" name="target" defaultValue="both">{TARGETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
              <label>Category<select className="inp" name="category" defaultValue="other">{CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
            </div>
            <label>Title<input className="inp" name="title" required maxLength={150} /></label>
            <label>Describe the feature<textarea className="inp" name="description" rows={5} required maxLength={4000} /></label>
          </>
        )}
        <input name="website" aria-label="Leave this empty" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
        {err && <p role="alert" style={{ color: "var(--danger)" }}>{err}</p>}
        <button className="btn" disabled={busy} style={{ justifySelf: "start" }}>{busy ? "Sending…" : kind === "feedback" ? "Send feedback" : "Send request"}</button>
      </form>
    </>
  );
}
