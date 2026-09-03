import { useState } from "react";
import { toast } from "sonner";
import { Character, HomebrewSpell } from "@/lib/types";
import { useStore, concentrationCount } from "@/lib/store";
import { SpellForm } from "@/components/character/SpellForm";
import { SpellCard } from "@/components/character/SpellCard";
import { SpellSlotTracker } from "@/components/character/SpellSlotTracker";
import {
  ConcentrationDialog,
  CastPrompt,
} from "@/components/character/ConcentrationDialog";
import { SrdSpellPicker } from "@/components/character/SrdSpellPicker";
import { Plus } from "lucide-react";

/** Bucket the spellbook by level (0 = cantrip), lowest first. */
const byLevel = (spells: HomebrewSpell[]): [number, HomebrewSpell[]][] => {
  const groups: Record<number, HomebrewSpell[]> = {};
  for (const s of spells) (groups[s.level] ??= []).push(s);
  return Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b)
    .map((lvl) => [lvl, groups[lvl]]);
};

const levelLabel = (lvl: number) => (lvl === 0 ? "Cantrips" : `Level ${lvl}`);

export function SpellsTab({ c }: { c: Character }) {
  const {
    removeSpell,
    addEffect,
    removeEffect,
    addSpeedModifiersForEffect,
    addSpellSlotTier,
    updateSpellSlotTier,
    removeSpellSlotTier,
  } = useStore();
  const [editing, setEditing] = useState<HomebrewSpell | null>(null);
  const [prompt, setPrompt] = useState<CastPrompt | null>(null);

  const spellSlots = Array.isArray(c.spellSlots) ? c.spellSlots : [];

  const max = c.concentrationMax ?? 1;
  const activeConcentration = c.effects.filter((e) => e.concentration);
  const activeEffectFor = (name: string) =>
    c.effects.find(
      (e) => e.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );

  const startEdit = (s: HomebrewSpell) => {
    setEditing(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasMods = (s: HomebrewSpell) => (s.modifiers?.length ?? 0) > 0;

  /** Register the spell as an active effect. `applyMods` false = cast on
   *  someone else, so no bonuses touch your sheet (but concentration still
   *  counts, since you're the one concentrating). */
  const doCast = (s: HomebrewSpell, applyMods: boolean) => {
    const all = applyMods ? (s.modifiers ?? []) : [];
    // Speed modifiers become rows on the Speed card; the rest live on the effect.
    const speedMods = all.filter((m) => m.target === "speed");
    const otherMods = all.filter((m) => m.target !== "speed");
    const effectId = addEffect(c.id, {
      kind: "buff",
      name: s.name,
      description: s.description,
      duration: s.duration,
      modifiers: otherMods,
      concentration: !!s.concentration,
    });
    if (effectId) {
      if (speedMods.length)
        addSpeedModifiersForEffect(
          c.id,
          effectId,
          speedMods.map((m) => ({
            label: s.name,
            op: m.op === "mult" ? ("mult" as const) : ("add" as const),
            value: m.delta,
          })),
        );
      toast.success(`Cast ${s.name}`, {
        description: applyMods
          ? s.concentration
            ? "On you · concentrating"
            : "Bonuses applied"
          : s.concentration
            ? "On another · concentrating"
            : "On another — no changes",
      });
    } else toast.warning(`${s.name} is already active`);
  };

  /** Cast, routing through the concentration-limit "drop" step if needed. */
  const finalizeCast = (s: HomebrewSpell, applyMods: boolean) => {
    if (s.concentration && concentrationCount(c.effects) >= max) {
      setPrompt({ spell: s, stage: "drop", applyMods });
      return;
    }
    doCast(s, applyMods);
    setPrompt(null);
  };

  const cast = (s: HomebrewSpell) => {
    if (activeEffectFor(s.name)) {
      toast.warning(`${s.name} is already active`);
      return;
    }
    // Spells with bonuses ask self vs. other; otherwise just register it.
    if (hasMods(s)) setPrompt({ spell: s, stage: "self", applyMods: true });
    else finalizeCast(s, false);
  };

  /** End an active spell straight from the Spells tab (no trip to Buffs). */
  const uncast = (s: HomebrewSpell) => {
    const e = activeEffectFor(s.name);
    if (e) {
      removeEffect(c.id, e.id);
      toast.success(`Ended ${s.name}`);
    }
  };

  // Cast-dialog actions -----------------------------------------------------
  const castOnSelf = () => {
    if (prompt) finalizeCast(prompt.spell, true);
  };

  const castOnOther = () => {
    if (!prompt) return;
    // On someone else: only worth tracking if it's a concentration spell.
    if (prompt.spell.concentration) finalizeCast(prompt.spell, false);
    else {
      toast.success(`Cast ${prompt.spell.name}`, {
        description: "On another — no changes to your sheet",
      });
      setPrompt(null);
    }
  };

  const dropAndCast = (effectId: string) => {
    if (!prompt) return;
    removeEffect(c.id, effectId);
    doCast(prompt.spell, prompt.applyMods);
    setPrompt(null);
  };

  // Render a section per level that has spells OR slot groups, so slots stay
  // visible and editable even for tiers you haven't added spells to yet.
  const spellsByLevel = new Map(byLevel(c.spells));
  const levels = [
    ...new Set([...spellsByLevel.keys(), ...spellSlots.map((t) => t.level)]),
  ].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Pull a spell from the official 5e list, or scribe your own below.
        </p>
        <SrdSpellPicker c={c} />
      </div>

      <SpellForm
        key={editing?.id ?? "new"}
        c={c}
        editing={editing}
        onDone={() => setEditing(null)}
      />

      {levels.length === 0 ? (
        <div className="grimoire-card p-12 text-center text-muted-foreground italic">
          The spellbook is empty. Scribe your first incantation above.
        </div>
      ) : (
        levels.map((lvl) => {
          const spells = spellsByLevel.get(lvl) ?? [];
          const tiers = spellSlots.filter((t) => t.level === lvl);
          return (
            <section key={lvl} className="grimoire-card p-5">
              <h4 className="font-display text-sm uppercase tracking-widest text-primary mb-3">
                {levelLabel(lvl)}
              </h4>
              {/* Spell slots — cantrips (level 0) don't use them. A tier can
                  hold slots for a different caster class, so allow several. */}
              {lvl > 0 && (
                <div className="space-y-2 mb-4">
                  {tiers.map((t) => (
                    <SpellSlotTracker
                      key={t.id}
                      level={lvl}
                      total={t.total}
                      used={t.used}
                      type={t.type ?? ""}
                      onChangeTotal={(n) =>
                        updateSpellSlotTier(c.id, t.id, { total: n })
                      }
                      onChangeUsed={(n) =>
                        updateSpellSlotTier(c.id, t.id, { used: n })
                      }
                      onChangeType={(ty) =>
                        updateSpellSlotTier(c.id, t.id, { type: ty })
                      }
                      onRemove={() => removeSpellSlotTier(c.id, t.id)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => addSpellSlotTier(c.id, lvl)}
                    className="text-[11px] flex items-center gap-1 text-muted-foreground hover:text-primary border border-dashed border-border rounded-md px-2 py-1"
                  >
                    <Plus className="h-3 w-3" /> Add slots
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {spells.map((s) => (
                  <SpellCard
                    key={s.id}
                    spell={s}
                    active={!!activeEffectFor(s.name)}
                    onCast={() => cast(s)}
                    onUncast={() => uncast(s)}
                    onEdit={() => startEdit(s)}
                    onRemove={() => removeSpell(c.id, s.id)}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}

      <ConcentrationDialog
        prompt={prompt}
        count={concentrationCount(c.effects)}
        max={max}
        activeConcentration={activeConcentration}
        onClose={() => setPrompt(null)}
        onCastSelf={castOnSelf}
        onCastOther={castOnOther}
        onDrop={dropAndCast}
      />
    </div>
  );
}
