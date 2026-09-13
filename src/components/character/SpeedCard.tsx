import { Character } from "@/lib/types";
import {
  useStore,
  computeEffectiveSpeed,
  activeEffects,
  sumEffectBonus,
  effectSpeedMult,
} from "@/lib/store";
import { MovementModRow } from "@/components/character/MovementModRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Footprints, Plus, TriangleAlert } from "lucide-react";
import { CollapsibleCard } from "@/components/character/CollapsibleCard";

/**
 * Front-sheet Speed calculator: a base walking speed plus a stack of modifiers
 * (flat adds like +10 Tabaxi, or multipliers like ×2 Haste). Shows the
 * resulting effective speed, and folds in the heavy-armor penalty if any.
 */
export function SpeedCard({
  c,
  speedPenalty,
}: {
  c: Character;
  speedPenalty: number;
}) {
  const {
    update,
    addSpeedModifier,
    updateSpeedModifier,
    removeSpeedModifier,
    moveSpeedModifier,
  } = useStore();
  const mods = c.speedModifiers ?? [];
  // Flat + multiplicative "speed" bonuses from active spells & equipped gear.
  const all = activeEffects(c);
  const effectSpeed = sumEffectBonus(all, "speed");
  const effectMult = effectSpeedMult(all);
  const effective = computeEffectiveSpeed(
    c.speed,
    mods,
    speedPenalty,
    effectSpeed,
    effectMult,
  );
  const start = (c.speed + speedPenalty + effectSpeed) * effectMult;

  return (
    <CollapsibleCard
      storageId="speed"
      title={
        <>
          <Footprints className="h-4 w-4 text-primary" /> Speed
        </>
      }
    >
      <p className="text-xs text-muted-foreground mb-4">
        Set your base walking speed, then stack bonuses (racial traits, Haste,
        spells…).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mb-4">
        <div>
          <Label className="text-[11px] uppercase text-muted-foreground">
            Base speed (ft)
          </Label>
          <Input
            type="number"
            min={0}
            value={c.speed}
            onChange={(e) =>
              update(c.id, { speed: Math.max(0, +e.target.value || 0) })
            }
          />
        </div>
        <div className="rounded-md border border-border bg-background/40 p-3 text-center">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Effective speed
          </div>
          <div className="text-3xl font-display text-primary">
            {effective}
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
              = {effective}
            </div>
          )}
          {(effectSpeed !== 0 || effectMult !== 1) && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              incl.
              {effectSpeed !== 0
                ? ` ${effectSpeed > 0 ? "+" : ""}${effectSpeed} ft`
                : ""}
              {effectMult !== 1 ? ` ×${effectMult}` : ""} from active spells &
              gear
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
            No modifiers yet. Add Haste (×2), Tabaxi (+10), a Longstrider spell,
            and so on.
          </p>
        )}
        {mods.map((m, i) => (
          <MovementModRow
            key={m.id}
            m={m}
            isFirst={i === 0}
            isLast={i === mods.length - 1}
            onChange={(patch) => updateSpeedModifier(c.id, m.id, patch)}
            onRemove={() => removeSpeedModifier(c.id, m.id)}
            onMove={(dir) => moveSpeedModifier(c.id, m.id, dir)}
          />
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => addSpeedModifier(c.id)}
      >
        <Plus className="h-4 w-4 mr-1" /> Add modifier
      </Button>

      {speedPenalty !== 0 && (
        <p className="text-[11px] text-destructive flex items-center gap-1 mt-3">
          <TriangleAlert className="h-3 w-3" /> Heavy-armor Strength requirement
          unmet: {speedPenalty} ft is included above.
        </p>
      )}
    </CollapsibleCard>
  );
}
