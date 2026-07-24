import { useState } from "react";
import { toast } from "sonner";
import { Character, HomebrewSpell } from "@/lib/types";
import { DraftMod, expandMods, modifierLabel } from "@/lib/modifiers";
import { ModifierEditor } from "@/components/character/ModifierEditor";
import { useStore, concentrationCount } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Trash2, Sparkles, Wand2, Brain } from "lucide-react";

const SCHOOLS = [
  "Abjuration",
  "Conjuration",
  "Divination",
  "Enchantment",
  "Evocation",
  "Illusion",
  "Necromancy",
  "Transmutation",
  "Homebrew",
];

const blankForm = {
  name: "",
  level: 0,
  school: "Evocation",
  castingTime: "1 Action",
  range: "60 ft",
  duration: "Instantaneous",
  description: "",
  concentration: false,
};

export function SpellsTab({ c }: { c: Character }) {
  const { addSpell, removeSpell, addEffect, removeEffect } = useStore();
  const [form, setForm] = useState(blankForm);
  const [mods, setMods] = useState<DraftMod[]>([]);
  // Cast dialog: "ask" = are you concentrating?, "drop" = pick a spell to drop.
  const [dialog, setDialog] = useState<{
    spell: HomebrewSpell;
    stage: "ask" | "drop";
  } | null>(null);

  const max = c.concentrationMax ?? 1;
  const activeConc = c.effects.filter((e) => e.concentration);
  const isActive = (name: string) =>
    c.effects.some(
      (e) => e.name.trim().toLowerCase() === name.trim().toLowerCase(),
    );

  const submit = () => {
    if (!form.name.trim()) return;
    addSpell(c.id, {
      ...form,
      name: form.name.trim(),
      modifiers: expandMods(mods),
    });
    setForm(blankForm);
    setMods([]);
  };

  /** Turn a spell into an active buff effect, reusing the effect engine. */
  const applySpellEffect = (s: HomebrewSpell, concentrating: boolean) => {
    const added = addEffect(c.id, {
      kind: "buff",
      name: s.name,
      description: s.description,
      duration: s.duration,
      modifiers: s.modifiers ?? [],
      concentration: concentrating,
    });
    if (added)
      toast.success(`Cast ${s.name}`, {
        description: concentrating ? "Concentrating" : undefined,
      });
    else toast.warning(`${s.name} is already active`);
    return added;
  };

  const cast = (s: HomebrewSpell) => {
    if (isActive(s.name)) {
      toast.warning(`${s.name} is already active`);
      return;
    }
    // Concentration spells route through the dialog; everything else applies directly.
    if (s.concentration) setDialog({ spell: s, stage: "ask" });
    else applySpellEffect(s, false);
  };

  // Dialog actions ----------------------------------------------------------
  const castNotConcentrating = () => {
    if (!dialog) return;
    applySpellEffect(dialog.spell, false);
    setDialog(null);
  };

  const castConcentrating = () => {
    if (!dialog) return;
    if (concentrationCount(c.effects) >= max) {
      setDialog({ ...dialog, stage: "drop" }); // at limit → choose what to drop
      return;
    }
    applySpellEffect(dialog.spell, true);
    setDialog(null);
  };

  const dropAndCast = (effectId: string) => {
    if (!dialog) return;
    removeEffect(c.id, effectId);
    applySpellEffect(dialog.spell, true);
    setDialog(null);
  };

  const grouped = c.spells.reduce<Record<number, typeof c.spells>>((acc, s) => {
    (acc[s.level] ??= []).push(s);
    return acc;
  }, {});
  const levels = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <section className="grimoire-card p-6">
        <h3 className="font-display text-lg mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Inscribe homebrew spell
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-3">
            <Label className="text-xs uppercase text-muted-foreground">
              Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ember Lance"
            />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">
              Level
            </Label>
            <Input
              type="number"
              min={0}
              max={9}
              value={form.level}
              onChange={(e) =>
                setForm({ ...form, level: +e.target.value || 0 })
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase text-muted-foreground">
              School
            </Label>
            <select
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm"
            >
              {SCHOOLS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase text-muted-foreground">
              Casting Time
            </Label>
            <Input
              value={form.castingTime}
              onChange={(e) =>
                setForm({ ...form, castingTime: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase text-muted-foreground">
              Range
            </Label>
            <Input
              value={form.range}
              onChange={(e) => setForm({ ...form, range: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase text-muted-foreground">
              Duration
            </Label>
            <Input
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </div>
          <div className="md:col-span-6 flex items-center gap-2">
            <Checkbox
              id="spell-concentration"
              checked={form.concentration}
              onCheckedChange={(v) => setForm({ ...form, concentration: !!v })}
            />
            <Label
              htmlFor="spell-concentration"
              className="text-sm cursor-pointer flex items-center gap-1.5"
            >
              <Brain className="h-3.5 w-3.5 text-primary" /> Requires
              concentration
            </Label>
          </div>
          <div className="md:col-span-6">
            <Label className="text-xs uppercase text-muted-foreground">
              Description
            </Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-6">
            <ModifierEditor
              mods={mods}
              onChange={setMods}
              emptyHint="No modifiers. Add some if casting this spell should change ability scores, AC, DC, saves, attack rolls, damage, or skills."
            />
          </div>
        </div>
        <Button onClick={submit} className="mt-4">
          <Plus className="h-4 w-4 mr-1.5" /> Add spell
        </Button>
      </section>

      {levels.length === 0 ? (
        <div className="grimoire-card p-12 text-center text-muted-foreground italic">
          The spellbook is empty. Scribe your first incantation above.
        </div>
      ) : (
        levels.map((lvl) => (
          <section key={lvl} className="grimoire-card p-5">
            <h4 className="font-display text-sm uppercase tracking-widest text-primary mb-3">
              {lvl === 0 ? "Cantrips" : `Level ${lvl}`}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {grouped[lvl].map((s) => {
                const hasMods = !!s.modifiers?.length;
                return (
                  <div
                    key={s.id}
                    className="border border-border rounded-md p-3 bg-background/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-display flex items-center gap-2">
                          {s.name}
                          {s.concentration && (
                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/40 text-primary flex items-center gap-1">
                              <Brain className="h-3 w-3" /> Conc.
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {s.school}
                        </div>
                      </div>
                      <button
                        onClick={() => removeSpell(c.id, s.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground mt-2">
                      <div>
                        <span className="block uppercase text-[9px]">Cast</span>
                        {s.castingTime}
                      </div>
                      <div>
                        <span className="block uppercase text-[9px]">
                          Range
                        </span>
                        {s.range}
                      </div>
                      <div>
                        <span className="block uppercase text-[9px]">Dur</span>
                        {s.duration}
                      </div>
                    </div>
                    {s.description && (
                      <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">
                        {s.description}
                      </p>
                    )}
                    {hasMods && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {s.modifiers!.map((m, i) => (
                          <span
                            key={i}
                            className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                              m.delta >= 0
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-destructive/40 bg-destructive/10 text-destructive"
                            }`}
                          >
                            {modifierLabel(m)}
                          </span>
                        ))}
                      </div>
                    )}
                    {(hasMods || s.concentration) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-3 w-full"
                        onClick={() => cast(s)}
                      >
                        <Wand2 className="h-3.5 w-3.5 mr-1.5" /> Cast
                        {s.concentration ? "" : " (apply as effect)"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}

      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          {dialog?.stage === "ask" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" /> Are you
                  concentrating on {dialog.spell.name}?
                </DialogTitle>
                <DialogDescription>
                  If you cast this spell, answer Yes. If someone else cast it on
                  you, they hold concentration — answer No and it won't count
                  against your limit ({concentrationCount(c.effects)}/{max}).
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={castNotConcentrating}>
                  No, someone else is
                </Button>
                <Button onClick={castConcentrating}>
                  <Brain className="h-4 w-4 mr-1.5" /> Yes, I'm concentrating
                </Button>
              </DialogFooter>
            </>
          )}
          {dialog?.stage === "drop" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Concentration limit reached ({concentrationCount(c.effects)}/
                  {max})
                </DialogTitle>
                <DialogDescription>
                  You can't concentrate on {dialog.spell.name} as well. Choose a
                  spell to stop concentrating on — it will be dropped and{" "}
                  {dialog.spell.name} applied.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                {activeConc.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => dropAndCast(e.id)}
                    className="w-full text-left border border-border rounded-md p-3 bg-background/40 hover:border-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <div className="font-display">{e.name}</div>
                    {e.duration && (
                      <div className="text-[11px] text-muted-foreground">
                        {e.duration}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog(null)}>
                  Cancel
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
