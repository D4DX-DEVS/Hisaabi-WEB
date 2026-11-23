"use client";
import PageHead from "@/components/PageHead";
import { useRef, useState } from "react";
import Gate from "@/components/Gate";
import { useAuth } from "@/lib/auth";

type Msg = { role: "user" | "assistant" | "system"; content: string };
const SYSTEM: Msg = { role: "system", content: "You are Hisaabi's Islamic assistant. Give concise, respectful answers grounded in the Quran and authentic hadith. Say when scholars differ, and suggest consulting a qualified scholar for rulings." };

const STARTERS = ["What are the five pillars of Islam?", "How do I perform wudu?", "Give me a dua for anxiety", "What are the benefits of Surah al-Kahf?"];

function Chat() {
  const { token, logout } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const end = useRef<HTMLDivElement>(null);

  async function send(preset?: string) {
    const t = (preset ?? text).trim();
    if (!t || busy) return;
    const next = [...msgs, { role: "user" as const, content: t }];
    setMsgs(next); setText(""); setBusy(true); setErr("");
    try {
      const r = await fetch("/api/proxy/ai-assistant/chat", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: [SYSTEM, ...next], temperature: 0.4, max_tokens: 2048 }),
      });
      if (r.status === 401) { logout(); return; }
      if (r.status === 429) throw new Error("You've reached the AI assistant limit. Try again later.");
      if (!r.ok) throw new Error(`AI service error (${r.status})`);
      const j = await r.json();
      setMsgs([...next, { role: "assistant", content: j.choices?.[0]?.message?.content ?? "No answer." }]);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); setTimeout(() => end.current?.scrollIntoView({ behavior: "smooth" }), 50); }
  }

  return (
    <>
      {msgs.length === 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="display" style={{ fontSize: "1.3rem", marginBottom: 4 }}>Ask anything about your deen</p>
          <p className="muted" style={{ marginBottom: 14 }}>Try one of these, or type your own question below.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STARTERS.map((q) => <button key={q} type="button" className="btn ghost sm" onClick={() => send(q)} disabled={busy}>{q}</button>)}
          </div>
        </div>
      )}
      <div style={{ display: "grid", gap: 10, marginBottom: 14 }} role="log" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className="card" style={{ maxWidth: "85%", marginLeft: m.role === "user" ? "auto" : 0, background: m.role === "user" ? "var(--lime)" : undefined, color: m.role === "user" ? "var(--dark)" : undefined, whiteSpace: "pre-wrap" }}>{m.content}</div>
        ))}
        {busy && <p className="muted">Thinking…</p>}
        {err && <p role="alert" style={{ color: "var(--danger)" }}>{err}</p>}
        <div ref={end} />
      </div>
      <form className="row" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input className="inp" aria-label="Your question" placeholder="Ask an Islamic question" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn" disabled={busy}>Send</button>
      </form>
    </>
  );
}

export default function AI() {
  return (
    <>
      <PageHead scene="chat" title="AI Assistant" sub="General guidance only. Ask a qualified scholar for rulings." />
      <Gate><Chat /></Gate>
    </>
  );
}
