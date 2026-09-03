import { Character } from "@/lib/types";

/** The result of parsing an external character sheet. */
export interface ImportResult {
  /** Parsed fields, ready to hand to the store's importCharacter(). */
  character: Partial<Character>;
  /** Things that can't live on a 5e sheet — the user must add them manually. */
  warnings: string[];
  source: "pdf" | "tintagel";
}

/**
 * Grimoire-specific data that no external 5e sheet carries. Shown after every
 * import so the user knows what to recreate by hand.
 */
export const HOMEBREW_WARNINGS: string[] = [
  "Buffs & Debuffs (active effects)",
  "Custom resource pools (mana, ki, sorcery points, …)",
  "Equipped gear slots — which items are worn/wielded",
  "Homebrew classes & abilities",
  "Character portrait",
];
