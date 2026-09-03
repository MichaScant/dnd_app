import type { WorkBook, WorkSheet } from "xlsx";
import { Character, StatKey, STAT_KEYS } from "@/lib/types";
import { ImportResult, HOMEBREW_WARNINGS } from "./types";

// ---------------------------------------------------------------------------
// Tintagel v2.92 reader. Mapped against the real workbook: stats/AC/level/prof
// come from the sheet's *named ranges*; name/race/class/HP/skills live at fixed
// cells on the "Front" tab (no named ranges), located by inspecting the file.
// ---------------------------------------------------------------------------

const FRONT = "Front";
const NAME_CELL = "B1";
const RACE_CELL = "T1";
const HP_CUR_CELL = "V20";
const HP_MAX_CELL = "Y20"; // holds "/ <max>"
const CLASS_ROWS = [10, 11, 12, 13]; // AC = class name, AK = level
const SKILL_ROWS = { start: 20, end: 37 }; // E = "Skill (Ability)", N = prof flag
// Save proficiency dots — column U ("Prof"), rows 9-14 in STR..CHA order.
const SAVE_CELLS: Record<StatKey, string> = {
  str: "U9",
  dex: "U10",
  con: "U11",
  int: "U12",
  wis: "U13",
  cha: "U14",
};

// Named ranges (case-insensitive) for the numeric core.
const STAT_NAMES: Record<StatKey, string> = {
  str: "Str",
  dex: "Dex",
  con: "Con",
  int: "Int",
  wis: "Wis",
  cha: "Cha",
};

function refToCell(ref: string): { sheet: string; addr: string } | null {
  const m = ref.match(/^(?:'([^']+)'|([^!]+))!\$?([A-Z]+)\$?(\d+)/);
  return m ? { sheet: m[1] ?? m[2], addr: `${m[3]}${m[4]}` } : null;
}

const toNum = (s: string, fallback: number): number => {
  const n = parseInt(String(s).replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(n) ? n : fallback;
};

export async function parseTintagelXlsx(file: File): Promise<ImportResult> {
  const XLSX = await import("xlsx");
  const wb: WorkBook = XLSX.read(new Uint8Array(await file.arrayBuffer()), {
    type: "array",
  });

  const cell = (sheet: string, addr: string): string => {
    const ws: WorkSheet | undefined = wb.Sheets[sheet];
    const c = ws?.[addr] as { v?: unknown } | undefined;
    return c?.v == null ? "" : String(c.v).trim();
  };

  // Resolve defined names -> value.
  const nameMap = new Map<string, string>();
  for (const n of wb.Workbook?.Names ?? []) {
    if (!n.Name || !n.Ref) continue;
    const rc = refToCell(String(n.Ref));
    if (rc) nameMap.set(n.Name.toUpperCase(), cell(rc.sheet, rc.addr));
  }
  const named = (name: string): string => nameMap.get(name.toUpperCase()) ?? "";

  if (!cell(FRONT, NAME_CELL) && nameMap.size === 0) {
    throw new Error(
      "This doesn't look like a Tintagel v2.92 sheet. Export the Tintagel Google Sheet as .xlsx and try again.",
    );
  }

  // Stats from named ranges.
  const stats = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  for (const k of STAT_KEYS) stats[k] = toNum(named(STAT_NAMES[k]), 10);

  // Classes table -> "Fighter 20 / Wizard 3".
  const classes: string[] = [];
  for (const r of CLASS_ROWS) {
    const nm = cell(FRONT, `AC${r}`);
    if (!nm) continue;
    const lv = cell(FRONT, `AK${r}`);
    classes.push(lv ? `${nm} ${lv}` : nm);
  }
  const classSummary = classes.join(" / ");
  const level = toNum(named("Lvl") || cell(FRONT, "AK14"), 1);

  // Skills: the prof flag cell (N) is "●" = proficient, "x2" = expertise.
  const skillProficiencies: string[] = [];
  const skillExpertise: string[] = [];
  for (let r = SKILL_ROWS.start; r <= SKILL_ROWS.end; r++) {
    const label = cell(FRONT, `E${r}`).replace(/\s*\([^)]*\)\s*$/, "");
    const prof = cell(FRONT, `N${r}`);
    if (!label || !prof || prof === "x0" || prof === "—") continue;
    skillProficiencies.push(label);
    if (/2/.test(prof)) skillExpertise.push(label); // "x2" → expertise
  }

  // Saving throws: proficient when the "Prof" dot cell is filled.
  const savingThrows = {
    str: false,
    dex: false,
    con: false,
    int: false,
    wis: false,
    cha: false,
  };
  for (const k of STAT_KEYS) {
    if (cell(FRONT, SAVE_CELLS[k])) savingThrows[k] = true;
  }

  const hpCur = toNum(cell(FRONT, HP_CUR_CELL), 10);
  const character: Partial<Character> = {
    name: cell(FRONT, NAME_CELL) || "Imported Hero",
    race: cell(FRONT, RACE_CELL),
    classSummary,
    level,
    ac: toNum(named("AC"), 10),
    hp: hpCur,
    maxHp: toNum(cell(FRONT, HP_MAX_CELL), hpCur),
    proficiencyBonus: toNum(named("Prof"), 2),
    stats,
    savingThrows,
    skillProficiencies,
    skillExpertise,
  };

  const warnings = [
    ...HOMEBREW_WARNINGS,
    "Spells, spell slots, and detailed inventory aren't read yet — add them manually.",
    "Speed isn't imported from Tintagel — set it in the Speed section on the sheet.",
    "Verify the imported values against your sheet.",
  ];

  return { character, warnings, source: "tintagel" };
}
