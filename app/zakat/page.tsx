"use client";
import { useState } from "react";
import PageHead from "@/components/PageHead";

// Same categories and rates as the mobile app's calculator.
const GOLD_NISAB_G = 87.48, SILVER_NISAB_G = 612.36;
type Cat = { key: string; label: string; unit: "money" | "grams"; rate: number; group?: "wealth" };
const CATS: Cat[] = [
  { key: "cash", label: "Cash in hand", unit: "money", rate: 0.025, group: "wealth" },
  { key: "salary", label: "Salary and savings", unit: "money", rate: 0.025, group: "wealth" },
  { key: "business", label: "Business", unit: "money", rate: 0.025, group: "wealth" },
  { key: "trade", label: "Trade goods", unit: "money", rate: 0.025, group: "wealth" },
  { key: "realestate", label: "Real estate for sale", unit: "money", rate: 0.025, group: "wealth" },
  { key: "gold", label: "Gold (grams)", unit: "grams", rate: 0.025 },
  { key: "silver", label: "Silver (grams)", unit: "grams", rate: 0.025 },
  { key: "agri", label: "Agriculture (harvest value)", unit: "money", rate: 0.1 },
  { key: "mining", label: "Mining", unit: "money", rate: 0.2 },
  { key: "quarry", label: "Quarry", unit: "money", rate: 0.2 },
  { key: "treasure", label: "Treasure found", unit: "money", rate: 0.2 },
  { key: "farm", label: "Livestock (value)", unit: "money", rate: 0.025 },
];

const num = (s: string | undefined) => parseFloat(s ?? "") || 0;
const money = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function Zakat() {
  const [picked, setPicked] = useState<string[]>(["cash"]);
  const [v, setV] = useState<Record<string, string>>({});
  const [goldPrice, setGoldPrice] = useState("");
  const [silverPrice, setSilverPrice] = useState("");
  const [debts, setDebts] = useState("");
  const [natural, setNatural] = useState(true);
  const set = (k: string, x: string) => setV((p) => ({ ...p, [k]: x }));
  const toggle = (k: string) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const gp = num(goldPrice), sp = num(silverPrice);
  const nisabValue = GOLD_NISAB_G * gp;
  const lines: { label: string; note: string; due: number }[] = [];

  const wealthKeys = picked.filter((k) => CATS.find((c) => c.key === k)?.group === "wealth");
  if (wealthKeys.length) {
    const net = wealthKeys.reduce((s, k) => s + num(v[k]), 0) - num(debts);
    const ok = gp > 0 && net >= nisabValue;
    lines.push({ label: "Cash, savings, business and trade", note: gp ? (ok ? `${money(net)} after debts, 2.5%` : `${money(net)} is below the nisab of ${money(nisabValue)}`) : "Enter the gold price to check the nisab", due: ok ? net * 0.025 : 0 });
  }
  for (const k of picked) {
    const c = CATS.find((x) => x.key === k)!;
    if (c.group) continue;
    const a = num(v[k]);
    if (!a) continue;
    if (c.key === "gold" || c.key === "silver") {
      const need = c.key === "gold" ? GOLD_NISAB_G : SILVER_NISAB_G, price = c.key === "gold" ? gp : sp;
      const ok = a >= need;
      lines.push({ label: c.label.replace(" (grams)", ""), note: ok ? (price ? `${money(a)} g worth ${money(a * price)}, 2.5%` : `${money(a)} g, 2.5% is ${money(a * 0.025)} g`) : `${money(a)} g is below the nisab of ${money(need)} g`, due: ok && price ? a * price * 0.025 : 0 });
    } else {
      const rate = c.key === "agri" ? (natural ? 0.1 : 0.05) : c.rate;
      const ok = gp > 0 && a >= nisabValue;
      lines.push({ label: c.label.replace(" (harvest value)", "").replace(" (value)", ""), note: gp ? (ok ? `${money(a)} at ${rate * 100}%` : `${money(a)} is below the nisab of ${money(nisabValue)}`) : "Enter the gold price to check the nisab", due: ok ? a * rate : 0 });
    }
  }
  const total = lines.reduce((s, l) => s + l.due, 0);
  const needsGold = picked.some((k) => k !== "silver");

  return (
    <>
      <PageHead scene="dates" title="Zakat calculator" sub="Choose what you own, then enter its value. Use one currency throughout." />
      <div className="card" style={{ display: "grid", gap: 14 }}>
        <div role="group" aria-label="Categories" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATS.map((c) => <button type="button" key={c.key} aria-pressed={picked.includes(c.key)} className={"btn" + (picked.includes(c.key) ? "" : " ghost")} style={{ padding: "8px 16px" }} onClick={() => toggle(c.key)}>{c.label.replace(" (grams)", "").replace(" (harvest value)", "").replace(" (value)", "")}</button>)}
        </div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {needsGold && <label>Gold price per gram<input className="inp" type="number" min="0" value={goldPrice} onChange={(e) => setGoldPrice(e.target.value)} /></label>}
          {picked.includes("silver") && <label>Silver price per gram<input className="inp" type="number" min="0" value={silverPrice} onChange={(e) => setSilverPrice(e.target.value)} /></label>}
          {picked.map((k) => { const c = CATS.find((x) => x.key === k)!; return <label key={k}>{c.label}<input className="inp" type="number" min="0" value={v[k] ?? ""} onChange={(e) => set(k, e.target.value)} /></label>; })}
          {wealthKeys.length > 0 && <label>Debts you owe now (deducted)<input className="inp" type="number" min="0" value={debts} onChange={(e) => setDebts(e.target.value)} /></label>}
        </div>
        {picked.includes("agri") && (
          <label style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--ivory)" }}>
            <input type="checkbox" checked={natural} onChange={(e) => setNatural(e.target.checked)} /> Watered by rain or rivers (10%). Untick if irrigated by effort (5%).
          </label>
        )}
        <p className="muted" style={{ fontSize: ".85rem" }}>The nisab is {GOLD_NISAB_G} g of gold or {SILVER_NISAB_G} g of silver. This is a simplified estimate, so please ask a qualified scholar about your situation.</p>
      </div>

      <div className="card" style={{ marginTop: 16, display: "grid", gap: 10 }} aria-live="polite">
        {lines.length === 0 && <p className="muted">Enter an amount to see your zakat.</p>}
        {lines.map((l) => (
          <div key={l.label} className="row" style={{ alignItems: "flex-start" }}>
            <div><b>{l.label}</b><div className="muted" style={{ fontSize: ".85rem" }}>{l.note}</div></div>
            <b className="gold">{money(l.due)}</b>
          </div>
        ))}
        {lines.length > 0 && <div className="row" style={{ borderTop: "1px solid var(--hair)", paddingTop: 12 }}><span className="muted">Total zakat due</span><b className="gold" style={{ fontSize: "1.6rem" }}>{money(total)}</b></div>}
      </div>
    </>
  );
}
