"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Opens the page you last read.
export default function MushafHome() {
  const router = useRouter();
  useEffect(() => {
    let p = 1;
    try { p = Number(localStorage.getItem("hisaabi.mushaf.page")) || 1; } catch {}
    router.replace(`/mushaf/${Math.min(604, Math.max(1, p))}`);
  }, [router]);
  return null;
}
