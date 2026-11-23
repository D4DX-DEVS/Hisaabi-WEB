"use client";
import ContentBar from "@/components/ContentBar";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Gate from "@/components/Gate";
import { items, useApi } from "@/lib/api";
import { pick, pickField, useLang } from "@/lib/lang";

type Entry = { id: string; title?: { english?: string; malayalam?: string; urdu?: string } };
type Res = { entries?: Entry[]; category?: Record<string, string>; total_pages?: number };

function Body({ id }: { id: string }) {
  const { lang } = useLang();
  const [page, setPage] = useState(1);
  const { data, loading, error } = useApi<Res>(`/content/library-categories/${id}/entries?page=${page}&limit=30`);
  const list = items<Entry>(data, "entries");
  return (
    <>
      <Title text={data?.category ? pickField(lang, data.category, "name") : "Library"} />
      <h1 className="h1" style={{ marginTop: 8 }}>{data?.category ? pickField(lang, data.category, "name") : "Library"}</h1>
      <div style={{ height: 22 }} />
      {loading && <Loading />}
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      {!loading && !error && list.length === 0 && <p className="muted">No articles in this category yet.</p>}
      <div style={{ display: "grid", gap: 10 }}>
        {list.map((e) => (
          <Link key={e.id} href={`/library/entry/${e.id}`} className="card" style={{ padding: "16px 20px" }}>
            <span className={"display" + (lang === "urdu" ? " ur" : "")} dir={lang === "urdu" ? "rtl" : undefined} style={{ fontSize: "1.2rem" }}>{pick(lang, e.title) || "Untitled"}</span>
          </Link>
        ))}
      </div>
      {(data?.total_pages ?? 1) > 1 && (
        <div className="row" style={{ marginTop: 18 }}>
          <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="muted">{page} / {data?.total_pages}</span>
          <button className="btn" disabled={page >= (data?.total_pages ?? 1)} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}

export default function LibraryCategory() {
  const id = useParams<{ id: string }>().id;
  return (
    <>
      <Link href="/library" className="back"><ArrowLeft size={14} /> Library</Link>
      <ContentBar />
      <Gate><Body id={id} /></Gate>
    </>
  );
}
