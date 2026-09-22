import { HomebrewSpell } from "@/lib/types";
import { SRD_ATTRIBUTION, FAN_CONTENT_DISCLAIMER } from "@/lib/srd-license";
import { detectSpellModifiers } from "@/lib/spellScan";
import rawSpells from "@/data/srd-spells.json";

export { SRD_ATTRIBUTION, FAN_CONTENT_DISCLAIMER };

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

/** "Cantrips" for level 0, otherwise "Level N". */
export const levelLabel = (lvl: number) =>
  lvl === 0 ? "Cantrips" : `Level ${lvl}`;

/** Bucket spells by level (0 = cantrip), lowest first; optionally sort each
 *  tier's spells alphabetically by name. Works for any spell-shaped record. */
export const groupByLevel = <T extends { level: number; name: string }>(
  spells: T[],
  alpha = false,
): [number, T[]][] => {
  const groups: Record<number, T[]> = {};
  for (const s of spells) (groups[s.level] ??= []).push(s);
  return Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b)
    .map((lvl) => [
      lvl,
      alpha
        ? [...groups[lvl]].sort((a, b) => a.name.localeCompare(b.name))
        : groups[lvl],
    ]);
};

/** Convert an SRD spell into the character's homebrew-spell shape for storage.
 *  Self-buff modifiers are auto-detected from the description (best-effort). */
export const toHomebrewSpell = (s: SrdSpell): Omit<HomebrewSpell, "id"> => {
  const modifiers = detectSpellModifiers(s.description);
  return {
    name: s.name,
    level: s.level,
    school: s.school,
    castingTime: s.castingTime,
    range: s.range,
    duration: s.duration,
    description: s.description,
    concentration: s.concentration,
    modifiers: modifiers.length ? modifiers : undefined,
  };
};
