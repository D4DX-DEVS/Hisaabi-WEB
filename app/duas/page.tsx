"use client";
import Loading from "@/components/Loading";
import PageHead from "@/components/PageHead";
import ImageTile from "@/components/ImageTile";
import { catScene } from "@/lib/images";
import { pickField, useLang } from "@/lib/lang";
import { useState } from "react";
import Gate from "@/components/Gate";
import { items, useApi } from "@/lib/api";

export type Cat = { _id?: string; id?: string; name: string; name_malayalam?: string; description?: string; parent?: unknown };

function List() {
  const { lang } = useLang();
  const [q, setQ] = useState("");
  const { data, loading, error } = useApi<unknown>(`/content/dua-categories?page=1&limit=200${q ? `&search=${encodeURIComponent(q)}` : ""}`);
  const cats = items<Cat>(data, "dua_categories").filter((c) => !c.parent);
  return (
    <>
      <input className="inp" aria-label="Search duas" placeholder="Search duas" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 16 }} />
      {loading && <Loading />}
      {error && <p style={{ color: "#ff6b60" }}>{error}</p>}
      {!loading && !error && cats.length === 0 && <p className="muted">{q ? `No duas match "${q}".` : "No dua categories yet."}</p>}
      <div className="grid">
        {cats.map((c) => (
          <ImageTile key={c._id ?? c.id} href={`/duas/${c._id ?? c.id}`} {...catScene(c.name)} title={pickField(lang, c as unknown as Record<string, unknown>, "name")} />
        ))}
      </div>
    </>
  );
}

export default function Duas() {
  return (
    <>
      <PageHead lang scene="hands" title="Duas" sub="Categorised library of duas" />
      <Gate><List /></Gate>
    </>
  );
}
