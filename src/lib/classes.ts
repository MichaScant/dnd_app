import raw from "@/data/class-features.json";
import subRaw from "@/data/subclass-features.json";

/**
 * Feature-by-level data for the standard 5e classes, from the SRD (via the
 * dnd5eapi). Shape: { "Wizard": { "1": "Spellcasting, Arcane Recovery", … } }.
 */
const CLASS_FEATURES = raw as Record<string, Record<string, string>>;

/** Standard classes we have leveling data for, in display order. */
export const CLASS_NAMES = Object.keys(CLASS_FEATURES);

/** The "type your own" sentinel used by the leveling-track class picker. */
export const CUSTOM_CLASS = "Custom";

/** Features unlocked at `level` for a standard class ("" when none/unknown). */
export const featuresAtLevel = (className: string, level: number): string =>
  CLASS_FEATURES[className]?.[String(level)] ?? "";

interface SubclassInfo {
  /** Class level at which this class picks its subclass. */
  level: number;
  /** What the choice is called, e.g. "Arcane Tradition", "Divine Domain". */
  label: string;
  /** subclass name -> { class-level -> features granted }. */
  options: Record<string, Record<string, string>>;
}

const SUBCLASSES = subRaw as Record<string, SubclassInfo>;

/** Subclass metadata for a standard class (choice level, label, options), or
 *  undefined when the class has no subclass data. */
export const subclassInfo = (className: string): SubclassInfo | undefined =>
  SUBCLASSES[className];

/** Names of the subclasses available for a class. */
export const subclassOptions = (className: string): string[] =>
  Object.keys(SUBCLASSES[className]?.options ?? {});

/** Features a chosen subclass grants at a given class level ("" when none). */
export const subclassFeaturesAt = (
  className: string,
  subclass: string,
  classLevel: number,
): string =>
  SUBCLASSES[className]?.options[subclass]?.[String(classLevel)] ?? "";
