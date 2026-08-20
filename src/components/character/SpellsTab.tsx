import { useState } from "react";
import { toast } from "sonner";
import { Character, HomebrewSpell } from "@/lib/types";
import { useStore, concentrationCount } from "@/lib/store";
import { SpellForm } from "@/components/character/SpellForm";
import { SpellCard } from "@/components/character/SpellCard";
import {
  ConcentrationDialog,
  CastPrompt,
} from "@/components/character/ConcentrationDialog";
import { SrdSpellPicker } from "@/components/character/SrdSpellPicker";

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
  const { removeSpell, addEffect, removeEffect } = useStore();
  const [editing, setEditing] = useState<HomebrewSpell | null>(null);
  const [prompt, setPrompt] = useState<CastPrompt | null>(null);

  const max = c.concentrationMax ?? 1;
  const activeConcentration = c.effects.filter((e) => e.concentration);
  const isActive = (name: string) =>
    c.effects.some(
      (e) => e.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );

  const startEdit = (s: HomebrewSpell) => {
    setEditing(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** Turn a spell into an active buff effect, reusing the effect engine. */
  const applySpellEffect = (s: HomebrewSpell, concentrating: boolean) => {
    const added = addEffect(c.id, {
      kind: "buff",
      name: s.name,
      description: s.description,
      duration: s.duration,
      modifiers: s.modifiers ?? [],
      concentration: concentrating,
    });
    if (added)
      toast.success(`Cast ${s.name}`, {
        description: concentrating ? "Concentrating" : undefined,
      });
    else toast.warning(`${s.name} is already active`);
  };

  const cast = (s: HomebrewSpell) => {
    if (isActive(s.name)) {
      toast.warning(`${s.name} is already active`);
      return;
    }
    // Concentration spells route through the dialog; everything else applies directly.
    if (s.concentration) setPrompt({ spell: s, stage: "ask" });
    else applySpellEffect(s, false);
  };

  // Concentration-dialog actions --------------------------------------------
  const castUnconcentrated = () => {
    if (!prompt) return;
    applySpellEffect(prompt.spell, false);
    setPrompt(null);
  };

  const castConcentrating = () => {
    if (!prompt) return;
    if (concentrationCount(c.effects) >= max) {
      setPrompt({ ...prompt, stage: "drop" }); // at limit → choose what to drop
      return;
    }
    applySpellEffect(prompt.spell, true);
    setPrompt(null);
  };

  const dropAndCast = (effectId: string) => {
    if (!prompt) return;
    removeEffect(c.id, effectId);
    applySpellEffect(prompt.spell, true);
    setPrompt(null);
  };

  const levels = byLevel(c.spells);

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
        levels.map(([lvl, spells]) => (
          <section key={lvl} className="grimoire-card p-5">
            <h4 className="font-display text-sm uppercase tracking-widest text-primary mb-3">
              {levelLabel(lvl)}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {spells.map((s) => (
                <SpellCard
                  key={s.id}
                  spell={s}
                  onCast={() => cast(s)}
                  onEdit={() => startEdit(s)}
                  onRemove={() => removeSpell(c.id, s.id)}
                />
              ))}
            </div>
          </section>
        ))
      )}

      <ConcentrationDialog
        prompt={prompt}
        count={concentrationCount(c.effects)}
        max={max}
        activeConcentration={activeConcentration}
        onClose={() => setPrompt(null)}
        onCastUnconcentrated={castUnconcentrated}
        onCastConcentrating={castConcentrating}
        onDrop={dropAndCast}
      />
    </div>
  );
}
