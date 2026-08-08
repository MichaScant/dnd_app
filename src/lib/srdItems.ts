import { InventoryItem } from "@/lib/types";
import { SRD_ATTRIBUTION } from "@/lib/srd";
import rawItems from "@/data/srd-items.json";

export { SRD_ATTRIBUTION };

/**
 * An item from the D&D 5e SRD 5.1 (mundane equipment + magic items).
 * Source: 5e-bits / dnd5eapi, derived from SRD 5.1, © Wizards of the Coast,
 * licensed under CC BY 4.0. See SRD_ATTRIBUTION.
 */
export interface SrdItem {
  name: string;
  kind: "gear" | "magic";
  category: string; // e.g. "Weapon", "Armor", "Wondrous Items"
  rarity?: string; // magic items only
  cost?: string; // gear only, e.g. "15 gp"
  weight?: string; // gear only, e.g. "3 lb."
  description: string;
}

export const SRD_ITEMS = rawItems as unknown as SrdItem[];

export type ItemMode = "gear" | "magic";

/** Gear categories, in the SRD's natural order. */
export const GEAR_CATEGORIES = [
  "Weapon",
  "Armor",
  "Adventuring Gear",
  "Tools",
  "Mounts and Vehicles",
];

/** Magic-item rarities, ordered from most common to rarest. */
export const MAGIC_RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Very Rare",
  "Legendary",
  "Artifact",
  "Varies",
];

/**
 * Filter items for a mode and an optional sub-filter
 * (a gear category when mode="gear", a rarity when mode="magic").
 */
export const itemsFor = (mode: ItemMode, filter: string | null): SrdItem[] =>
  SRD_ITEMS.filter(
    (i) =>
      i.kind === mode &&
      (filter === null ||
        (mode === "gear" ? i.category === filter : i.rarity === filter)),
  );

/**
 * Group items for display: gear buckets by category, magic buckets by rarity.
 * Returns ordered [groupLabel, items][] pairs.
 */
export const groupItems = (
  mode: ItemMode,
  items: SrdItem[],
): [string, SrdItem[]][] => {
  const order = mode === "gear" ? GEAR_CATEGORIES : MAGIC_RARITIES;
  const buckets = new Map<string, SrdItem[]>();
  for (const it of items) {
    const label = (mode === "gear" ? it.category : it.rarity) ?? "Other";
    const bucket = buckets.get(label) ?? [];
    bucket.push(it);
    buckets.set(label, bucket);
  }
  return [...buckets.entries()].sort(
    (a, b) => order.indexOf(a[0]) - order.indexOf(b[0]),
  );
};

/** Convert an SRD item into the character's inventory-item shape (qty 1). */
export const toInventoryItem = (s: SrdItem): Omit<InventoryItem, "id"> => ({
  name: s.name,
  kind: s.kind,
  category: s.category,
  rarity: s.rarity,
  quantity: 1,
  weight: s.weight,
  cost: s.cost,
  description: s.description,
});
