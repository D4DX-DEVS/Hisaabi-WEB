"use client";
import Loading from "@/components/Loading";
import ImageTile from "@/components/ImageTile";
import Gate from "@/components/Gate";
import PageHead from "@/components/PageHead";
import { items, useApi } from "@/lib/api";
import { catScene } from "@/lib/images";
import { pickField, useLang } from "@/lib/lang";

export type SpecialCat = { id: string; name: string; name_malayalam?: string; name_urdu?: string; parentId?: string | { id: string } | null };

function List() {
  const { lang } = useLang();
  const { data, loading, error } = useApi<unknown>("/content/special-categories");
  const top = items<SpecialCat>(data, "categories").filter((c) => !c.parentId);
  return (
    <>
      {loading && <Loading />}
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <div className="grid">
        {top.map((c) => <ImageTile key={c.id} href={`/special/${c.id}`} title={pickField(lang, c, "name")} {...catScene(c.name)} />)}
      </div>
    </>
  );
}

export default function Special() {
  return (
    <>
      <PageHead lang scene="hands" title="Special duas" sub="Quranic duas, duas of the Prophets, Janaza, and Hajj and Umrah." />
      <Gate><List /></Gate>
    </>
  );
}
