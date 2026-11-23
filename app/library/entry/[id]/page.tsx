"use client";
import ContentBar from "@/components/ContentBar";
import Loading from "@/components/Loading";
import Title from "@/components/Title";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Gate from "@/components/Gate";
import Html from "@/components/Html";
import { useApi } from "@/lib/api";
import { pick, pickField, useLang } from "@/lib/lang";

type Tr = { english?: string; malayalam?: string; urdu?: string };
type Entry = { title?: Tr; description?: Tr; content?: string; source?: string; categoryId?: Record<string, string> };

function Body({ id }: { id: string }) {
  const { lang } = useLang();
  const { data, loading, error } = useApi<Entry>(`/content/library-entries/${id}`);
  if (loading) return <Loading />;
  if (error || !data) return <p style={{ color: "var(--danger)" }}>{error || "Article not found."}</p>;
  const html = pick(lang, data.description);
  return (
    <>
      <Title text={pick(lang, data.title) || "Library"} />
      <Link href={data.categoryId?.id ? `/library/${data.categoryId.id}` : "/library"} className="back">
        <ArrowLeft size={14} /> {data.categoryId ? pickField(lang, data.categoryId, "name") : "Library"}
      </Link>
      <ContentBar />
      <h1 className={"h1" + (lang === "urdu" ? " ur" : "")} dir={lang === "urdu" ? "rtl" : undefined} style={{ margin: "10px 0 22px" }}>{pick(lang, data.title)}</h1>
      <div className="card"><Html html={html || data.content || ""} /></div>
      {data.source?.trim() && <p className="muted" style={{ marginTop: 14, fontSize: ".85rem" }}>Source: {data.source.trim()}</p>}
    </>
  );
}

export default function LibraryEntry() {
  const id = useParams<{ id: string }>().id;
  return <Gate><Body id={id} /></Gate>;
}
