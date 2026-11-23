"use client";
import Loading from "@/components/Loading";
import ImageTile from "@/components/ImageTile";
import Gate from "@/components/Gate";
import PageHead from "@/components/PageHead";
import { items, useApi } from "@/lib/api";
import { catScene } from "@/lib/images";
import { pickField, useLang } from "@/lib/lang";

export type LibCat = { id: string; name: string; name_malayalam?: string; name_urdu?: string };

function List() {
  const { lang } = useLang();
  const { data, loading, error } = useApi<unknown>("/content/library-categories");
  const cats = items<LibCat>(data, "categories");
  return (
    <>
      {loading && <Loading />}
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <div className="grid">
        {cats.map((c) => <ImageTile key={c.id} href={`/library/${c.id}`} title={pickField(lang, c, "name")} {...catScene(c.name)} />)}
      </div>
    </>
  );
}

export default function Library() {
  return (
    <>
      <PageHead lang scene="book" title="Library" sub="Articles on prayer, fasting, surahs and the Sunnah." />
      <Gate><List /></Gate>
    </>
  );
}
