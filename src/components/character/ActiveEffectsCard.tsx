import { Character } from "@/lib/types";
import { useStore } from "@/lib/store";
import { ModifierChips } from "@/components/character/ModifierChips";
import { Sparkles, Brain, Trash2 } from "lucide-react";

/**
 * Front-sheet list of everything currently affecting the character — cast
 * spells, buffs, and debuffs — with their modifier chips, so it's clear what's
 * driving the stat/AC/speed changes above. End one with the trash button.
 */
export function ActiveEffectsCard({ c }: { c: Character }) {
  const removeEffect = useStore((s) => s.removeEffect);
  const effects = c.effects;
  if (effects.length === 0) return null;

  return (
    <section className="grimoire-card p-6">
      <h3 className="font-display text-lg mb-1 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" /> Active Effects
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Cast spells, buffs, and debuffs affecting you now — their bonuses are
        already folded into your stats above.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {effects.map((e) => (
          <div
            key={e.id}
            className="rounded-md border border-border bg-background/40 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-display flex items-center gap-2 flex-wrap min-w-0">
                <span className="truncate">{e.name}</span>
                {e.concentration && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/40 text-primary flex items-center gap-1 shrink-0">
                    <Brain className="h-3 w-3" /> Conc.
                  </span>
                )}
                {e.kind === "debuff" && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-destructive/40 text-destructive shrink-0">
                    debuff
                  </span>
                )}
              </div>
              <button
                onClick={() => removeEffect(c.id, e.id)}
                className="text-muted-foreground hover:text-destructive shrink-0"
                aria-label={`End ${e.name}`}
                title={`End ${e.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {e.duration && (
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {e.duration}
              </div>
            )}
            {e.modifiers.length > 0 ? (
              <ModifierChips modifiers={e.modifiers} />
            ) : (
              <p className="text-[11px] text-muted-foreground italic mt-1.5">
                No bonuses to your sheet.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
