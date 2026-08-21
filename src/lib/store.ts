import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Character,
  createCharacter,
  Effect,
  HomebrewAbility,
  HomebrewClass,
  HomebrewSpell,
  InventoryItem,
  LevelEntry,
  StatKey,
  Stats,
} from "./types";

export type SavedEffect = Omit<Effect, "id"> & { id: string };

interface State {
  characters: Character[];
  activeId: string | null;
  savedEffects: SavedEffect[];
  addCharacter: (name?: string) => string;
  removeCharacter: (id: string) => void;
  setActive: (id: string) => void;
  update: (id: string, patch: Partial<Character>) => void;
  setStat: (id: string, stat: StatKey, value: number) => void;
  toggleSave: (id: string, stat: StatKey) => void;
  toggleSkill: (id: string, skill: string) => void;
  cycleSkill: (id: string, skill: string) => void;
  addEffect: (id: string, e: Omit<Effect, "id">) => boolean;
  removeEffect: (id: string, eid: string) => void;
  saveEffectToLibrary: (e: Omit<Effect, "id">) => void;
  removeSavedEffect: (sid: string) => void;
  addSpell: (id: string, s: Omit<HomebrewSpell, "id">) => void;
  removeSpell: (id: string, sid: string) => void;
  updateSpell: (id: string, sid: string, patch: Partial<HomebrewSpell>) => void;
  addAbility: (id: string, a: Omit<HomebrewAbility, "id">) => void;
  removeAbility: (id: string, aid: string) => void;
  addItem: (id: string, item: Omit<InventoryItem, "id">) => boolean;
  removeItem: (id: string, iid: string) => void;
  updateItem: (id: string, iid: string, patch: Partial<InventoryItem>) => void;
  equipItem: (id: string, slotId: string, itemId: string) => void;
  unequipSlot: (id: string, slotId: string) => void;
  addClass: (id: string, c: Omit<HomebrewClass, "id">) => void;
  removeClass: (id: string, cid: string) => void;
  setLevelTable: (id: string, table: LevelEntry[]) => void;
}

const patchChar = (
  chars: Character[],
  id: string,
  fn: (c: Character) => Character,
) => chars.map((c) => (c.id === id ? fn(c) : c));

