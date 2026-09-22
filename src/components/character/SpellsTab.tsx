import { useState } from "react";
import { toast } from "sonner";
import { Character, HomebrewSpell } from "@/lib/types";
import { useStore, concentrationCount } from "@/lib/store";
import { SpellForm } from "@/components/character/SpellForm";
import { SpellCard } from "@/components/character/SpellCard";
import { SpellSlotTracker } from "@/components/character/SpellSlotTracker";
import { PreparedSpellsCard } from "@/components/character/PreparedSpellsCard";
import {
  ConcentrationDialog,
  CastPrompt,
} from "@/components/character/ConcentrationDialog";
import { SrdSpellPicker } from "@/components/character/SrdSpellPicker";
import { groupByLevel, levelLabel } from "@/lib/srd-spells";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SELECT_CLASS } from "@/components/character/FormField";
import { CollapsibleCard } from "@/components/character/CollapsibleCard";
import { Plus, Search, ArrowDownAZ, Flame } from "lucide-react";

const byName = (a: HomebrewSpell, b: HomebrewSpell) =>
  a.name.localeCompare(b.name);

export function SpellsTab({ c }: { c: Character }) {
  const {
    removeSpell,
    updateSpell,
    addEffect,
    removeEffect,
    addSpeedModifiersForEffect,
    addAdvantagesForEffect,
    addJumpModifiersForEffect,
    addSpellSlotTier,
    updateSpellSlotTier,
    removeSpellSlotTier,
    updateResource,
  } = useStore();
  const [editing, setEditing] = useState<HomebrewSpell | null>(null);
  const [prompt, setPrompt] = useState<CastPrompt | null>(null);
  const [search, setSearch] = useState("");
  const [school, setSchool] = useState("");
  const [sortAlpha, setSortAlpha] = useState(false);

  const spellSlots = Array.isArray(c.spellSlots) ? c.spellSlots : [];

  const max = c.concentrationMax ?? 1;
  const activeConcentration = c.effects.filter((e) => e.concentration);
  const activeEffectFor = (name: string) =>
    c.effects.find(
      (e) => e.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );

  const startEdit = (s: HomebrewSpell) => {
    setEditing(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasMods = (s: HomebrewSpell) => (s.modifiers?.length ?? 0) > 0;

  /** Deduct a spell's custom-resource cost from the front sheet, if it has one.
   *  Returns the resource name (and whether the pool ran short) for messaging. */
  const spendCost = (s: HomebrewSpell) => {
    const cost = s.resourceCost;
    const rId = s.resourceId; 
    
    if (!rId || !cost) return null;
    
    const r = (c.resources ?? []).find((x) => x.id === rId);
    if (!r) return null; 

    updateResource(c.id, r.id, { current: Math.max(0, r.current - cost) });
    return { name: r.name, short: r.current < cost, cost };
  };

  /**
   * Spend a slot for a spell. If the spell has a resource cost, spend that instead.
   * @param s - the spell to spend a slot for
   * @returns a message to display to the user
   */
  const spendSlot = (s: HomebrewSpell) => {
    if (s.level < 1 || s.resourceId) return;
    
    const tiers = spellSlots.filter((t) => t.level === s.level);
    if (tiers.length === 0) return;
    const openSlots = tiers.find((slot) => slot.used < slot.total);
    if (!openSlots) {
      toast.warning(`No level-${s.level} slots left`); 
      return; 
    }
    
    updateSpellSlotTier(c.id, openSlots.id, { used: openSlots.used + 1 });
    return `Used a level-${s.level} slot`;
  };

  /** Register the spell as an active effect and/or spend its resource cost.
   *  `applyMods` false = cast on someone else, so no bonuses touch your sheet
   *  (but concentration still counts, and the cost is still paid). */
  const doCast = (s: HomebrewSpell, applyMods: boolean) => {
    const all = applyMods ? (s.modifiers ?? []) : [];
    const speedMods = all.filter((m) => m.target === "speed");
    const jumpMods = all.filter((m) => m.target === "jump");
    const advMods = all.filter((m) => m.target === "advantage");
    const otherMods = all.filter(
      (m) =>
        m.target !== "speed" && m.target !== "jump" && m.target !== "advantage",
    );
    
    const createsEffect =
      !!s.concentration ||
      otherMods.length > 0 ||
      speedMods.length > 0 ||
      jumpMods.length > 0 ||
      advMods.length > 0;

    spendSlot(s);

    if (createsEffect) {
      const effectId = addEffect(c.id, {
        kind: "buff",
        name: s.name,
        description: s.description,
        duration: s.duration,
        modifiers: otherMods,
        concentration: !!s.concentration,
      });
      if (!effectId) {
        toast.warning(`${s.name} is already active`);
        return;
      }
      if (speedMods.length)
        addSpeedModifiersForEffect(
          c.id,
          effectId,
          speedMods.map((m) => ({
            label: s.name,
            op: m.op === "mult" ? ("mult" as const) : ("add" as const),
            value: m.delta,
          })),
        );
      if (jumpMods.length)
        addJumpModifiersForEffect(
          c.id,
          effectId,
          jumpMods.map((m) => ({
            label: s.name,
            op: m.op === "mult" ? ("mult" as const) : ("add" as const),
            value: m.delta,
          })),
        );
      if (advMods.length)
        addAdvantagesForEffect(
          c.id,
          effectId,
          advMods.map((m) => ({
            kind:
              m.advantage === "disadvantage"
                ? ("disadvantage" as const)
                : ("advantage" as const),
            roll: m.note ?? "",
          })),
        );
    }

    const spent = spendCost(s);

    const bits: string[] = [];
    if (createsEffect)
      bits.push(
        applyMods
          ? s.concentration
            ? "On you · concentrating"
            : "Bonuses applied"
          : s.concentration
            ? "On another · concentrating"
            : "On another — no changes",
      );
    if (spent) bits.push(`−${spent.cost} ${spent.name}`);
    toast.success(
      `Cast ${s.name}`,
      bits.length ? { description: bits.join(" · ") } : undefined,
    );
    if (spent?.short) toast.warning(`Not enough ${spent.name} — pool emptied`);
  };

  /** Cast, routing through the concentration-limit "drop" step if needed. */
  const finalizeCast = (s: HomebrewSpell, applyMods: boolean) => {
    if (s.concentration && concentrationCount(c.effects) >= max) {
      setPrompt({ spell: s, stage: "drop", applyMods });
      return;
    }
    doCast(s, applyMods);
    setPrompt(null);
  };

  const cast = (s: HomebrewSpell) => {
    if (activeEffectFor(s.name)) {
      toast.warning(`${s.name} is already active`);
      return;
    }
    // Spells with bonuses ask self vs. other; otherwise just register it.
    if (hasMods(s)) setPrompt({ spell: s, stage: "self", applyMods: true });
    else finalizeCast(s, false);
  };

  /** End an active spell straight from the Spells tab (no trip to Buffs). */
  const uncast = (s: HomebrewSpell) => {
    const e = activeEffectFor(s.name);
    if (e) {
      removeEffect(c.id, e.id);
      toast.success(`Ended ${s.name}`);
    }
  };

  // Cast-dialog actions -----------------------------------------------------
  const castOnSelf = () => {
    if (prompt) finalizeCast(prompt.spell, true);
  };

  const castOnOther = () => {
    if (!prompt) return;
    const s = prompt.spell;
    // On someone else, no self-buff — but still track concentration and still
    // pay any resource cost (the spell was cast either way).
    if (s.concentration) finalizeCast(s, false);
    else if (s.resourceCost) {
      doCast(s, false);
      setPrompt(null);
    } else {
      toast.success(`Cast ${s.name}`, {
        description: "On another — no changes to your sheet",
      });
      setPrompt(null);
    }
  };

  const dropAndCast = (effectId: string) => {
    if (!prompt) return;
    removeEffect(c.id, effectId);
    doCast(prompt.spell, prompt.applyMods);
    setPrompt(null);
  };

  // Schools present in this spellbook, for the filter dropdown.
  const schools = [
    ...new Set(c.spells.map((s) => s.school).filter(Boolean)),
  ].sort();

  // A spell passes the view controls if it matches the search and school.
  const q = search.trim().toLowerCase();
  const matches = (s: HomebrewSpell) =>
    (!q || s.name.toLowerCase().includes(q)) &&
    (!school || s.school === school);

  // Resource spells (costing mana, ki, …) are grouped into their own sections
  // at the top by resource, so they're excluded from the slot-based lists.
  const cantrips = c.spells.filter(
    (s) => !s.resourceId && s.level === 0 && matches(s),
  );
  const prepared = c.spells.filter(
    (s) => !s.resourceId && s.level >= 1 && s.prepared && matches(s),
  );
  const unprepared = c.spells.filter(
    (s) => !s.resourceId && s.level >= 1 && !s.prepared && matches(s),
  );

  // Resource-cost spells grouped under each resource's name (in sheet order),
  // plus a catch-all for spells whose resource was since deleted.
  const resourceList = c.resources ?? [];
  const resourceSpells = c.spells.filter((s) => s.resourceId && matches(s));
  const knownResourceIds = new Set(resourceList.map((r) => r.id));
  const orphanResourceSpells = resourceSpells.filter(
    (s) => !knownResourceIds.has(s.resourceId as string),
  );
  const resourceSections: {
    id: string;
    name: string;
    current?: number;
    max?: number;
    spells: HomebrewSpell[];
  }[] = [
    ...resourceList.map((r) => ({
      id: r.id,
      name: r.name,
      current: r.current,
      max: r.max,
      spells: resourceSpells.filter((s) => s.resourceId === r.id),
    })),
    ...(orphanResourceSpells.length
      ? [
          {
            id: "orphan",
            name: "Other resources",
            spells: orphanResourceSpells,
          },
        ]
      : []),
  ].filter((sec) => sec.spells.length > 0);
  // Tiers shown in the Prepared list: any level you have a prepared spell at
  // (unfiltered, so the layout is stable while searching) or already have slots
  // for. Slots live inline above that level's prepared spells.
  const preparedLevels = [
    ...new Set([
      ...c.spells.filter((s) => s.level >= 1 && s.prepared).map((s) => s.level),
      ...spellSlots.map((t) => t.level),
    ]),
  ].sort((a, b) => a - b);

  // Slot trackers for one spell level, plus an "add another pool" button.
  const renderSlots = (lvl: number) => {
    const tiers = spellSlots.filter((t) => t.level === lvl);
    return (
      <div className="space-y-2">
        {tiers.map((t) => (
          <SpellSlotTracker
            key={t.id}
            level={lvl}
            total={t.total}
            used={t.used}
            type={t.type ?? ""}
            onChangeTotal={(n) => updateSpellSlotTier(c.id, t.id, { total: n })}
            onChangeUsed={(n) => updateSpellSlotTier(c.id, t.id, { used: n })}
            onChangeType={(ty) => updateSpellSlotTier(c.id, t.id, { type: ty })}
            onRemove={() => removeSpellSlotTier(c.id, t.id)}
          />
        ))}
        <button
          type="button"
          onClick={() => addSpellSlotTier(c.id, lvl)}
          className="text-[11px] flex items-center gap-1 text-muted-foreground hover:text-primary border border-dashed border-border rounded-md px-2 py-1"
        >
          <Plus className="h-3 w-3" /> Add slots
        </button>
      </div>
    );
  };

  const renderCard = (s: HomebrewSpell) => (
    <SpellCard
      key={s.id}
      spell={s}
      active={!!activeEffectFor(s.name)}
      onCast={() => cast(s)}
      onUncast={() => uncast(s)}
      onEdit={() => startEdit(s)}
      onRemove={() => removeSpell(c.id, s.id)}
      onTogglePrepared={() =>
        updateSpell(c.id, s.id, { prepared: !s.prepared })
      }
      costLabel={(c.resources ?? []).find((r) => r.id === s.resourceId)?.name}
    />
  );

  const renderList = (
    title: string,
    id: string,
    list: HomebrewSpell[],
    emptyText: string,
  ) => (
    <CollapsibleCard
      storageId={id}
      className="grimoire-card p-5"
      titleClassName="font-display text-sm uppercase tracking-widest text-primary"
      title={title}
    >
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          {groupByLevel(list, sortAlpha).map(([lvl, spells]) => (
            <div key={lvl}>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                {levelLabel(lvl)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {spells.map(renderCard)}
              </div>
            </div>
          ))}
        </div>
      )}
    </CollapsibleCard>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Pull a spell from the official 5e list, or scribe your own below.
        </p>
        <SrdSpellPicker c={c} />
      </div>

      <SpellForm
        key={editing?.id ?? "new"}
        c={c}
        editing={editing}
        onDone={() => setEditing(null)}
      />

      {c.spells.length === 0 && spellSlots.length === 0 ? (
        <div className="grimoire-card p-12 text-center text-muted-foreground italic">
          The spellbook is empty. Scribe your first incantation above.
        </div>
      ) : (
        <>
          <PreparedSpellsCard c={c} />

          {c.spells.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[10rem]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search spells by name…"
                  className="pl-8"
                />
              </div>
              <select
                className={`${SELECT_CLASS} w-auto`}
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                aria-label="Filter by school"
              >
                <option value="">All schools</option>
                {schools.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant={sortAlpha ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSortAlpha((v) => !v)}
                title="Sort each tier alphabetically"
              >
                <ArrowDownAZ className="h-4 w-4 mr-1.5" /> A–Z
              </Button>
            </div>
          )}

          {/* Custom resource spells — one section per resource, at the top. */}
          {resourceSections.map((sec) => (
            <CollapsibleCard
              key={sec.id}
              storageId={`res-${sec.id}`}
              className="grimoire-card p-5"
              titleClassName="font-display text-sm uppercase tracking-widest text-primary"
              title={
                <>
                  <Flame className="h-4 w-4" /> {sec.name}
                  {sec.current !== undefined && (
                    <span className="text-[11px] normal-case tracking-normal text-muted-foreground">
                      {sec.current}
                      {sec.max ? `/${sec.max}` : ""} left
                    </span>
                  )}
                </>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(sortAlpha ? [...sec.spells].sort(byName) : sec.spells).map(
                  renderCard,
                )}
              </div>
            </CollapsibleCard>
          ))}

          {cantrips.length > 0 && (
            <CollapsibleCard
              storageId="cantrips"
              className="grimoire-card p-5"
              titleClassName="font-display text-sm uppercase tracking-widest text-primary"
              title="Cantrips"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(sortAlpha ? [...cantrips].sort(byName) : cantrips).map(
                  renderCard,
                )}
              </div>
            </CollapsibleCard>
          )}

          {/* Prepared spells, grouped by level with that level's spell slots
              shown inline right above the spells they'd be cast with. */}
          <CollapsibleCard
            storageId="prepared"
            className="grimoire-card p-5"
            titleClassName="font-display text-sm uppercase tracking-widest text-primary"
            title={`Prepared (${prepared.length})`}
          >
            {preparedLevels.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No spells prepared — tap the bookmark on a spell to prepare it.
              </p>
            ) : (
              <div className="space-y-5">
                {preparedLevels.map((lvl) => {
                  const spells = prepared.filter((s) => s.level === lvl);
                  const ordered = sortAlpha ? [...spells].sort(byName) : spells;
                  return (
                    <div key={lvl}>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                        {levelLabel(lvl)}
                      </div>
                      {renderSlots(lvl)}
                      {ordered.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          {ordered.map(renderCard)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleCard>
          {renderList(
            `Unprepared (${unprepared.length})`,
            "unprepared",
            unprepared,
            "No unprepared spells.",
          )}
        </>
      )}

      <ConcentrationDialog
        prompt={prompt}
        count={concentrationCount(c.effects)}
        max={max}
        activeConcentration={activeConcentration}
        onClose={() => setPrompt(null)}
        onCastSelf={castOnSelf}
        onCastOther={castOnOther}
        onDrop={dropAndCast}
      />
    </div>
  );
}
