"use client";
import Link from "next/link";
import { useState } from "react";
import LangSwitch from "@/components/LangSwitch";
import PageHead from "@/components/PageHead";
import { ARABIC_FONTS, SIZES, THEMES, useAppearance } from "@/lib/appearance";
import { useAuth } from "@/lib/auth";
import { pick, useLang } from "@/lib/lang";
import { METHODS, usePrayerSettings } from "@/lib/prayer";

const clear = (...keys: string[]) => keys.forEach((k) => { try { localStorage.removeItem(k); } catch {} });
const SAMPLE_TRANSLATION = { english: "In the name of God, the Most Gracious, the Most Merciful.", malayalam: "പരമകാരുണികനും ദയാപരനുമായ അല്ലാഹുവിന്റെ നാമത്തില്‍.", urdu: "اللہ کے نام سے جو نہایت مہربان، بہت رحم والا ہے۔" };

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="card" style={{ display: "grid", gap: 14 }}>
      <div>
        <h2 className="display" style={{ fontSize: "1.4rem" }}>{title}</h2>
        {hint && <p className="muted" style={{ fontSize: ".88rem", marginTop: 2 }}>{hint}</p>}
      </div>
      {children}
    </section>
  );
}

export default function Settings() {
  const { token, logout } = useAuth();
  const { s, update } = usePrayerSettings();
  const { lang } = useLang();
  const { prefs, update: setPrefs } = useAppearance();
  const [note, setNote] = useState("");

  return (
    <>
      <PageHead scene="star" title="Settings" sub="Your choices are saved on this device. Prayer settings also sync with your account." />
      <div style={{ display: "grid", gap: 18 }}>
        <Card title="Theme" hint="Dark suits night reading; light is easier in daylight.">
          <div className="choice" role="group" aria-label="Theme">
            {THEMES.map((t) => <button key={t.id} type="button" aria-pressed={prefs.theme === t.id} onClick={() => setPrefs({ theme: t.id })}>{t.label}</button>)}
          </div>
        </Card>

        <Card title="Content language" hint="For duas, hadith, quotes, names of Allah, adhkar and articles. Arabic stays as it is.">
          <LangSwitch full />
        </Card>

        <Card title="Arabic font" hint="The face used for Arabic text across the app.">
          <div className="choice" role="group" aria-label="Arabic font">
            {ARABIC_FONTS.map((f) => <button key={f.id} type="button" aria-pressed={prefs.arabicFont === f.id} onClick={() => setPrefs({ arabicFont: f.id })}>{f.label}</button>)}
          </div>
          <p className="ar preview" style={{ fontSize: "1.8rem" }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
        </Card>

        <Card title="Arabic text size">
          <div className="choice" role="group" aria-label="Arabic text size">
            {SIZES.map((z) => <button key={z.id} type="button" aria-pressed={prefs.arabicSize === z.id} onClick={() => setPrefs({ arabicSize: z.id })}>{z.label}</button>)}
          </div>
          <p className="ar preview" style={{ fontSize: "1.8rem" }}>إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا</p>
        </Card>

        <Card title="Translation text size" hint="For the English, Malayalam and Urdu text under Arabic, and for articles.">
          <div className="choice" role="group" aria-label="Translation text size">
            {SIZES.map((z) => <button key={z.id} type="button" aria-pressed={prefs.translationSize === z.id} onClick={() => setPrefs({ translationSize: z.id })}>{z.label}</button>)}
          </div>
          <p className={"preview tr" + (lang === "urdu" ? " ur" : "")} dir={lang === "urdu" ? "rtl" : undefined}>{pick(lang, SAMPLE_TRANSLATION)}</p>
        </Card>

        <Card title="Prayer times">
          <label>Calculation method
            <select className="inp" value={s.method} onChange={(e) => update({ ...s, method: e.target.value as typeof s.method })}>
              {METHODS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label>Asr
            <select className="inp" value={s.hanafi ? "h" : "s"} onChange={(e) => update({ ...s, hanafi: e.target.value === "h" })}>
              <option value="s">Shafi, Maliki, Hanbali</option><option value="h">Hanafi</option>
            </select>
          </label>
          <p className="muted" style={{ fontSize: ".85rem" }}>{token ? "Changes also update your Hisaabi account, so the mobile app uses the same method." : "Sign in to sync this with your account."}</p>
        </Card>

        <Card title="Account and data">
          <p className="muted">{token ? "You're signed in." : "You're not signed in."}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {token && <Link href="/profile" className="btn ghost">Edit profile</Link>}
            {token && <button className="btn ghost" onClick={logout}>Sign out</button>}
            <button className="btn ghost" onClick={() => { clear("hisaabi.tasbeeh"); setNote("Tasbeeh count reset."); }}>Reset tasbeeh</button>
            <button className="btn ghost" onClick={() => { clear("hisaabi.prayer"); setNote("Saved location cleared. It will be asked again on the next visit."); }}>Forget saved location</button>
          </div>
          {note && <p className="gold" role="status">{note}</p>}
        </Card>
      </div>
    </>
  );
}