export const useStore = create<State>()(
  persist(
    (set) => ({
      characters: [],
      activeId: null,
      savedEffects: [],
      addCharacter: (name) => {
        const c = createCharacter(name);
        set((s) => ({ characters: [...s.characters, c], activeId: c.id }));
        return c.id;
      },
      removeCharacter: (id) =>
        set((s) => {
          const remaining = s.characters.filter((c) => c.id !== id);
          return {
            characters: remaining,
            activeId:
              s.activeId === id ? (remaining[0]?.id ?? null) : s.activeId,
          };
        }),
      setActive: (id) => set({ activeId: id }),
      update: (id, patch) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({ ...c, ...patch })),
        })),
      setStat: (id, stat, value) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            stats: { ...c.stats, [stat]: value } as Stats,
          })),
        })),
      toggleSave: (id, stat) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            savingThrows: { ...c.savingThrows, [stat]: !c.savingThrows[stat] },
          })),
        })),
      toggleSkill: (id, skill) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            skillProficiencies: c.skillProficiencies.includes(skill)
              ? c.skillProficiencies.filter((k) => k !== skill)
              : [...c.skillProficiencies, skill],
          })),
        })),
      cycleSkill: (id, skill) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => {
            const prof = c.skillProficiencies.includes(skill);
            const exp = (c.skillExpertise ?? []).includes(skill);
            // none -> proficient -> expertise -> none
            if (!prof && !exp) {
              return {
                ...c,
                skillProficiencies: [...c.skillProficiencies, skill],
              };
            }
            if (prof && !exp) {
              return {
                ...c,
                skillExpertise: [...(c.skillExpertise ?? []), skill],
              };
            }
            return {
              ...c,
              skillProficiencies: c.skillProficiencies.filter(
                (k) => k !== skill,
              ),
              skillExpertise: (c.skillExpertise ?? []).filter(
                (k) => k !== skill,
              ),
            };
          }),
        })),
      addEffect: (id, e) => {
        // Refuse to apply the same effect twice (matched by name, case-insensitive).
        let added = false;
        const key = e.name.trim().toLowerCase();
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => {
            if (c.effects.some((ex) => ex.name.trim().toLowerCase() === key))
              return c;
            added = true;
            return {
              ...c,
              effects: [...c.effects, { ...e, id: crypto.randomUUID() }],
            };
          }),
        }));
        return added;
      },
      removeEffect: (id, eid) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            effects: c.effects.filter((e) => e.id !== eid),
          })),
        })),
      saveEffectToLibrary: (e) =>
        set((s) => ({
          savedEffects: [...s.savedEffects, { ...e, id: crypto.randomUUID() }],
        })),
      removeSavedEffect: (sid) =>
        set((s) => ({
          savedEffects: s.savedEffects.filter((e) => e.id !== sid),
        })),
      addSpell: (id, sp) =>
        set((st) => ({
          characters: patchChar(st.characters, id, (c) => ({
            ...c,
            spells: [...c.spells, { ...sp, id: crypto.randomUUID() }],
          })),
        })),
      removeSpell: (id, sid) =>
        set((st) => ({
          characters: patchChar(st.characters, id, (c) => ({
            ...c,
            spells: c.spells.filter((x) => x.id !== sid),
          })),
        })),
      updateSpell: (id, sid, patch) =>
        set((st) => ({
          characters: patchChar(st.characters, id, (c) => ({
            ...c,
            spells: c.spells.map((x) =>
              x.id === sid ? { ...x, ...patch } : x,
            ),
          })),
        })),
      addAbility: (id, a) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            abilities: [...c.abilities, { ...a, id: crypto.randomUUID() }],
          })),
        })),
      removeAbility: (id, aid) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            abilities: c.abilities.filter((x) => x.id !== aid),
          })),
        })),
      addItem: (id, item) => {
        // Refuse to add the same item twice (matched by name, case-insensitive).
        let added = false;
        const key = item.name.trim().toLowerCase();
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => {
            const inv = c.inventory ?? [];
            if (inv.some((it) => it.name.trim().toLowerCase() === key))
              return c;
            added = true;
            return {
              ...c,
              inventory: [...inv, { ...item, id: crypto.randomUUID() }],
            };
          }),
        }));
        return added;
      },
      removeItem: (id, iid) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => {
            // Drop the item and clear it out of any slot it was equipped in.
            const equipment = { ...(c.equipment ?? {}) };
            for (const k of Object.keys(equipment))
              if (equipment[k] === iid) delete equipment[k];
            return {
              ...c,
              inventory: (c.inventory ?? []).filter((it) => it.id !== iid),
              equipment,
            };
          }),
        })),
      updateItem: (id, iid, patch) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => {
            const inventory = (c.inventory ?? []).map((it) =>
              it.id === iid ? { ...it, ...patch } : it,
            );
            // An item that's no longer equippable (no slot, or now a
            // consumable) can't remain assigned to an equipment slot.
            const updated = inventory.find((it) => it.id === iid);
            let equipment = c.equipment ?? {};
            if (updated && (!updated.slot || updated.consumable)) {
              equipment = { ...equipment };
              for (const k of Object.keys(equipment))
                if (equipment[k] === iid) delete equipment[k];
            }
            return { ...c, inventory, equipment };
          }),
        })),
      equipItem: (id, slotId, itemId) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => {
            const equipment = { ...(c.equipment ?? {}) };
            // An item lives in one slot at a time — free it from any other slot.
            for (const k of Object.keys(equipment))
              if (equipment[k] === itemId) delete equipment[k];
            equipment[slotId] = itemId;
            return { ...c, equipment };
          }),
        })),
      unequipSlot: (id, slotId) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => {
            const equipment = { ...(c.equipment ?? {}) };
            delete equipment[slotId];
            return { ...c, equipment };
          }),
        })),
      addClass: (id, cl) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            classes: [...c.classes, { ...cl, id: crypto.randomUUID() }],
          })),
        })),
      removeClass: (id, cid) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            classes: c.classes.filter((x) => x.id !== cid),
          })),
        })),
      setLevelTable: (id, table) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            levelTable: table,
          })),
        })),
    }),
    { name: "grimoire-characters-v1" },
  ),
);

