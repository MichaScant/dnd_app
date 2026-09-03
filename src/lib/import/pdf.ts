import { Character, InventoryItem, StatKey, STAT_KEYS } from "@/lib/types";
import { ImportResult, HOMEBREW_WARNINGS } from "./types";

// ---------------------------------------------------------------------------
// Field-name maps for the official WotC "5E_CharacterSheet_Fillable.pdf".
// These names are the commonly-documented ones, but several near-identical
// fillable PDFs exist — VERIFY against the user's actual file (dump names with
// `form.getFields().map(f => f.getName())`) and adjust here.
// ---------------------------------------------------------------------------

const STAT_FIELD: Record<StatKey, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

const SAVE_CHECKBOX: Record<string, StatKey> = {
  "Check Box 11": "str",
  "Check Box 18": "dex",
  "Check Box 19": "con",
  "Check Box 20": "int",
  "Check Box 21": "wis",
  "Check Box 22": "cha",
};

// Skill labels here MUST match DEFAULT_SKILLS in types.ts.
const SKILL_CHECKBOX: Record<string, string> = {
  "Check Box 23": "Acrobatics",
  "Check Box 24": "Animal Handling",
  "Check Box 25": "Arcana",
  "Check Box 26": "Athletics",
  "Check Box 27": "Deception",
  "Check Box 28": "History",
  "Check Box 29": "Insight",
  "Check Box 30": "Intimidation",
  "Check Box 31": "Investigation",
  "Check Box 32": "Medicine",
  "Check Box 33": "Nature",
  "Check Box 34": "Perception",
  "Check Box 35": "Performance",
  "Check Box 36": "Persuasion",
  "Check Box 37": "Religion",
  "Check Box 38": "Sleight of Hand",
  "Check Box 39": "Stealth",
  "Check Box 40": "Survival",
};

// Trailing spaces in these names are exactly as they appear in the PDF and vary
// between versions — read defensively (verified against the real sheet).
const WEAPON_ROWS = [
  { name: ["Wpn Name"], atk: ["Wpn1 AtkBonus"], dmg: ["Wpn1 Damage"] },
  {
    name: ["Wpn Name 2"],
    atk: ["Wpn2 AtkBonus ", "Wpn2 AtkBonus"],
    dmg: ["Wpn2 Damage ", "Wpn2 Damage"],
  },
  {
    name: ["Wpn Name 3"],
    atk: ["Wpn3 AtkBonus  ", "Wpn3 AtkBonus"],
    dmg: ["Wpn3 Damage ", "Wpn3 Damage 3", "Wpn3 Damage"],
  },
];

const toNum = (s: string, fallback: number): number => {
  const n = parseInt(String(s).replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(n) ? n : fallback;
};

const labeled = (label: string, body: string): string =>
  body.trim() ? `## ${label}\n${body.trim()}` : "";

export async function parseFillablePdf(file: File): Promise<ImportResult> {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form = doc.getForm();

  const text = (name: string): string => {
    try {
      return form.getTextField(name).getText() ?? "";
    } catch {
      return "";
    }
  };
  // First non-empty of several candidate names (handles trailing-space variants).
  const firstText = (...names: string[]): string => {
    for (const n of names) {
      const v = text(n);
      if (v.trim()) return v;
    }
    return "";
  };
  const checked = (name: string): boolean => {
    try {
      return form.getCheckBox(name).isChecked();
    } catch {
      return false;
    }
  };

  // --- Identity / vitals -------------------------------------------------
  const classLevel = firstText("ClassLevel").trim();
  const level = toNum(classLevel.match(/\d+/)?.[0] ?? "", 1);

  const stats = { ...blankStatsRecord() };
  for (const k of STAT_KEYS) stats[k] = toNum(text(STAT_FIELD[k]), 10);

  const savingThrows = { ...blankSavesRecord() };
  for (const [box, stat] of Object.entries(SAVE_CHECKBOX)) {
    if (checked(box)) savingThrows[stat] = true;
  }

  const skillProficiencies: string[] = [];
  for (const [box, skill] of Object.entries(SKILL_CHECKBOX)) {
    if (checked(box)) skillProficiencies.push(skill);
  }

  // --- Inventory: weapons + free-text equipment --------------------------
  const inventory: InventoryItem[] = [];
  for (const w of WEAPON_ROWS) {
    const nm = firstText(...w.name).trim();
    if (!nm) continue;
    const dmg = firstText(...w.dmg).trim();
    const atk = firstText(...w.atk).trim();
    inventory.push({
      id: crypto.randomUUID(),
      name: nm,
      kind: "custom",
      category: "Weapon",
      quantity: 1,
      description: atk ? `Attack ${atk}` : "",
      slot: "Weapon",
      weapon: dmg ? { damage: dmg } : undefined,
    });
  }
  for (const line of firstText("Equipment").split(/\r?\n/)) {
    const name = line.trim();
    if (name)
      inventory.push({
        id: crypto.randomUUID(),
        name,
        kind: "custom",
        category: "Gear",
        quantity: 1,
        description: "",
      });
  }

  // --- Notes: everything without a structured home -----------------------
  const currency = ["CP", "SP", "EP", "GP", "PP"]
    .map((c) => {
      const v = firstText(c).trim();
      return v ? `${c} ${v}` : "";
    })
    .filter(Boolean)
    .join(" · ");
  const notes = [
    labeled(
      "Personality Traits",
      firstText("PersonalityTraits ", "PersonalityTraits"),
    ),
    labeled("Ideals", firstText("Ideals")),
    labeled("Bonds", firstText("Bonds")),
    labeled("Flaws", firstText("Flaws")),
    labeled("Features & Traits", firstText("Features and Traits")),
    labeled("Additional Features & Traits", firstText("Feat+Traits")),
    labeled("Treasure", firstText("Treasure")),
    labeled("Attacks & Spellcasting", firstText("AttacksSpellcasting")),
    labeled("Passive Perception", firstText("Passive")),
    labeled("Other Proficiencies & Languages", firstText("ProficienciesLang")),
    labeled("Backstory", firstText("Backstory")),
    labeled("Currency", currency),
  ]
    .filter(Boolean)
    .join("\n\n");

  const character: Partial<Character> = {
    name: firstText("CharacterName", "PlayerName").trim() || "Imported Hero",
    race: firstText("Race ", "Race").trim(),
    classSummary: classLevel,
    level,
    xp: toNum(firstText("XP"), 0),
    ac: toNum(firstText("AC"), 10),
    speed: toNum(firstText("Speed"), 30),
    hp: toNum(firstText("HPCurrent", "HPMax"), 10),
    maxHp: toNum(firstText("HPMax"), 10),
    proficiencyBonus: toNum(firstText("ProfBonus"), 2),
    stats,
    savingThrows,
    skillProficiencies,
    inventory,
    notes,
  };

  const warnings = [
    ...HOMEBREW_WARNINGS,
    "Spells & spell slots — the PDF's spell-page fields aren't read yet; add spells in the Spells tab.",
    "Weapon attack/damage is best-effort — double-check the Inventory tab.",
    "PDF field names vary between sheet versions; please verify the imported values.",
  ];

  return { character, warnings, source: "pdf" };
}

// Local helpers so this module doesn't depend on the store's blank* factories.
function blankStatsRecord(): Record<StatKey, number> {
  return { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
}
function blankSavesRecord(): Record<StatKey, boolean> {
  return {
    str: false,
    dex: false,
    con: false,
    int: false,
    wis: false,
    cha: false,
  };
}
