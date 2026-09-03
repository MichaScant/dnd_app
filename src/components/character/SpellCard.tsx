import { HomebrewSpell } from "@/lib/types";
import { ModifierChips } from "@/components/character/ModifierChips";
import { Button } from "@/components/ui/button";
import { Trash2, Wand2, Brain, Pencil, X } from "lucide-react";

/** A single spell in the spellbook: stats, description, and a Cast action. */
export function SpellCard({
  spell,
  active,
  onCast,
  onUncast,
  onEdit,
  onRemove,
}: {
  spell: HomebrewSpell;
  active: boolean;
  onCast: () => void;
  onUncast: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const hasMods = !!spell.modifiers?.length;
  // Only spells that actually do something on cast (a buff or concentration).
  const castable = hasMods || !!spell.concentration;

  return (
    <div className="border border-border rounded-md p-3 bg-background/40">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display flex items-center gap-2">
            {spell.name}
            {spell.concentration && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/40 text-primary flex items-center gap-1">
                <Brain className="h-3 w-3" /> Conc.
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {spell.school}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            className="text-muted-foreground hover:text-primary"
            aria-label="Edit spell"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove spell"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground mt-2">
        <div>
          <span className="block uppercase text-[9px]">Cast</span>
          {spell.castingTime}
        </div>
        <div>
          <span className="block uppercase text-[9px]">Range</span>
          {spell.range}
        </div>
        <div>
          <span className="block uppercase text-[9px]">Dur</span>
          {spell.duration}
        </div>
      </div>

      {spell.description && (
        <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">
          {spell.description}
        </p>
      )}
      <ModifierChips modifiers={spell.modifiers} />

      {castable &&
        (active ? (
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full"
            onClick={onUncast}
          >
            <X className="h-3.5 w-3.5 mr-1.5" /> End (active)
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className="mt-3 w-full"
            onClick={onCast}
          >
            <Wand2 className="h-3.5 w-3.5 mr-1.5" /> Cast
            {spell.concentration ? "" : " (apply as effect)"}
          </Button>
        ))}
    </div>
  );
}
