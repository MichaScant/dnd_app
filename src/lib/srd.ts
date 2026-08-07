import { HomebrewSpell } from "@/lib/types";
import rawSpells from "@/data/srd-spells.json";

/**
 * A spell from the D&D 5e System Reference Document (SRD 5.1).
 * Source data: https://www.dnd5eapi.co / 5e-bits, derived from SRD 5.1,
 * © Wizards of the Coast, licensed under CC BY 4.0. See SRD_ATTRIBUTION.
 */
export interface SrdSpell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  classes: string[]; // class names that can cast it, e.g. ["Sorcerer", "Wizard"]
  description: string;
}

/** Attribution required by CC BY 4.0 — surface this wherever the data is shown. */
export const SRD_ATTRIBUTION =
  "Spell data from the System Reference Document 5.1, © Wizards of the Coast, licensed under CC BY 4.0.";

export const SRD_SPELLS = rawSpells as unknown as SrdSpell[];

/** Sorted, de-duplicated list of classes that appear in the SRD spell list. */
export const SRD_CLASSES: string[] = [
  ...new Set(SRD_SPELLS.flatMap((s) => s.classes)),
].sort();

/** Spells castable by a class (or all spells when className is null). */
export const spellsForClass = (className: string | null): SrdSpell[] =>
  className === null
    ? SRD_SPELLS
    : SRD_SPELLS.filter((s) => s.classes.includes(className));

/** Bucket spells by level (0 = cantrip) for "class then level" display. */
export const groupByLevel = (spells: SrdSpell[]): [number, SrdSpell[]][] => {
  const byLevel = new Map<number, SrdSpell[]>();
  for (const s of spells) {
    const bucket = byLevel.get(s.level) ?? [];
    bucket.push(s);
    byLevel.set(s.level, bucket);
  }
  return [...byLevel.entries()].sort((a, b) => a[0] - b[0]);
};

/** Convert an SRD spell into the character's homebrew-spell shape for storage. */
export const toHomebrewSpell = (s: SrdSpell): Omit<HomebrewSpell, "id"> => ({
  name: s.name,
  level: s.level,
  school: s.school,
  castingTime: s.castingTime,
  range: s.range,
  duration: s.duration,
  description: s.description,
  concentration: s.concentration,
});
