"use client";
import ContentBar from "@/components/ContentBar";
import { tidy } from "@/lib/text";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Gate from "@/components/Gate";
import ImageTile from "@/components/ImageTile";
import SaveBtn from "@/components/SaveBtn";
import Tx from "@/components/Tx";
import { items, useApi } from "@/lib/api";
import { catScene } from "@/lib/images";
import { pickField, useLang } from "@/lib/lang";
import type { SpecialCat } from "../page";

type Entry = { id: string; data: Record<string, string | number | undefined> };
type Res = { entries?: Entry[]; category?: SpecialCat; total_pages?: number };

const text = (d: Entry["data"], base: string, lang: string) =>
  String(d[`${base}_${lang}`] || d[`${base}_english`] || d[`${base}_malayalam`] || d[`${base}_urdu`] || "");

function Body({ id }: { id: string }) {
  const { lang } = useLang();
  const [page, setPage] = useState(1);
  const cats = useApi<unknown>("/content/special-categories");
  const res = useApi<Res>(`/content/special-categories/${id}/entries?page=${page}&limit=20`);
  const children = items<SpecialCat>(cats.data, "categories").filter((c) => (typeof c.parentId === "object" ? c.parentId?.id : c.parentId) === id); // the backend sends the parent as an object
  const list = items<Entry>(res.data, "entries");
  const cat = res.data?.category;
  return (
    <>
      <h1 className="h1" style={{ marginTop: 8 }}>{cat ? pickField(lang, cat as unknown as Record<string, unknown>, "name") : "Special duas"}</h1>
      <div style={{ height: 22 }} />
      {children.length > 0 && (
        <div className="grid" style={{ marginBottom: 22 }}>
          {children.map((c) => <ImageTile key={c.id} href={`/special/${c.id}`} title={pickField(lang, c, "name")} {...catScene(c.name)} />)}
        </div>
      )}
      {res.loading && <Loading />}
      {res.error && <p style={{ color: "var(--danger)" }}>{res.error}</p>}
      {!res.loading && !res.error && list.length === 0 && children.length === 0 && <p className="muted">Nothing here yet.</p>}
      {list.map((e) => {
        const d = e.data, title = String(d.title_english || ""), ar = String(d.arabic_text || ""), tr = text(d, "translation", lang), desc = text(d, "description", lang);
        return (
          <article key={e.id} className="card" style={{ marginBottom: 12 }}>
            <div className="row">
              <b className="gold">{title}</b>
              {d.count ? <span className="gold">×{d.count}</span> : null}
              <SaveBtn item={{ key: "special:" + e.id, kind: "dua", title, arabic: ar, malayalam: text(d, "translation", "malayalam"), english: text(d, "translation", "english") }} />
            </div>
            {ar && <p className="ar" style={{ fontSize: "1.6rem", margin: "8px 0", whiteSpace: "pre-line" }}>{tidy(ar)}</p>}
            <Tx text={tr} />
            <Tx text={desc} muted style={{ marginTop: 6, fontSize: ".9rem" }} />
          </article>
        );
      })}
      {(res.data?.total_pages ?? 1) > 1 && (
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="muted">{page} / {res.data?.total_pages}</span>
          <button className="btn" disabled={page >= (res.data?.total_pages ?? 1)} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}

export default function SpecialCategory() {
  const id = useParams<{ id: string }>().id;
  return (
    <>
      <Title text="Special duas" />
      <Link href="/special" className="back"><ArrowLeft size={14} /> Special duas</Link>
      <ContentBar />
      <Gate><Body id={id} /></Gate>
    </>
  );
}
