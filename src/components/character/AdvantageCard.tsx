import { Character, AdvantageEntry } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dices, Plus, Trash2 } from "lucide-react";
import { CollapsibleCard } from "@/components/character/CollapsibleCard";
import { SELECT_COMPACT } from "@/components/character/FormField";

/**
 * Front-sheet tracker for rolls the character has advantage / disadvantage on.
 * Cast spells inject theirs automatically (tagged, auto-removed when the spell
 * ends); add your own for racial traits, class features, conditions, etc.
 */
export function AdvantageCard({ c }: { c: Character }) {
  const { addAdvantage, updateAdvantage, removeAdvantage } = useStore();
  const rows = c.advantages ?? [];

  return (
    <CollapsibleCard
      storageId="advantage"
      title={
        <>
          <Dices className="h-4 w-4 text-primary" /> Advantage & Disadvantage
        </>
      }
    >
      <p className="text-xs text-muted-foreground mb-4">
        Rolls you have advantage or disadvantage on. Cast spells add theirs
        automatically; add your own below.
      </p>

      {rows.length > 0 && (
        <div className="space-y-2 mb-4">
          {rows.map((r) => (
            <AdvRow
              key={r.id}
              r={r}
              onChange={(patch) => updateAdvantage(c.id, r.id, patch)}
              onRemove={() => removeAdvantage(c.id, r.id)}
            />
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" onClick={() => addAdvantage(c.id)}>
        <Plus className="h-4 w-4 mr-1" /> Add
      </Button>
    </CollapsibleCard>
  );
}

function AdvRow({
  r,
  onChange,
  onRemove,
}: {
  r: AdvantageEntry;
  onChange: (patch: Partial<Omit<AdvantageEntry, "id">>) => void;
  onRemove: () => void;
}) {
  const dis = r.kind === "disadvantage";
  return (
    <div className="flex items-center gap-2 flex-wrap rounded-md border border-border bg-background/40 px-3 py-2">
      {r.source && (
        <span
          className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/40 text-primary shrink-0"
          title="Added by a cast spell — clears when the spell ends"
        >
          spell
        </span>
      )}
      <select
        className={`${SELECT_COMPACT} ${dis ? "text-destructive" : "text-primary"}`}
        value={r.kind}
        onChange={(e) =>
          onChange({ kind: e.target.value as "advantage" | "disadvantage" })
        }
        aria-label="Advantage or disadvantage"
      >
        <option value="advantage">Advantage</option>
        <option value="disadvantage">Disadvantage</option>
      </select>
      <span className="text-sm text-muted-foreground">on</span>
      <Input
        value={r.roll}
        onChange={(e) => onChange({ roll: e.target.value })}
        placeholder="Dex saves, attack rolls, Stealth…"
        className="flex-1 min-w-[8rem] h-9"
        aria-label="Applies to"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Remove"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
