"use client";
import LangSwitch from "./LangSwitch";

/** Content language chips, placed right above the translated content they change. */
export default function ContentBar() {
  return (
    <div className="content-bar">
      <span className="label">Content language</span>
      <LangSwitch />
    </div>
  );
}
