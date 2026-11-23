"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

// The Quran is read as Mushaf pages; keep old /quran/<surah> links working by sending them to that surah's first page.
export default function QuranSurahRedirect() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  useEffect(() => {
    fetch("/data/surahs.json").then((r) => r.json()).then((l: { id: number; startPage: number }[]) => {
      router.replace(`/mushaf/${l.find((s) => s.id === id)?.startPage ?? 1}`);
    });
  }, [id, router]);
  return null;
}
