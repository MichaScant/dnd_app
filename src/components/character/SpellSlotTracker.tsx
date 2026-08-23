import { Input } from "@/components/ui/input";
import { RotateCcw } from "lucide-react";

/** 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th", … */
const ordinal = (n: number): string => {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`;
};

/**
 * Spell-slot tracker for a single tier: shows the slot type, total, and how
 * many are used. Each slot is a pip — click to spend it, click again to
 * recover it. Total is editable; Reset frees all (e.g. after a long rest).
 */
export function SpellSlotTracker({
  level,
  total,
  used,
  onChangeTotal,
  onChangeUsed,
}: {
  level: number;
  total: number;
  used: number;
  onChangeTotal: (total: number) => void;
  onChangeUsed: (used: number) => void;
}) {
  const setUsedTo = (n: number) =>
    onChangeUsed(Math.max(0, Math.min(total, n)));
  const remaining = Math.max(0, total - used);

  return (
    <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-4 rounded-md border border-border bg-background/40 px-3 py-2">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {ordinal(level)}-level slots
      </span>

      {total > 0 ? (
        <>
          <div className="flex items-center gap-1">
            {Array.from({ length: total }).map((_, i) => {
              const filled = i < used;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setUsedTo(filled ? i : i + 1)}
                  aria-label={
                    filled ? `Slot ${i + 1} spent` : `Slot ${i + 1} available`
                  }
                  title={filled ? "Spent — click to recover" : "Click to spend"}
                  className={`h-4 w-4 rounded-full border transition-colors ${
                    filled
                      ? "border-primary bg-primary"
                      : "border-primary/50 bg-transparent hover:bg-primary/20"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {used}/{total} used · {remaining} left
          </span>
        </>
      ) : (
        <span className="text-[11px] italic text-muted-foreground">
          No slots yet — set a total.
        </span>
      )}

      <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground ml-auto">
        Total
        <Input
          type="number"
          min={0}
          value={total}
          onChange={(e) => onChangeTotal(Math.max(0, +e.target.value || 0))}
          className="h-7 w-14 text-center"
          aria-label={`${ordinal(level)}-level slot total`}
        />
      </label>

      {used > 0 && (
        <button
          type="button"
          onClick={() => onChangeUsed(0)}
          className="text-[11px] flex items-center gap-1 text-muted-foreground hover:text-primary"
          title="Recover all slots (e.g. after a long rest)"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      )}
    </div>
  );
}
