import {
  SlotKind,
  ArmorWeight,
  Character,
  InventoryItem,
  WeaponStats,
} from "@/lib/types";

/** Item-type options offered when creating custom equipment. */
export const SLOT_KINDS: SlotKind[] = [
  "Head",
  "Cloak",
  "Chest",
  "Gloves",
  "Pants",
  "Boots",
  "Ring",
  "Weapon",
  "Shield",
  "Miscellaneous",
];

/**
 * Slots that are never armor: the armor-type and Strength-requirement fields
 * are hidden for these when building an item.
 */
export const NON_ARMOR_SLOTS: SlotKind[] = [
  "Ring",
  "Cloak",
  "Weapon",
  "Shield",
  "Miscellaneous",
];

/**
 * Whether the armor-type / Strength-requirement fields apply to a slot.
 * They do for armor-capable slots (and for "no slot", where the item may still
 * be plain gear), but not for rings, cloaks, weapons, shields, or misc items.
 */
export const slotUsesArmorFields = (slot: SlotKind | ""): boolean =>
  !(NON_ARMOR_SLOTS as readonly string[]).includes(slot);

export const ARMOR_WEIGHTS: ArmorWeight[] = ["Light", "Medium", "Heavy"];

export const SHIELD_TYPES = ["Light", "Heavy"];

export const WEAPON_CATEGORIES = [
  "Simple Melee",
  "Simple Ranged",
  "Martial Melee",
  "Martial Ranged",
];

/** The standard 5e (SRD) weapons, for the "Weapon type" dropdown. */
export const WEAPON_TYPES = [
  "Battleaxe",
  "Blowgun",
  "Club",
  "Dagger",
  "Dart",
  "Flail",
  "Glaive",
  "Greataxe",
  "Greatclub",
  "Greatsword",
  "Halberd",
  "Hand Crossbow",
  "Handaxe",
  "Heavy Crossbow",
  "Javelin",
  "Lance",
  "Light Crossbow",
  "Light Hammer",
  "Longbow",
  "Longsword",
  "Mace",
  "Maul",
  "Morningstar",
  "Net",
  "Pike",
  "Quarterstaff",
  "Rapier",
  "Scimitar",
  "Shortbow",
  "Shortsword",
  "Sickle",
  "Sling",
  "Spear",
  "Trident",
  "War Pick",
  "Warhammer",
  "Whip",
];

export const DAMAGE_TYPES = ["Slashing", "Piercing", "Bludgeoning"];

export const WEAPON_PROPERTIES = [
  "Ammunition",
  "Finesse",
  "Heavy",
  "Light",
  "Loading",
  "Reach",
  "Special",
  "Thrown",
  "Two-Handed",
  "Versatile",
];

/** Compact one-line summary of a weapon's stats for display. */
export const weaponSummary = (w?: WeaponStats): string => {
  if (!w) return "";
  const parts: string[] = [];
  if (w.type) parts.push(w.type);
  if (w.category) parts.push(w.category);
  if (w.damage)
    parts.push(
      `${w.damage}${w.damageType ? " " + w.damageType : ""}${
        w.versatileDamage ? ` (versatile ${w.versatileDamage})` : ""
      }`,
    );
  if (w.range) parts.push(`Range ${w.range}`);
  if (w.properties?.length) parts.push(w.properties.join(", "));
  return parts.join(" · ");
};

export interface EquipSlot {
  id: string; // stable key stored on Character.equipment
  label: string; // shown on the sheet
  accepts: SlotKind; // item slot kind that can go here
}

/**
 * The fixed, single-item slots shown on the sheet. Rings are handled
 * separately (multi-equip) so a character can wear any number of them.
 */
export const EQUIP_SLOTS: EquipSlot[] = [
  { id: "head", label: "Head", accepts: "Head" },
  { id: "cloak", label: "Cloak", accepts: "Cloak" },
  { id: "chest", label: "Chest", accepts: "Chest" },
  { id: "gloves", label: "Gloves", accepts: "Gloves" },
  { id: "pants", label: "Pants", accepts: "Pants" },
  { id: "boots", label: "Boots", accepts: "Boots" },
  { id: "mainHand", label: "Right Hand", accepts: "Weapon" },
  { id: "offHand", label: "Left Hand", accepts: "Weapon" },
  { id: "shield", label: "Shield", accepts: "Shield" },
];

/**
 * Rings and miscellaneous items are multi-equip: a character can wear any
 * number of them, so each gets its own equipment-map key built from a prefix
 * plus the item id (rather than occupying one of the fixed slots above).
 */
export const RING_SLOT_PREFIX = "ring:";
export const MISC_SLOT_PREFIX = "misc:";
export const ringSlotId = (itemId: string): string => RING_SLOT_PREFIX + itemId;
export const miscSlotId = (itemId: string): string => MISC_SLOT_PREFIX + itemId;

/** The slot label an item currently occupies, if any (e.g. "Ring", "Head"). */
export const equippedSlotLabel = (
  c: Character,
  itemId: string,
): string | undefined => {
  const equipment = c.equipment ?? {};
  const key = Object.keys(equipment).find((k) => equipment[k] === itemId);
  if (!key) return undefined;
  if (key.startsWith(RING_SLOT_PREFIX)) return "Ring";
  if (key.startsWith(MISC_SLOT_PREFIX)) return "Misc";
  return EQUIP_SLOTS.find((s) => s.id === key)?.label;
};

/** Inventory items eligible for a given fixed slot. */
export const itemsForSlot = (
  inventory: InventoryItem[],
  slot: EquipSlot,
): InventoryItem[] => inventory.filter((it) => it.slot === slot.accepts);

/** All ring items in the inventory (for the multi-equip Rings section). */
export const ringItems = (inventory: InventoryItem[]): InventoryItem[] =>
  inventory.filter((it) => it.slot === "Ring");

/** All miscellaneous items in the inventory (for the multi-equip section). */
export const miscItems = (inventory: InventoryItem[]): InventoryItem[] =>
  inventory.filter((it) => it.slot === "Miscellaneous");
