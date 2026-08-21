export type StatKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export const STAT_KEYS: StatKey[] = ["str", "dex", "con", "int", "wis", "cha"];
export const STAT_LABELS: Record<StatKey, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

export type Stats = Record<StatKey, number>;
export type SavingThrows = Record<StatKey, boolean>;

export const DEFAULT_SKILLS = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
] as const;

export interface HomebrewClass {
  id: string;
  name: string;
  description: string;
  hitDie: string;
  primaryStat?: StatKey;
}

export interface HomebrewSpell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  description: string;
  prepared?: boolean;
  modifiers?: StatModifier[]; // optional; "cast" turns these into an active effect
  concentration?: boolean; // the spell's effect requires concentration
}

export interface HomebrewAbility {
  id: string;
  name: string;
  source: string;
  uses?: string;
  description: string;
}

/** Which equipment slot an item fits (undefined = not slot-equippable). */
export type SlotKind =
  | "Head"
  | "Cloak"
  | "Chest"
  | "Gloves"
  | "Pants"
  | "Boots"
  | "Ring"
  | "Weapon"
  | "Shield"
  | "Miscellaneous";

export type ArmorWeight = "Light" | "Medium" | "Heavy";

export interface WeaponStats {
  category?: string; // e.g. "Martial Melee", "Simple Ranged"
  type?: string; // specific weapon, e.g. "Longsword" (or a homebrew name)
  damage?: string; // damage dice, e.g. "1d8"
  damageType?: string; // e.g. "Slashing"
  range?: string; // e.g. "5 ft" or "80/320"
  versatileDamage?: string; // two-handed damage when Versatile, e.g. "1d10"
  properties?: string[]; // Finesse, Light, Two-Handed, Versatile, …
}

export interface InventoryItem {
  id: string;
  name: string;
  kind: "gear" | "magic" | "custom";
  category: string; // e.g. "Weapon", "Armor", "Wondrous Items"
  rarity?: string; // magic items only
  quantity: number;
  weight?: string; // display string, e.g. "3 lb."
  cost?: string; // display string, e.g. "15 gp"
  description: string;
  slot?: SlotKind; // the equipment slot this item fits
  strengthReq?: number; // minimum Strength score to use without penalty
  armorWeight?: ArmorWeight; // set when the item is armor
  weapon?: WeaponStats; // set when the item is a weapon
  shieldType?: string; // "Light" | "Heavy" — set when the item is a shield
  shieldAc?: number; // AC granted while the shield is equipped
  consumable?: boolean; // potions, scrolls, ammo… — listed apart from the pack
  modifiers?: StatModifier[]; // applied to the character while equipped
}

export type ModTarget =
  | "stat"
  | "ac"
  | "dc"
  | "spellAttack"
  | "weaponAttack"
  | "damage"
  | "save"
  | "skill"
  | "extraAction";

export const MOD_TARGET_LABELS: Record<ModTarget, string> = {
  stat: "Ability Score",
  ac: "Armor Class",
  dc: "Spell Save DC",
  spellAttack: "Spell Attack",
  weaponAttack: "Weapon Attack (Hit)",
  damage: "Damage",
  save: "Saving Throw",
  skill: "Skill Check",
  extraAction: "Extra Action",
};

export interface StatModifier {
  target?: ModTarget; // defaults to "stat" for legacy entries
  stat?: StatKey; // used when target = "stat" or "save"
  skill?: string; // used when target = "skill"
  delta: number; // can be negative
  note?: string;
}

export const SKILL_ABILITY: Record<string, StatKey> = {
  Acrobatics: "dex",
  "Animal Handling": "wis",
  Arcana: "int",
  Athletics: "str",
  Deception: "cha",
  History: "int",
  Insight: "wis",
  Intimidation: "cha",
  Investigation: "int",
  Medicine: "wis",
  Nature: "int",
  Perception: "wis",
  Performance: "cha",
  Persuasion: "cha",
  Religion: "int",
  "Sleight of Hand": "dex",
  Stealth: "dex",
  Survival: "wis",
};

export interface Effect {
  id: string;
  name: string;
  kind: "buff" | "debuff";
  description: string;
  duration?: string;
  modifiers: StatModifier[];
  concentration?: boolean; // true when this character is concentrating on it
}

export interface LevelEntry {
  level: number;
  className: string;
  features: string;
  xpRequired?: number;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  classSummary: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  ac: number;
  speed: number;
  stats: Stats;
  savingThrows: SavingThrows;
  skillProficiencies: string[];
  skillExpertise: string[];
  proficiencyBonus: number;
  concentrationMax: number; // max simultaneous concentration spells (default 1)
  classes: HomebrewClass[];
  spells: HomebrewSpell[];
  abilities: HomebrewAbility[];
  inventory: InventoryItem[];
  equipment: Record<string, string>; // slot id -> equipped item id
  effects: Effect[];
  levelTable: LevelEntry[];
  notes: string;
}

export const blankStats = (): Stats => ({
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
});
export const blankSaves = (): SavingThrows => ({
  str: false,
  dex: false,
  con: false,
  int: false,
  wis: false,
  cha: false,
});

export const createCharacter = (name = "New Adventurer"): Character => ({
  id: crypto.randomUUID(),
  name,
  race: "",
  classSummary: "",
  level: 1,
  xp: 0,
  hp: 10,
  maxHp: 10,
  ac: 10,
  speed: 30,
  stats: blankStats(),
  savingThrows: blankSaves(),
  skillProficiencies: [],
  skillExpertise: [],
  proficiencyBonus: 2,
  concentrationMax: 1,
  classes: [],
  spells: [],
  abilities: [],
  inventory: [],
  equipment: {},
  effects: [],
  levelTable: [],
  notes: "",
});

export const modifier = (score: number) => Math.floor((score - 10) / 2);
export const formatMod = (m: number) => (m >= 0 ? `+${m}` : `${m}`);
