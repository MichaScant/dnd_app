import { Character, Stats, StatKey, modifier } from "@/lib/types";

// Standard 5e preparing casters: ability + class level (full) or half level
// (half-casters). Known casters (Bard/Sorcerer/Ranger/Warlock) don't prepare.
const PREP_CLASSES: Record<
  string,
  { ability: StatKey; div: 1 | 2; roundUp?: boolean }
> = {
  cleric: { ability: "wis", div: 1 },
  druid: { ability: "wis", div: 1 },
  wizard: { ability: "int", div: 1 },
  paladin: { ability: "cha", div: 2 },
  artificer: { ability: "int", div: 2, roundUp: true },
};

/** Levels per class, from the Leveling tab (preferred), else the class summary. */
export function classLevels(c: Character): { name: string; level: number }[] {
  const table = c.levelTable ?? [];
  if (table.length) {
    const m = new Map<string, number>();
    for (const e of table) {
      const n = (e.className ?? "").trim();
      // Each row carries its class's level directly now (was: one row per
      // character level, so we counted rows). Sum in case a class is listed twice.
      if (n) m.set(n, (m.get(n) ?? 0) + (e.level || 0));
    }
    if (m.size) return [...m].map(([name, level]) => ({ name, level }));
  }
  // Fallback: parse a summary like "Warlock 3 / Bard 2".
  const parsed: { name: string; level: number }[] = [];
  for (const part of (c.classSummary ?? "").split(/[/,]/)) {
    const mm = part.trim().match(/^(.+?)\s+(\d+)$/);
    if (mm) parsed.push({ name: mm[1].trim(), level: Number(mm[2]) });
  }
  if (parsed.length) return parsed;
  // Single class: first homebrew class (or the summary word) at total level.
  const name =
    c.classes?.[0]?.name ??
    (c.classSummary ?? "").replace(/[\d/].*$/, "").trim();
  return name ? [{ name, level: c.level || 1 }] : [];
}

/**
 * Standard 5e number of prepared spells, summed across preparing classes
 * (multiclassing: each class prepares from its own level & ability).
 */
export function standardPreparedMax(
  c: Character,
  stats: Stats,
): { total: number; breakdown: string } {
  const parts: string[] = [];
  let total = 0;
  for (const { name, level } of classLevels(c)) {
    const info = PREP_CLASSES[name.trim().toLowerCase()];
    if (!info) continue; // non-preparing / unknown class
    const mod = modifier(stats[info.ability]);
    const lvlPart =
      info.div === 2
        ? info.roundUp
          ? Math.ceil(level / 2)
          : Math.floor(level / 2)
        : level;
    const count = Math.max(1, mod + lvlPart);
    total += count;
    parts.push(
      `${name} ${level} (${info.ability.toUpperCase()} ${mod >= 0 ? "+" : ""}${mod} + ${lvlPart} = ${count})`,
    );
  }
  return { total, breakdown: parts.join(" + ") };
}

/** Variables available in a custom prepared-spells formula. */
export function preparedVars(
  c: Character,
  stats: Stats,
): Record<string, number> {
  return {
    level: c.level || 1,
    pb: c.proficiencyBonus,
    str: modifier(stats.str),
    dex: modifier(stats.dex),
    con: modifier(stats.con),
    int: modifier(stats.int),
    wis: modifier(stats.wis),
    cha: modifier(stats.cha),
  };
}

/**
 * Evaluate a user's prepared-spells formula (e.g. "wis + level", "floor(int/2)+5").
 * Variables are substituted with numbers; only arithmetic + floor/ceil/round/
 * min/max survive, so the resulting expression is safe. Returns null if invalid.
 */
export function evalPreparedFormula(
  formula: string,
  vars: Record<string, number>,
): number | null {
  if (!formula.trim()) return null;
  let expr = ` ${formula.toLowerCase()} `;
  for (const [k, v] of Object.entries(vars)) {
    expr = expr.replace(new RegExp(`\\b${k}\\b`, "g"), `(${v})`);
  }
  expr = expr.replace(/\b(floor|ceil|round|min|max)\b/g, "Math.$1");
  // After substitution only numbers, operators, parens and Math.* may remain.
  const stripped = expr.replace(/Math\.(floor|ceil|round|min|max)/g, "");
  if (!/^[\d\s+\-*/().,]*$/.test(stripped)) return null;
  try {
    const fn = new Function(`"use strict"; return (${expr});`);
    const val = fn();
    return typeof val === "number" && isFinite(val)
      ? Math.max(0, Math.round(val))
      : null;
  } catch {
    return null;
  }
}
