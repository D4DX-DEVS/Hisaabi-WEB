"use client";
import { useSaved, type SavedItem } from "@/lib/saved";

export default function SaveBtn({ item }: { item: SavedItem }) {
  const { has, toggle } = useSaved();
  const on = has(item.key);
  return <button className="btn ghost sm" aria-pressed={on} onClick={() => toggle(item)}>{on ? "★ Saved" : "☆ Save"}</button>;
}
