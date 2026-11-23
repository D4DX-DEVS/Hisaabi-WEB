"use client";
import ContentBar from "@/components/ContentBar";
import { tidy } from "@/lib/text";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import Gate from "@/components/Gate";
import { items, useApi } from "@/lib/api";
import SaveBtn from "@/components/SaveBtn";
import Tx from "@/components/Tx";
import { pick, useLang } from "@/lib/lang";

type H = { _id?: string; arabic_text?: string; english?: string; malayalam?: string; reported_by?: string; urdu?: string };

function Body({ id }: { id: string }) {
  const { lang } = useLang();
  const [page, setPage] = useState(1);
  const { data, loading, error } = useApi<{ total?: number; limit?: number }>(`/content/hadees?category=${id}&page=${page}&limit=20`);
  const list = items<H>(data, "hadees");
  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 20)));
  return (
    <>
      {loading && <Loading />}
      {error && <p style={{ color: "#ff6b60" }}>{error}</p>}
      {list.map((h) => (
        <div key={h._id} className="card" style={{ marginBottom: 12 }}>
          {h.arabic_text && <p className="ar" style={{ fontSize: "1.5rem", whiteSpace: "pre-line" }}>{tidy(h.arabic_text)}</p>}
          <Tx text={pick(lang, h as { english?: string; malayalam?: string; urdu?: string })} style={{ marginTop: 8 }} />
          {h.reported_by && <div className="gold" style={{ marginTop: 8, fontSize: ".85rem" }}>{h.reported_by}</div>}
          <div style={{ marginTop: 8 }}><SaveBtn item={{ key: "hadith:" + h._id, kind: "hadith", title: h.reported_by, arabic: h.arabic_text, malayalam: h.malayalam, english: h.english }} /></div>
        </div>
      ))}
      <div className="row">
        <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
        <span className="muted">{page} / {pages}</span>
        <button className="btn" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next →</button>
      </div>
    </>
  );
}

export default function HadithCategory() {
  const id = useParams<{ id: string }>().id;
  return (
    <>
      <Title text="Hadith" />
      <Link href="/hadith" className="back"><ArrowLeft size={14} /> Categories</Link>
      <ContentBar />
      <h1 className="h1" style={{ marginTop: 8 }}>Hadith</h1>
      <Gate><Body id={id} /></Gate>
    </>
  );
}
