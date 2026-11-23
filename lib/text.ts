/** Admin-entered Arabic often has blank lines between phrases; keep line breaks but drop the empty ones. */
export const tidy = (s?: string | null) => (s ?? "").replace(/\r/g, "").replace(/\n[ \t]*\n+/g, "\n").trim();
