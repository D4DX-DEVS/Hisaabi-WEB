"use client";
import DOMPurify from "dompurify";
import { useLang } from "@/lib/lang";

/** Backend articles are admin-written HTML. It is sanitised before it is shown, and links open in a new tab. */
export default function Html({ html }: { html: string }) {
  const { lang } = useLang();
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, ADD_ATTR: ["target"], FORBID_TAGS: ["style", "form", "input", "iframe"] })
    .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
  return <div className={"prose" + (lang === "urdu" ? " ur" : "")} dir={lang === "urdu" ? "rtl" : undefined} dangerouslySetInnerHTML={{ __html: clean }} />;
}