export const useActiveCharacter = () => {
  const characters = useStore((s) => s.characters);
  const activeId = useStore((s) => s.activeId);
  return characters.find((c) => c.id === activeId) ?? null;
};

/** Number of active effects this character is concentrating on. */
export const concentrationCount = (effects: Effect[]): number =>
  effects.filter((e) => e.concentration).length;

/** Item ids currently assigned to an equipment slot. */
export const equippedItemIds = (c: Character): Set<string> =>
  new Set(Object.values(c.equipment ?? {}));

/** Inventory items currently equipped (in any slot). */
export const equippedItems = (c: Character): InventoryItem[] => {
  const ids = equippedItemIds(c);
  return (c.inventory ?? []).filter((it) => ids.has(it.id));
};

/** Equipped inventory items that carry modifiers, expressed as effect sources. */
export const equippedGearEffects = (c: Character): Effect[] => {
  const ids = equippedItemIds(c);
  const out: Effect[] = [];
  for (const it of c.inventory ?? []) {
    if (!ids.has(it.id)) continue;
    const modifiers = [...(it.modifiers ?? [])];
    // A shield's AC bonus applies while equipped, like an AC modifier.
    if (it.slot === "Shield" && it.shieldAc)
      modifiers.push({ target: "ac", delta: it.shieldAc });
    if (modifiers.length === 0) continue;
    out.push({
      id: it.id,
      name: it.name,
      kind: "buff" as const,
      description: it.description,
      modifiers,
    });
  }
  return out;
};

/**
 * Every active modifier source for stat/AC/save/skill math: buffs & debuffs
 * plus equipped gear. Concentration and the "active effects" tally stay on
 * `c.effects` alone — gear isn't a buff.
 */
export const activeEffects = (c: Character): Effect[] => [
  ...c.effects,
  ...equippedGearEffects(c),
];

export const effectiveStats = (base: Stats, effects: Effect[]): Stats => {
  const out: Stats = { ...base };
  for (const e of effects) {
    for (const m of e.modifiers) {
      const target = m.target ?? "stat";
      if (target === "stat" && m.stat) {
        out[m.stat] = (out[m.stat] ?? 0) + m.delta;
      }
    }
  }
  return out;
};

/** Sum modifier deltas across active effects for a given non-stat target. */
export const sumEffectBonus = (
  effects: Effect[],
  target:
    | "ac"
    | "dc"
    | "spellAttack"
    | "weaponAttack"
    | "damage"
    | "extraAction",
): number => {
  let total = 0;
  for (const e of effects) {
    for (const m of e.modifiers) {
      if (m.target === target) total += m.delta;
    }
  }
  return total;
};

/** Sum saving-throw bonuses for a specific ability stat across effects. */
export const sumSaveBonus = (effects: Effect[], stat: StatKey): number => {
  let total = 0;
  for (const e of effects) {
    for (const m of e.modifiers) {
      if (m.target === "save" && m.stat === stat) total += m.delta;
    }
  }
  return total;
};

/** Sum skill bonuses for a specific skill across effects. */
export const sumSkillBonus = (effects: Effect[], skill: string): number => {
  let total = 0;
  for (const e of effects) {
    for (const m of e.modifiers) {
      if (m.target === "skill" && m.skill === skill) total += m.delta;
    }
  }
  return total;
};
