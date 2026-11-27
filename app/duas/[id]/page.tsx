"use client";
import ContentBar from "@/components/ContentBar";
import { tidy } from "@/lib/text";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import Gate from "@/components/Gate";
import { items, useApi } from "@/lib/api";
import SaveBtn from "@/components/SaveBtn";
import Tx from "@/components/Tx";
import { pick, pickField, useLang } from "@/lib/lang";
import ImageTile from "@/components/ImageTile";
import { catScene } from "@/lib/images";
import type { Cat } from "../page";

type Dua = { _id?: string; id?: string; title?: string; title_malayalam?: string; arabic_text?: string; count?: number; malayalam?: string; english?: string };

function Body({ id }: { id: string }) {
  const { lang } = useLang();
  // the backend ignores ?parent=, so take the full list (the same one /duas loads) and keep this category's children
  const subs = useApi<unknown>("/content/dua-categories?page=1&limit=200");
  const duas = useApi<unknown>(`/content/duas?category=${id}&page=1&limit=50`);
  const sc = items<Cat>(subs.data, "dua_categories").filter((c) => {
    const p = c.parent as string | { _id?: string; id?: string } | null | undefined;
    return (typeof p === "object" && p ? p._id ?? p.id : p) === id;
  });
  const dl = items<Dua>(duas.data, "duas");
  return (
    <>
      {(subs.loading || duas.loading) && <Loading />}
      {(subs.error || duas.error) && <p style={{ color: "#ff6b60" }}>{subs.error || duas.error}</p>}
      {sc.length > 0 && <div className="grid" style={{ marginBottom: 18 }}>
        {sc.map((c) => <ImageTile key={c._id ?? c.id} href={`/duas/${c._id ?? c.id}`} {...catScene(c.name)} title={pickField(lang, c as unknown as Record<string, unknown>, "name")} />)}
      </div>}
      {dl.map((d) => (
        <div key={d._id ?? d.id} className="card" style={{ marginBottom: 12 }}>
          <div className="row"><b className="lime">{pickField(lang, d as unknown as Record<string, unknown>, "title")}</b>{d.count ? <span className="gold">×{d.count}</span> : null}<SaveBtn item={{ key: "dua:" + (d._id ?? d.id), kind: "dua", title: d.title, arabic: d.arabic_text, malayalam: d.malayalam, english: d.english }} /></div>
                    {d.arabic_text && <p className="ar" style={{ fontSize: "1.6rem", margin: "8px 0", whiteSpace: "pre-line" }}>{tidy(d.arabic_text)}</p>}
          <Tx text={pick(lang, d)} />
        </div>
      ))}
    </>
  );
}

export default function DuaCategory() {
  const id = useParams<{ id: string }>().id;
  return (
    <>
      <Title text="Duas" />
      <Link href="/duas" className="back"><ArrowLeft size={14} /> All duas</Link>
      <ContentBar />
      <h1 className="h1" style={{ marginTop: 8 }}>Duas</h1>
      <Gate><Body id={id} /></Gate>
    </>
  );
}
