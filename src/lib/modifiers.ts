import {
  STAT_KEYS,
  STAT_LABELS,
  StatKey,
  StatModifier,
  ModTarget,
} from "@/lib/types";

// Internal draft uses "all" sentinel for stat to mean "all six stats".
// It is expanded into one modifier per stat when committed.
export type StatChoice = StatKey | "all";
export type DraftMod = Omit<StatModifier, "stat"> & { stat?: StatChoice };

export const TARGET_OPTIONS: ModTarget[] = [
  "stat",
  "ac",
  "dc",
  "weaponAttack",
  "spellAttack",
  "damage",
  "save",
  "skill",
  "extraAction",
];

/** Expand any { stat: "all" } draft into one entry per ability score. */
export function expandMods(mods: DraftMod[]): StatModifier[] {
  const out: StatModifier[] = [];
  for (const m of mods) {
    const target = m.target ?? "stat";
    if ((target === "stat" || target === "save") && m.stat === "all") {
      for (const k of STAT_KEYS) {
        out.push({ target, stat: k, delta: m.delta, note: m.note });
      }
    } else {
      out.push({
        target,
        stat: m.stat === "all" ? undefined : (m.stat as StatKey | undefined),
        skill: m.skill,
        delta: m.delta,
        note: m.note,
      });
    }
  }
  return out;
}

/** Short human label for a committed modifier, used for chips. */
export function modifierLabel(m: StatModifier): string {
  const target = m.target ?? "stat";
  const sign = m.delta >= 0 ? `+${m.delta}` : `${m.delta}`;
  switch (target) {
    case "stat":
      return `${(STAT_LABELS[m.stat ?? "str"] ?? "STR").slice(0, 3).toUpperCase()} ${sign}`;
    case "save":
      return `${(STAT_LABELS[m.stat ?? "str"] ?? "STR").slice(0, 3).toUpperCase()} SAVE ${sign}`;
    case "skill":
      return `${m.skill ?? "Skill"} ${sign}`;
    case "ac":
      return `AC ${sign}`;
    case "dc":
      return `DC ${sign}`;
    case "spellAttack":
      return `Spell Hit ${sign}`;
    case "weaponAttack":
      return `Weapon Hit ${sign}`;
    case "damage":
      return `DMG ${sign}`;
    case "extraAction":
      return `Action ${sign}`;
  }
}
