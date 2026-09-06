import { Character } from "@/lib/types";
import { useStore, activeEffects, effectiveStats } from "@/lib/store";
import {
  standardPreparedMax,
  preparedVars,
  evalPreparedFormula,
} from "@/lib/prepared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookCheck } from "lucide-react";

/**
 * Prepared-spell counter vs. maximum. Default max is the standard 5e
 * calculation (ability modifier + class level, summed across preparing classes
 * using the Leveling tab); a custom formula overrides it.
 */
export function PreparedSpellsCard({ c }: { c: Character }) {
  const update = useStore((s) => s.update);
  const stats = effectiveStats(c.stats, activeEffects(c));
  const standard = standardPreparedMax(c, stats);
  const formula = c.preparedFormula ?? "";
  const usingCustom = formula.trim().length > 0;
  const custom = usingCustom
    ? evalPreparedFormula(formula, preparedVars(c, stats))
    : null;
  const max = usingCustom ? (custom ?? 0) : standard.total;
  const count = c.spells.filter((s) => s.prepared && s.level >= 1).length;
  const over = max > 0 && count > max;

  return (
    <section className="grimoire-card p-6">
      <h3 className="font-display text-lg mb-1 flex items-center gap-2">
        <BookCheck className="h-4 w-4 text-primary" /> Prepared Spells
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        How many level-1+ spells you have prepared vs. your maximum. Leave the
        formula blank for the standard 5e calculation (multiclass-aware).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="rounded-md border border-border bg-background/40 p-3 text-center">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Prepared
          </div>
          <div
            className={`text-3xl font-display ${over ? "text-destructive" : "text-primary"}`}
          >
            {count}
            <span className="text-sm text-muted-foreground">
              {" "}
              / {usingCustom && custom === null ? "?" : max}
            </span>
          </div>
        </div>
        <div className="sm:col-span-2">
          <Label className="text-[11px] uppercase text-muted-foreground">
            Max prepared (formula)
          </Label>
          <Input
            value={formula}
            onChange={(e) => update(c.id, { preparedFormula: e.target.value })}
            placeholder={`auto = ${standard.total}`}
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Variables: level, pb, str, dex, con, int, wis, cha (modifiers). e.g.{" "}
            <code>wis + level</code>. Blank = standard 5e.
          </p>
          {usingCustom && custom === null && (
            <p className="text-[10px] text-destructive mt-0.5">
              Invalid formula — treated as 0.
            </p>
          )}
          {!usingCustom &&
            (standard.breakdown ? (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Standard: {standard.breakdown}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                No preparing class detected — fill the Leveling tab or set a
                formula.
              </p>
            ))}
        </div>
      </div>
    </section>
  );
}
