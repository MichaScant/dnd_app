import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deletePortrait } from "./portraitStore";
import {
  Character,
  createCharacter,
  Effect,
  HomebrewAbility,
  HomebrewClass,
  HomebrewSpell,
  InventoryItem,
  LevelEntry,
  modifier,
  Resource,
  SpeedModifier,
  SpellSlotTier,
  StatKey,
  Stats,
} from "./types";

export type SavedEffect = Omit<Effect, "id"> & { id: string };

interface State {
  characters: Character[];
  activeId: string | null;
  savedEffects: SavedEffect[];
  addCharacter: (name?: string) => string;
  importCharacter: (data: Partial<Character>) => string;
  removeCharacter: (id: string) => void;
  setActive: (id: string) => void;
  update: (id: string, patch: Partial<Character>) => void;
  setStat: (id: string, stat: StatKey, value: number) => void;
  toggleSave: (id: string, stat: StatKey) => void;
  toggleSkill: (id: string, skill: string) => void;
  cycleSkill: (id: string, skill: string) => void;
  addEffect: (id: string, e: Omit<Effect, "id">) => string | null;
  removeEffect: (id: string, eid: string) => void;
  addSpeedModifiersForEffect: (
    id: string,
    effectId: string,
    rows: { label: string; op: "add" | "mult"; value: number }[],
  ) => void;
  saveEffectToLibrary: (e: Omit<Effect, "id">) => void;
  removeSavedEffect: (sid: string) => void;
  addSpell: (id: string, s: Omit<HomebrewSpell, "id">) => void;
  removeSpell: (id: string, sid: string) => void;
  updateSpell: (id: string, sid: string, patch: Partial<HomebrewSpell>) => void;
  addSpellSlotTier: (id: string, level: number) => void;
  updateSpellSlotTier: (
    id: string,
    tierId: string,
    patch: Partial<Pick<SpellSlotTier, "total" | "used" | "type">>,
  ) => void;
  removeSpellSlotTier: (id: string, tierId: string) => void;
  addAbility: (id: string, a: Omit<HomebrewAbility, "id">) => void;
  removeAbility: (id: string, aid: string) => void;
  addResource: (id: string, resource: Omit<Resource, "id">) => void;
  updateResource: (
    id: string,
    rid: string,
    patch: Partial<Omit<Resource, "id">>,
  ) => void;
  removeResource: (id: string, rid: string) => void;
  addSpeedModifier: (id: string) => void;
  updateSpeedModifier: (
    id: string,
    mid: string,
    patch: Partial<Omit<SpeedModifier, "id">>,
  ) => void;
  removeSpeedModifier: (id: string, mid: string) => void;
  moveSpeedModifier: (id: string, mid: string, dir: -1 | 1) => void;
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

/**
 * Coerce persisted spell-slot data into the current array shape. Handles the
 * earlier `Record<level, {total,used,type}>` form (one group per level) by
 * turning each entry into a tier, and tolerates missing/garbage values.
 */
const normalizeSpellSlots = (raw: unknown): SpellSlotTier[] => {
  if (Array.isArray(raw)) {
    return (raw as Partial<SpellSlotTier>[]).map((t, i) => ({
      id: t.id ?? `slot-${t.level ?? 0}-${i}`,
      level: t.level ?? 0,
      total: t.total ?? 0,
      used: t.used ?? 0,
      type: t.type,
    }));
  }
  if (raw && typeof raw === "object") {
    const entries = Object.entries(
      raw as Record<string, { total?: number; used?: number; type?: string }>,
    );
    return entries.map(([level, t]) => ({
      id: `slot-${level}`,
      level: Number(level),
      total: t?.total ?? 0,
      used: t?.used ?? 0,
      type: t?.type,
    }));
  }
  return [];
};

/**
 * Keep a resource sane: a non-positive/undefined max means "uncapped"; current
 * is never negative and never exceeds a real max.
 */
const clampResource = (r: Resource): Resource => {
  const max = r.max != null && r.max > 0 ? r.max : undefined;
  let current = Math.max(0, r.current || 0);
  if (max != null) current = Math.min(current, max);
  return { ...r, max, current };
};

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
      // Insert a fully- or partially-formed character (e.g. from an import).
      // Merges over createCharacter's defaults so every required field exists,
      // always assigns a fresh id, and sanitizes the tricky nested arrays.
      importCharacter: (data) => {
        const base = createCharacter(data.name ?? "Imported Hero");
        const c: Character = {
          ...base,
          ...data,
          id: base.id, // never trust an incoming id
          spellSlots: normalizeSpellSlots(data.spellSlots ?? base.spellSlots),
          resources: (data.resources ?? base.resources).map(clampResource),
          equipment: data.equipment ?? {},
        };
        set((s) => ({ characters: [...s.characters, c], activeId: c.id }));
        return c.id;
      },
      removeCharacter: (id) => {
        deletePortrait(id).catch(() => {}); // drop the portrait from IndexedDB
        set((s) => {
          const remaining = s.characters.filter((c) => c.id !== id);
          return {
            characters: remaining,
            activeId:
              s.activeId === id ? (remaining[0]?.id ?? null) : s.activeId,
          };
        });
      },
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
        let newId: string | null = null;
        const key = e.name.trim().toLowerCase();
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => {
            if (c.effects.some((ex) => ex.name.trim().toLowerCase() === key))
              return c;
            newId = crypto.randomUUID();
            return {
              ...c,
              effects: [...c.effects, { ...e, id: newId }],
            };
          }),
        }));
        return newId;
      },
      removeEffect: (id, eid) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            effects: c.effects.filter((e) => e.id !== eid),
            // Drop any Speed-card rows this effect (a cast spell) injected.
            speedModifiers: (c.speedModifiers ?? []).filter(
              (m) => m.source !== eid,
            ),
          })),
        })),
      addSpeedModifiersForEffect: (id, effectId, rows) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            speedModifiers: [
              ...(c.speedModifiers ?? []),
              ...rows.map((r) => ({
                id: crypto.randomUUID(),
                label: r.label,
                op: r.op,
                value: r.value,
                source: effectId,
              })),
            ],
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
      addSpellSlotTier: (id, level) =>
        set((st) => ({
          characters: patchChar(st.characters, id, (c) => ({
            ...c,
            spellSlots: [
              ...(c.spellSlots ?? []),
              { id: crypto.randomUUID(), level, total: 0, used: 0, type: "" },
            ],
          })),
        })),
      updateSpellSlotTier: (id, tierId, patch) =>
        set((st) => ({
          characters: patchChar(st.characters, id, (c) => ({
            ...c,
            spellSlots: (c.spellSlots ?? []).map((t) => {
              if (t.id !== tierId) return t;
              const next: SpellSlotTier = { ...t, ...patch };
              // Keep values sane: non-negative, and used never exceeds total.
              next.total = Math.max(0, next.total);
              next.used = Math.max(0, Math.min(next.total, next.used));
              return next;
            }),
          })),
        })),
      removeSpellSlotTier: (id, tierId) =>
        set((st) => ({
          characters: patchChar(st.characters, id, (c) => ({
            ...c,
            spellSlots: (c.spellSlots ?? []).filter((t) => t.id !== tierId),
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
      addResource: (id, resource) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            resources: [
              ...(c.resources ?? []),
              clampResource({ ...resource, id: crypto.randomUUID() }),
            ],
          })),
        })),
      updateResource: (id, rid, patch) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            resources: (c.resources ?? []).map((r) =>
              r.id === rid ? clampResource({ ...r, ...patch }) : r,
            ),
          })),
        })),
      removeResource: (id, rid) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            resources: (c.resources ?? []).filter((r) => r.id !== rid),
          })),
        })),
      addSpeedModifier: (id) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            speedModifiers: [
              ...(c.speedModifiers ?? []),
              { id: crypto.randomUUID(), label: "", op: "add", value: 0 },
            ],
          })),
        })),
      updateSpeedModifier: (id, mid, patch) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            speedModifiers: (c.speedModifiers ?? []).map((m) =>
              m.id === mid ? { ...m, ...patch } : m,
            ),
          })),
        })),
      removeSpeedModifier: (id, mid) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => ({
            ...c,
            speedModifiers: (c.speedModifiers ?? []).filter(
              (m) => m.id !== mid,
            ),
          })),
        })),
      moveSpeedModifier: (id, mid, dir) =>
        set((s) => ({
          characters: patchChar(s.characters, id, (c) => {
            const mods = [...(c.speedModifiers ?? [])];
            const i = mods.findIndex((m) => m.id === mid);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= mods.length) return c;
            [mods[i], mods[j]] = [mods[j], mods[i]];
            return { ...c, speedModifiers: mods };
          }),
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
    {
      name: "grimoire-characters-v1",
      version: 1,
      // v1: spellSlots went from Record<level, tier> to a flat tier array.
      migrate: (persisted) => {
        const state = persisted as {
          characters?: Record<string, unknown>[];
        } & Record<string, unknown>;
        if (Array.isArray(state.characters)) {
          state.characters = state.characters.map((c) => ({
            ...c,
            spellSlots: normalizeSpellSlots(c.spellSlots),
          }));
        }
        return state as unknown as State;
      },
    },
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

/** Sum additive modifier deltas across active effects for a non-stat target.
 *  "set" modifiers (AC overrides) are handled separately in effectiveAc. */
export const sumEffectBonus = (
  effects: Effect[],
  target:
    | "ac"
    | "dc"
    | "spellAttack"
    | "weaponAttack"
    | "damage"
    | "extraAction"
    | "speed",
): number => {
  let total = 0;
  for (const e of effects) {
    for (const m of e.modifiers) {
      if (m.target === target && (m.op ?? "add") === "add") total += m.delta;
    }
  }
  return total;
};

/**
 * Effective Armor Class: the highest of the manual base AC and any "set" AC
 * from active spells/gear (e.g. Mage Armor 13+DEX, Barkskin 16), plus flat AC
 * bonuses on top. `stats` should be the effective (buffed) ability scores.
 */
export const effectiveAc = (
  c: Character,
  effects: Effect[],
  stats: Stats,
): number => {
  const acMods = effects
    .flatMap((e) => e.modifiers)
    .filter((m) => m.target === "ac");
  const add = acMods
    .filter((m) => (m.op ?? "add") === "add")
    .reduce((sum, m) => sum + m.delta, 0);
  const sets = acMods
    .filter((m) => m.op === "set")
    .map((m) => m.delta + (m.plusStat ? modifier(stats[m.plusStat]) : 0));
  const base = sets.length ? Math.max(c.ac, ...sets) : c.ac;
  return base + add;
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

/** Product of speed ×multipliers from active spells/gear (e.g. Haste ×2). */
export const effectSpeedMult = (effects: Effect[]): number => {
  let mult = 1;
  for (const e of effects)
    for (const m of e.modifiers)
      if (m.target === "speed" && m.op === "mult") mult *= m.delta || 1;
  return mult;
};

/**
 * Effective walking speed: (base − armor penalty + flat spell/gear bonuses)
 * × spell/gear multipliers (Haste), then the manual Speed-card modifiers *in
 * list order* (so ordering matters — +10 then ×2 ≠ ×2 then +10). Floored at 0.
 */
export const computeEffectiveSpeed = (
  base: number,
  modifiers: SpeedModifier[],
  penalty = 0,
  extraAdd = 0,
  extraMult = 1,
): number => {
  let speed = (base + penalty + extraAdd) * extraMult;
  for (const m of modifiers) {
    if (m.op === "add") speed += m.value;
    else if (m.op === "mult") speed *= m.value || 1;
  }
  return Math.max(0, Math.round(speed));
};
