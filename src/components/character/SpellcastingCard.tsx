import {
  Character,
  StatKey,
  STAT_KEYS,
  STAT_LABELS,
  modifier,
  formatMod,
} from "@/lib/types";
import {
  useStore,
  activeEffects,
  effectiveStats,
  sumEffectBonus,
} from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

const SELECT_CLASS =
  "w-full bg-input border border-border rounded-md px-3 py-2 text-sm";

/**
 * Front-sheet spellcasting stats: Spell Save DC (8 + proficiency + ability mod)
 * and Spell Attack (proficiency + ability mod), both including any "dc" /
 * "spellAttack" effect bonuses. Pick the spellcasting ability to drive them.
 */
export function SpellcastingCard({ c }: { c: Character }) {
  const update = useStore((s) => s.update);
  const ability = c.spellAbility;
  const base = c.spellDcBase ?? 8;
  const all = activeEffects(c);
  const effective = effectiveStats(c.stats, all);
  const abilityMod = ability ? modifier(effective[ability]) : 0;
  const dc = base + c.proficiencyBonus + abilityMod + sumEffectBonus(all, "dc");
  const atk =
    c.proficiencyBonus + abilityMod + sumEffectBonus(all, "spellAttack");
  // Show numbers once the character is actually set up as a caster.
  const show = ability !== undefined || c.spellDcBase !== undefined;

  return (
    <section className="grimoire-card p-6">
      <h3 className="font-display text-lg mb-1 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" /> Spellcasting
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Save DC = base + proficiency + spellcasting-ability modifier. Pick the
        ability you cast with; the base is 8 by default.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
        <div className="col-span-2 sm:col-span-1">
          <Label className="text-[11px] uppercase text-muted-foreground">
            Ability
          </Label>
          <select
            className={SELECT_CLASS}
            value={ability ?? ""}
            onChange={(e) =>
              update(c.id, {
                spellAbility: (e.target.value || undefined) as
                  | StatKey
                  | undefined,
              })
            }
          >
            <option value="">— None —</option>
            {STAT_KEYS.map((k) => (
              <option key={k} value={k}>
                {STAT_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-[11px] uppercase text-muted-foreground">
            Base DC
          </Label>
          <Input
            type="number"
            value={base}
            onChange={(e) =>
              update(c.id, { spellDcBase: Math.max(0, +e.target.value || 0) })
            }
          />
        </div>
        <StatBox label="Spell Save DC" value={show ? String(dc) : "—"} />
        <StatBox label="Spell Attack" value={show ? formatMod(atk) : "—"} />
      </div>
    </section>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-3 text-center">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-3xl font-display text-primary">{value}</div>
    </div>
  );
}
