import { useState, useEffect } from "react";
import {
  Character,
  STAT_KEYS,
  STAT_LABELS,
  SKILL_ABILITY,
  formatMod,
  modifier,
} from "@/lib/types";
import {
  useStore,
  activeEffects,
  effectiveStats,
  equippedItems,
  sumEffectBonus,
  sumSaveBonus,
  sumSkillBonus,
  concentrationCount,
  computeEffectiveSpeed,
  effectSpeedMult,
  effectiveAc,
} from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { EquipmentBox } from "@/components/character/EquipmentBox";
import { ResourcesCard } from "@/components/character/ResourcesCard";
import { SpeedCard } from "@/components/character/SpeedCard";
import { SpellcastingCard } from "@/components/character/SpellcastingCard";
import { ActiveEffectsCard } from "@/components/character/ActiveEffectsCard";
import { CharacterPortrait } from "@/components/character/CharacterPortrait";
import { DEFAULT_SKILLS } from "@/lib/types";
import { Heart, Shield, Footprints, Sparkles, Star, Zap } from "lucide-react";

export function OverviewTab({ c }: { c: Character }) {
  const { update, setStat, toggleSave, cycleSkill } = useStore();
  // Buffs/debuffs + equipped gear all feed the stat, AC, save, and skill math.
  const allEffects = activeEffects(c);
  const effective = effectiveStats(c.stats, allEffects);
  // Heavy armor whose Strength requirement isn't met costs 10 ft of speed (5e).
  const speedPenalty = equippedItems(c).some(
    (it) =>
      it.armorWeight === "Heavy" &&
      it.strengthReq != null &&
      c.stats.str < it.strengthReq,
  )
    ? -10
    : 0;
  const effSpeed = computeEffectiveSpeed(
    c.speed,
    c.speedModifiers ?? [],
    speedPenalty,
    sumEffectBonus(allEffects, "speed"),
    effectSpeedMult(allEffects),
  );

  return (
    <div className="space-y-6">
      {/* Identity */}
      <section className="grimoire-card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <CharacterPortrait c={c} />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field label="Name" className="md:col-span-2">
              <Input
                value={c.name}
                onChange={(e) => update(c.id, { name: e.target.value })}
              />
            </Field>
            <Field label="Race">
              <Input
                value={c.race}
                onChange={(e) => update(c.id, { race: e.target.value })}
                placeholder="Tiefling…"
              />
            </Field>
            <Field label="Class">
              <Input
                value={c.classSummary}
                onChange={(e) => update(c.id, { classSummary: e.target.value })}
                placeholder="Warlock 3 / Bard 2"
              />
            </Field>
            <Field label="Level">
              <Input
                type="number"
                value={c.level}
                onChange={(e) => update(c.id, { level: +e.target.value || 1 })}
              />
            </Field>
            <Field label="XP">
              <Input
                type="number"
                value={c.xp}
                onChange={(e) => update(c.id, { xp: +e.target.value || 0 })}
              />
            </Field>
            <Field label="Proficiency Bonus">
              <Input
                type="number"
                value={c.proficiencyBonus}
                onChange={(e) =>
                  update(c.id, { proficiencyBonus: +e.target.value || 2 })
                }
              />
            </Field>
            <Field label="Concentration">
              {(() => {
                const current = concentrationCount(c.effects);
                const max = c.concentrationMax ?? 1;
                return (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-2xl font-display tabular-nums ${current > max ? "text-destructive" : current > 0 ? "text-primary" : ""}`}
                    >
                      {current}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <Input
                      type="number"
                      min={1}
                      value={max}
                      onChange={(e) =>
                        update(c.id, {
                          concentrationMax: Math.max(1, +e.target.value || 1),
                        })
                      }
                      className="w-16 text-center"
                      aria-label="Maximum concentration"
                    />
                  </div>
                );
              })()}
            </Field>
          </div>
        </div>
      </section>

      {/* Vitals */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <VitalCard
          icon={<Heart className="h-4 w-4" />}
          label="Hit Points"
          accent="ember"
        >
          <div className="flex items-center gap-1">
            <HpInput value={c.hp} onCommit={(v) => update(c.id, { hp: v })} />
            <span className="text-muted-foreground">/</span>
            <HpInput
              value={c.maxHp}
              onCommit={(v) => update(c.id, { maxHp: v })}
            />
          </div>
        </VitalCard>
        <VitalCard icon={<Shield className="h-4 w-4" />} label="Armor Class">
          {(() => {
            const totalAc = effectiveAc(c, allEffects, effective);
            const changed = totalAc !== c.ac;
            return (
              <div className="relative">
                <Input
                  type="number"
                  value={c.ac}
                  onChange={(e) => update(c.id, { ac: +e.target.value || 0 })}
                  className={`text-center text-2xl font-display h-12 ${changed ? "pr-12" : ""}`}
                />
                {changed && (
                  <span
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-sm font-display tabular-nums ${totalAc > c.ac ? "text-primary" : "text-destructive"}`}
                    title={`Base ${c.ac}, effective ${totalAc} from set-AC / bonuses (spells & gear)`}
                  >
                    = {totalAc}
                  </span>
                )}
              </div>
            );
          })()}
        </VitalCard>
        <VitalCard icon={<Footprints className="h-4 w-4" />} label="Speed">
          <div className="text-center text-2xl font-display h-12 flex items-center justify-center gap-1.5">
            {effSpeed}
            {effSpeed !== c.speed && (
              <span className="text-xs text-muted-foreground">
                (base {c.speed})
              </span>
            )}
          </div>
        </VitalCard>
        <VitalCard
          icon={<Sparkles className="h-4 w-4" />}
          label="Active Effects"
        >
          <div className="text-2xl font-display h-12 flex items-center justify-center text-primary">
            {c.effects.length}
          </div>
        </VitalCard>
        {(() => {
          const extraActions = sumEffectBonus(allEffects, "extraAction");
          if (extraActions === 0) return null;
          return (
            <VitalCard icon={<Zap className="h-4 w-4" />} label="Actions">
              <div className="text-2xl font-display h-12 flex items-center justify-center text-primary">
                {1 + extraActions}
                <span className="text-xs text-muted-foreground ml-1.5">
                  ({extraActions > 0 ? `+${extraActions}` : extraActions})
                </span>
              </div>
            </VitalCard>
          );
        })()}
      </section>

      {/* Stats */}
      <section className="grimoire-card p-6">
        <h3 className="font-display text-lg mb-1">Ability Scores</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Base values; buffs, debuffs, and equipped gear apply automatically.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAT_KEYS.map((k) => {
            const base = c.stats[k];
            const eff = effective[k];
            const diff = eff - base;
            return (
              <div
                key={k}
                className="rounded-lg border border-border bg-secondary/40 p-3 text-center relative overflow-hidden"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {STAT_LABELS[k]}
                </div>
                <Input
                  type="number"
                  value={base}
                  onChange={(e) => setStat(c.id, k, +e.target.value || 0)}
                  className="my-2 text-center text-2xl font-display h-12 bg-background/40"
                />
                <div
                  className={`text-lg font-display ${diff > 0 ? "text-primary" : diff < 0 ? "text-destructive" : ""}`}
                >
                  {formatMod(modifier(eff))}
                </div>
                {diff !== 0 && (
                  <div
                    className={`text-[10px] mt-0.5 ${diff > 0 ? "text-primary" : "text-destructive"}`}
                  >
                    ({eff} {diff > 0 ? `+${diff}` : diff})
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Spellcasting: Save DC & attack */}
      <SpellcastingCard c={c} />

      {/* What's currently affecting the character */}
      <ActiveEffectsCard c={c} />

      {/* Speed: base + modifier calculator */}
      <SpeedCard c={c} speedPenalty={speedPenalty} />

      {/* Custom campaign resources (mana, ki, …) */}
      <ResourcesCard c={c} />

      {/* Saving Throws + Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="grimoire-card p-6">
          <h3 className="font-display text-lg mb-4">Saving Throws</h3>
          <div className="space-y-2">
            {STAT_KEYS.map((k) => {
              const mod =
                modifier(effective[k]) +
                (c.savingThrows[k] ? c.proficiencyBonus : 0) +
                sumSaveBonus(allEffects, k);
              return (
                <label
                  key={k}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={c.savingThrows[k]}
                    onCheckedChange={() => toggleSave(c.id, k)}
                  />
                  <span className="flex-1 text-sm">{STAT_LABELS[k]}</span>
                  <span className="font-display text-primary">
                    {formatMod(mod)}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="grimoire-card p-6">
          <h3 className="font-display text-lg mb-1">Skill Proficiencies</h3>
          <p className="text-[11px] text-muted-foreground mb-3">
            Click to cycle: none → proficient → expertise.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {DEFAULT_SKILLS.map((s) => {
              const ability = SKILL_ABILITY[s] ?? "int";
              const isProf = c.skillProficiencies.includes(s);
              const isExp = (c.skillExpertise ?? []).includes(s);
              const pbMult = isExp ? 2 : isProf ? 1 : 0;
              const bonus =
                modifier(effective[ability]) +
                pbMult * c.proficiencyBonus +
                sumSkillBonus(allEffects, s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => cycleSkill(c.id, s)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted/50 text-left"
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${
                      isExp
                        ? "border-primary bg-primary/30 text-primary"
                        : isProf
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border bg-background/40"
                    }`}
                    aria-hidden
                  >
                    {isExp ? (
                      <Star className="h-3 w-3 fill-current" />
                    ) : isProf ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    ) : null}
                  </span>
                  <span className="flex-1">
                    {s}
                    <span className="text-[10px] text-muted-foreground ml-1 uppercase">
                      ({ability})
                    </span>
                  </span>
                  <span
                    className={`font-display tabular-nums ${
                      isExp
                        ? "text-primary"
                        : isProf
                          ? "text-primary/80"
                          : "text-muted-foreground"
                    }`}
                  >
                    {formatMod(bonus)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <EquipmentBox c={c} />

      <section className="grimoire-card p-6">
        <h3 className="font-display text-lg mb-3">Notes & Backstory</h3>
        <Textarea
          rows={6}
          value={c.notes}
          onChange={(e) => update(c.id, { notes: e.target.value })}
          placeholder="Born under a blood moon…"
        />
      </section>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}
      </Label>
      {children}
    </div>
  );
}

function VitalCard({
  icon,
  label,
  children,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  accent?: "ember";
}) {
  return (
    <div
      className={`grimoire-card p-4 ${accent === "ember" ? "ember-glow" : ""}`}
    >
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground mb-2">
        {icon} {label}
      </div>
      {children}
    </div>
  );
}

function HpInput({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <Input
      type="number"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(Number(draft) || 0)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onCommit(Number(draft) || 0);
          (e.target as HTMLInputElement).blur();
        }
      }}
      className="text-center text-xl sm:text-2xl font-display h-12 flex-1 min-w-0 px-1"
    />
  );
}
