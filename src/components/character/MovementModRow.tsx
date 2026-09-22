import { SpeedModifier } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { SELECT_COMPACT } from "@/components/character/FormField";

/**
 * One reorderable add/×multiply modifier row, shared by the Speed and Jump
 * calculators. Rows injected by a cast spell carry a "spell" badge.
 */
export function MovementModRow({
  m,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMove,
}: {
  m: SpeedModifier;
  isFirst: boolean;
  isLast: boolean;
  onChange: (patch: Partial<Omit<SpeedModifier, "id">>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap rounded-md border border-border bg-background/40 px-3 py-2">
      <div className="flex flex-col shrink-0">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={isFirst}
          className="text-muted-foreground hover:text-primary disabled:opacity-30"
          aria-label="Move up"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={isLast}
          className="text-muted-foreground hover:text-primary disabled:opacity-30"
          aria-label="Move down"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      {m.source && (
        <span
          className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/40 text-primary shrink-0"
          title="Added by a cast spell — clears when the spell ends"
        >
          spell
        </span>
      )}
      <Input
        value={m.label}
        onChange={(e) => onChange({ label: e.target.value })}
        placeholder="Haste, Tabaxi…"
        className="flex-1 min-w-[7rem] h-9"
        aria-label="Modifier label"
      />
      <select
        className={SELECT_COMPACT}
        value={m.op}
        onChange={(e) => onChange({ op: e.target.value as "add" | "mult" })}
        aria-label="Operation"
      >
        <option value="add">＋ add</option>
        <option value="mult">✕ multiply</option>
      </select>
      <Input
        type="number"
        value={m.value}
        onChange={(e) => onChange({ value: +e.target.value || 0 })}
        className="w-20 h-9 text-center"
        aria-label="Value"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Remove modifier"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
