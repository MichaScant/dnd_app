import { StatKey, StatModifier } from "@/lib/types";

// ---------------------------------------------------------------------------
// Best-effort extraction of *self-buff* modifiers from an SRD spell's prose.
// We only pull out things the app can actually apply to your character — flat
// bonuses (AC, saves, speed, attack), an extra action, and set-AC (Mage Armor,
// Barkskin). Everything ambiguous (dice like +1d4, advantage, spell damage,
// bonuses aimed at other creatures) is deliberately ignored — it stays in the
// description. The result is attached as editable modifier chips, so a wrong
// guess is easy to fix or delete.
// ---------------------------------------------------------------------------

const STAT_BY_NAME: Record<string, StatKey> = {
  strength: "str",
  dexterity: "dex",
  constitution: "con",
  intelligence: "int",
  wisdom: "wis",
  charisma: "cha",
};

const first = (re: RegExp, text: string): RegExpMatchArray | null =>
  text.match(re);

export function detectSpellModifiers(description: string): StatModifier[] {
  const text = description.replace(/\s+/g, " ");
  const mods: StatModifier[] = [];

  // --- Set AC: Mage Armor "base AC becomes 13 + Dexterity", Barkskin
  //     "AC can't be less than 16" ------------------------------------------
  const acFormula = first(
    /AC\s+(?:becomes|equals?|is)\s+(\d+)\s*\+\s*(?:its |your |their |the target'?s )?(strength|dexterity|constitution|intelligence|wisdom|charisma)/i,
    text,
  );
  const acFloor = first(
    /AC\s+(?:can'?t be less than|becomes|is|equals?)\s+(\d+)\b(?!\s*\+)/i,
    text,
  );
  // Guard against matching another creature's AC (e.g. Mirror Image's
  // "duplicate's AC equals 10 + Dex"): real self set-AC starts at 13.
  if (acFormula && Number(acFormula[1]) >= 13) {
    mods.push({
      target: "ac",
      op: "set",
      delta: Number(acFormula[1]),
      plusStat: STAT_BY_NAME[acFormula[2].toLowerCase()],
    });
  } else if (acFloor && Number(acFloor[1]) >= 13) {
    mods.push({ target: "ac", op: "set", delta: Number(acFloor[1]) });
  }

  // --- Flat +N bonus to AC (Shield of Faith, Haste, Shield) ----------------
  const acBonus = first(
    /\+?(\d+)\s+bonus to\s+(?:its |your |their |the target'?s )?AC/i,
    text,
  );
  if (acBonus) mods.push({ target: "ac", delta: Number(acBonus[1]) });

  // --- Speed increases by N feet (Longstrider) -----------------------------
  const speed = first(
    /speed\s+(?:is\s+)?incre(?:ases|ased)\s+by\s+(\d+)/i,
    text,
  );
  if (speed) mods.push({ target: "speed", delta: Number(speed[1]) });

  // --- Speed doubled (Haste) → a ×2 multiplier -----------------------------
  if (/speed\s+is\s+doubled/i.test(text))
    mods.push({ target: "speed", op: "mult", delta: 2 });

  // --- Extra action (Haste) ------------------------------------------------
  if (
    /(?:gains?|takes?|can take)\s+(?:an?\s+|one\s+)?(?:additional|extra)\s+action/i.test(
      text,
    )
  )
    mods.push({ target: "extraAction", delta: 1 });

  // --- Saving throws: specific ability, or all -----------------------------
  const saveSpecific = text.match(
    /\+?(\d+)\s+bonus to\s+(strength|dexterity|constitution|intelligence|wisdom|charisma)\s+saving throws?/gi,
  );
  if (saveSpecific) {
    for (const s of saveSpecific) {
      const m = s.match(/\+?(\d+)\s+bonus to\s+(\w+)/i);
      if (m)
        mods.push({
          target: "save",
          stat: STAT_BY_NAME[m[2].toLowerCase()],
          delta: Number(m[1]),
        });
    }
  } else {
    const saveAll = first(
      /\+?(\d+)\s+bonus to\s+(?:all\s+)?(?:its |your |their )?saving throws?/i,
      text,
    );
    if (saveAll)
      for (const k of Object.values(STAT_BY_NAME))
        mods.push({ target: "save", stat: k, delta: Number(saveAll[1]) });
  }

  // --- Flat +N bonus to attack rolls (Magic Weapon; damage is ignored) -----
  const attack = first(
    /\+?(\d+)\s+bonus to\s+(?:its |your )?(?:attack|attack and damage) rolls?/i,
    text,
  );
  if (attack) mods.push({ target: "weaponAttack", delta: Number(attack[1]) });

  // De-dup identical entries.
  const seen = new Set<string>();
  return mods.filter((m) => {
    const key = `${m.target}|${m.stat ?? ""}|${m.op ?? "add"}|${m.plusStat ?? ""}|${m.delta}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
