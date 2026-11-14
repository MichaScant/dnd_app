import { Character } from "@/lib/types";
import {
  useStore,
  activeEffects,
  effectiveStats,
  effectiveJump,
  sumEffectBonus,
  effectMult,
} from "@/lib/store";
import { MovementModRow } from "@/components/character/MovementModRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowUp, Plus } from "lucide-react";
import { CollapsibleCard } from "@/components/character/CollapsibleCard";

/**
 * Front-sheet jump-distance calculator. Base defaults to the character's
 * Strength score (a running long jump); add flat / ×multiply modifiers (e.g.
 * the Jump spell ×3). Mirrors the Speed calculator.
 */
export function JumpCard({ c }: { c: Character }) {
  const {
    update,
    addJumpModifier,
    updateJumpModifier,
    removeJumpModifier,
    moveJumpModifier,
  } = useStore();
  const all = activeEffects(c);
  const effective = effectiveStats(c.stats, all);
  const base = c.jumpBase ?? effective.str;
  const mods = c.jumpModifiers ?? [];
  const effAdd = sumEffectBonus(all, "jump");
  const effMult = effectMult(all, "jump");
  const eff = effectiveJump(base, mods, all);
  const start = (base + effAdd) * effMult;

  return (
    <CollapsibleCard
      storageId="jump"
      title={
        <>
          <ArrowUp className="h-4 w-4 text-primary" /> Jump
        </>
      }
    >
      <p className="text-xs text-muted-foreground mb-4">
        Long-jump distance (defaults to your Strength score). Stack bonuses —
        racial traits, the Jump spell (×3), and so on.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mb-4">
        <div>
          <Label className="text-[11px] uppercase text-muted-foreground">
            Base jump (ft)
          </Label>
          <Input
            type="number"
            min={0}
            value={base}
            onChange={(e) =>
              update(c.id, { jumpBase: Math.max(0, +e.target.value || 0) })
            }
          />
        </div>
        <div className="rounded-md border border-border bg-background/40 p-3 text-center">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Effective jump
          </div>
          <div className="text-3xl font-display text-primary">
            {eff}
            <span className="text-sm text-muted-foreground ml-1">ft</span>
          </div>
          {mods.length > 0 && (
            <div className="text-[11px] text-muted-foreground mt-1 tabular-nums">
              {start}
              {mods.map((m, i) => (
                <span key={i}>
                  {" "}
                  {m.op === "add"
                    ? `${m.value >= 0 ? "+" : ""}${m.value}`
                    : `×${m.value}`}
                </span>
              ))}{" "}
              = {eff}
            </div>
          )}
          {(effAdd !== 0 || effMult !== 1) && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              incl.
              {effAdd !== 0 ? ` ${effAdd > 0 ? "+" : ""}${effAdd} ft` : ""}
              {effMult !== 1 ? ` ×${effMult}` : ""} from active spells & gear
            </div>
          )}
        </div>
      </div>

      <Label className="text-[11px] uppercase text-muted-foreground">
        Modifiers <span className="normal-case">(applied top to bottom)</span>
      </Label>
      <div className="space-y-2 mt-1.5">
        {mods.length === 0 && (
          <p className="text-[11px] text-muted-foreground italic">
            No modifiers yet. Add a +10 racial jump, the Jump spell (×3), etc.
          </p>
        )}
        {mods.map((m, i) => (
          <MovementModRow
            key={m.id}
            m={m}
            isFirst={i === 0}
            isLast={i === mods.length - 1}
            onChange={(patch) => updateJumpModifier(c.id, m.id, patch)}
            onRemove={() => removeJumpModifier(c.id, m.id)}
            onMove={(dir) => moveJumpModifier(c.id, m.id, dir)}
          />
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => addJumpModifier(c.id)}
      >
        <Plus className="h-4 w-4 mr-1" /> Add modifier
      </Button>
    </CollapsibleCard>
  );
}
