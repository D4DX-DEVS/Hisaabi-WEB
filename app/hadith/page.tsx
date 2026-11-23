"use client";
import Loading from "@/components/Loading";
import PageHead from "@/components/PageHead";
import ImageTile from "@/components/ImageTile";
import { catScene } from "@/lib/images";
import { pickField, useLang } from "@/lib/lang";
import Gate from "@/components/Gate";
import { items, useApi } from "@/lib/api";

type Cat = { _id?: string; name: string; name_malayalam?: string };

function List() {
  const { lang } = useLang();
  const { data, loading, error } = useApi<unknown>("/content/hadees-categories?page=1&limit=200");
  return (
    <>
      {loading && <Loading />}
      {error && <p style={{ color: "#ff6b60" }}>{error}</p>}
      <div className="grid">
        {items<Cat>(data, "hadees_categories").map((c) => (
          <ImageTile key={c._id} href={`/hadith/${c._id}`} {...catScene(c.name)} title={pickField(lang, c as unknown as Record<string, unknown>, "name")} />
        ))}
      </div>
    </>
  );
}

export default function Hadith() {
  return (
    <>
      <PageHead lang scene="arch" title="Hadith" sub="Browse by category" />
      <Gate><List /></Gate>
    </>
  );
}
