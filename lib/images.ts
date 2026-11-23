import type { Scene } from "@/components/Art";
import { SCENE_LIST } from "@/components/Art";

/** One illustration per section, drawn in the app palette. `hue` varies the backdrop when a scene repeats. */
export const SECTION_SCENE: Record<string, { scene: Scene; hue: number }> = {
  "/quran": { scene: "mushaf", hue: 0 }, "/tasbeeh": { scene: "beads", hue: 0 }, "/duas": { scene: "hands", hue: 0 }, "/adhkar": { scene: "lantern", hue: 0 },
  "/names": { scene: "star", hue: 0 }, "/hadith": { scene: "arch", hue: 0 }, "/quotes": { scene: "leaf", hue: 0 }, "/calendar": { scene: "moon", hue: 0 },
  "/zakat": { scene: "dates", hue: 0 }, "/ramadan": { scene: "mosque", hue: 1 }, "/mecca": { scene: "kaaba", hue: 0 }, "/ai": { scene: "chat", hue: 0 },
  "/saved": { scene: "bookmark", hue: 0 },
  "/library": { scene: "book", hue: 2 }, "/feedback": { scene: "lantern", hue: 1 }, "/importance": { scene: "arch", hue: 1 }, "/special": { scene: "hands", hue: 1 },
};

const SCENE_WORDS: [RegExp, Scene][] = [
  [/daily|morning|evening|waking/i, "moon"], [/feel|emotion|sad|happy|anx|distress/i, "hands"], [/prayer|salah|salat|namaz|mosque|masjid/i, "mosque"],
  [/famil|parent|child|marri|home/i, "lantern"], [/food|drink|eat|meal|fast|iftar/i, "dates"], [/travel|journey|hajj|umrah|mecca|makkah/i, "kaaba"],
  [/sick|ill|health|heal|ablution|wudu|toilet|clean/i, "drop"], [/protect|guard|safe|fear/i, "arch"], [/nature|rain|wind|weather|animal/i, "leaf"],
  [/manner|virtue|good|ethic|character/i, "star"], [/guidance|hidayat|hidayah|forgiv|repent|quran|knowledge/i, "book"], [/dhikr|tasbeeh|remember/i, "beads"],
];
/** Illustration for a category: keyword match first, else a stable pick from the whole set. */
export function catScene(name = ""): { scene: Scene; hue: number } {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hit = SCENE_WORDS.find(([re]) => re.test(name));
  return { scene: hit ? hit[1] : SCENE_LIST[h % SCENE_LIST.length], hue: h % 3 };
}
