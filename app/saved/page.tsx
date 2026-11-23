"use client";
import { tidy } from "@/lib/text";
import PageHead from "@/components/PageHead";
import SaveBtn from "@/components/SaveBtn";
import { useSaved } from "@/lib/saved";

export default function Saved() {
  const { list, sync } = useSaved();
  return (
    <>
      <PageHead scene="bookmark" title="Saved" sub="Duas and hadith you bookmarked" />
      <p className="muted" style={{ marginBottom: 14, fontSize: ".85rem" }} role="status">
        {{ "signed-out": "Saved on this device. Sign in to keep them in your account too.", syncing: "Syncing with your account…", synced: "Synced with your account, so other browsers show the same list.", "device-only": "Couldn't sync with your account, so these are kept on this device only." }[sync]}
      </p>
      {list.length === 0 && <p className="muted">Nothing saved yet. Use ☆ Save on a dua or hadith.</p>}
      {list.map((s) => (
        <div key={s.key} className="card" style={{ marginBottom: 12 }}>
          <div className="row"><b className="lime">{s.title || s.kind}</b><SaveBtn item={s} /></div>
          {s.arabic && <p className="ar" style={{ fontSize: "1.5rem", whiteSpace: "pre-line" }}>{tidy(s.arabic)}</p>}
          {s.malayalam && <p>{s.malayalam}</p>}
          {s.english && <p className="muted">{s.english}</p>}
        </div>
      ))}
    </>
  );
}
