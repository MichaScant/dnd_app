import {
  DEFAULT_SKILLS,
  ModTarget,
  MOD_TARGET_LABELS,
  STAT_KEYS,
  STAT_LABELS,
} from "@/lib/types";
import { DraftMod, StatChoice, TARGET_OPTIONS } from "@/lib/modifiers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

/**
 * Controlled editor for a list of stat modifiers.
 * Shared by EffectsTab (buffs/debuffs) and SpellsTab (homebrew spells).
 */
export function ModifierEditor({
  mods,
  onChange,
  emptyHint = "No modifiers. Add some if this changes ability scores, AC, DC, saves, attack rolls, damage, or skills.",
}: {
  mods: DraftMod[];
  onChange: (mods: DraftMod[]) => void;
  emptyHint?: string;
}) {
  const addMod = () =>
    onChange([...mods, { target: "stat", stat: "str", delta: 0 }]);

  const updateMod = (i: number, patch: Partial<DraftMod>) =>
    onChange(
      mods.map((x, idx) => {
        if (idx !== i) return x;
        const next = { ...x, ...patch };
        if (patch.target) {
          if (patch.target === "stat" || patch.target === "save") {
            next.stat = next.stat ?? "str";
            next.skill = undefined;
          } else if (patch.target === "skill") {
            next.skill = next.skill ?? DEFAULT_SKILLS[0];
            next.stat = undefined;
          } else {
            next.stat = undefined;
            next.skill = undefined;
          }
        }
        return next;
      }),
    );

  const removeMod = (i: number) => onChange(mods.filter((_, idx) => idx !== i));

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          Modifiers
        </Label>
        <Button type="button" size="sm" variant="outline" onClick={addMod}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add modifier
        </Button>
      </div>
      <div className="space-y-2">
        {mods.length === 0 && (
          <p className="text-xs text-muted-foreground italic">{emptyHint}</p>
        )}
        {mods.map((m, i) => {
          const target = m.target ?? "stat";
          return (
            <div
              key={i}
              className="flex flex-wrap items-center gap-2 bg-secondary/40 rounded-md p-2 border border-border"
            >
              <select
                value={target}
                onChange={(e) =>
                  updateMod(i, { target: e.target.value as ModTarget })
                }
                className="bg-input border border-border rounded-md px-2 py-1.5 text-sm flex-1 min-w-[10rem]"
              >
                {TARGET_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {MOD_TARGET_LABELS[t]}
                  </option>
                ))}
              </select>

              {(target === "stat" || target === "save") && (
                <select
                  value={(m.stat as StatChoice) ?? "str"}
                  onChange={(e) =>
                    updateMod(i, { stat: e.target.value as StatChoice })
                  }
                  className="bg-input border border-border rounded-md px-2 py-1.5 text-sm flex-1 min-w-[8rem]"
                >
                  {STAT_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {STAT_LABELS[k]}
                    </option>
                  ))}
                  <option value="all">All Stats</option>
                </select>
              )}

              {target === "skill" && (
                <select
                  value={m.skill ?? DEFAULT_SKILLS[0]}
                  onChange={(e) => updateMod(i, { skill: e.target.value })}
                  className="bg-input border border-border rounded-md px-2 py-1.5 text-sm flex-1 min-w-[10rem]"
                >
                  {DEFAULT_SKILLS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}

              <Input
                type="number"
                value={m.delta}
                onChange={(e) => updateMod(i, { delta: +e.target.value || 0 })}
                className="w-24 text-center"
                placeholder="±"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeMod(i)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
