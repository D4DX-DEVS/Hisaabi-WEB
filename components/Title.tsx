"use client";
import { useTitle } from "./PageHead";

/** Renders nothing; sets the browser tab title. For pages that don't use PageHead. */
export default function Title({ text }: { text: string }) {
  useTitle(text);
  return null;
}
