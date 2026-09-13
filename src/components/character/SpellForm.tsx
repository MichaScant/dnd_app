import { useState } from "react";
import { toast } from "sonner";
import { Character, HomebrewSpell } from "@/lib/types";
import { useStore } from "@/lib/store";
import { DraftMod, expandMods } from "@/lib/modifiers";
import { ModifierEditor } from "@/components/character/ModifierEditor";
import { Field, SELECT_CLASS } from "@/components/character/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Sparkles, Brain, Pencil, Save, X } from "lucide-react";

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

const CUSTOM_SCHOOL = "✦ New custom school…";

interface SpellFormState {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  description: string;
  concentration: boolean;
  resourceId: string; // "" = none (uses a spell slot)
  resourceCost: number;
}

const blankSpell: SpellFormState = {
  name: "",
  level: 0,
  school: "Evocation",
  castingTime: "1 Action",
  range: "60 ft",
  duration: "Instantaneous",
  description: "",
  concentration: false,
  resourceId: "",
  resourceCost: 1,
};

const spellToForm = (s: HomebrewSpell): SpellFormState => ({
  name: s.name,
  level: s.level,
  school: s.school,
  castingTime: s.castingTime,
  range: s.range,
  duration: s.duration,
  description: s.description,
  concentration: !!s.concentration,
  resourceId: s.resourceId ?? "",
  resourceCost: s.resourceCost ?? 1,
});

/**
 * The add / edit homebrew-spell form. `editing` is null when adding; the parent
 * gives this a fresh `key` per edit target so state re-initialises cleanly.
 */
export function SpellForm({
  c,
  editing,
  onDone,
}: {
  c: Character;
  editing: HomebrewSpell | null;
  onDone: () => void;
}) {
  const { addSpell, updateSpell } = useStore();
  const [form, setForm] = useState<SpellFormState>(() =>
    editing ? spellToForm(editing) : blankSpell,
  );
  const [mods, setMods] = useState<DraftMod[]>(
    () => (editing?.modifiers ?? []) as DraftMod[],
  );
  // Free-typing a brand-new school (vs. picking an existing one).
  const [customSchool, setCustomSchool] = useState(false);

  const resources = c.resources ?? [];
  // Existing schools (standard + any homebrew already used) stay pickable.
  const schoolOptions = [
    ...new Set([...SCHOOLS, ...c.spells.map((s) => s.school).filter(Boolean)]),
  ];

  const submit = () => {
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      name: form.name.trim(),
      school: form.school.trim() || "Homebrew",
      resourceId: form.resourceId || undefined,
      resourceCost: form.resourceId
        ? Math.max(1, form.resourceCost || 1)
        : undefined,
      modifiers: expandMods(mods),
    };
    if (editing) {
      updateSpell(c.id, editing.id, payload);
      toast.success(`Saved ${payload.name}`);
      onDone();
    } else {
      addSpell(c.id, payload);
      setForm(blankSpell);
      setMods([]);
      setCustomSchool(false);
    }
  };

  return (
    <section className="grimoire-card p-6">
      <h3 className="font-display text-lg mb-4 flex items-center gap-2">
        {editing ? (
          <>
            <Pencil className="h-4 w-4 text-primary" /> Edit spell
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-primary" /> Inscribe homebrew
            spell
          </>
        )}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <Field label="Name" span={3}>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ember Lance"
          />
        </Field>
        <Field label="Level">
          {form.resourceId ? (
            <div className="text-[11px] text-muted-foreground italic mt-2.5">
              Resource spell — no slot level
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              max={9}
              value={form.level}
              onChange={(e) =>
                setForm((f) => ({ ...f, level: +e.target.value || 0 }))
              }
            />
          )}
        </Field>
        <Field label="School" span={2}>
          {customSchool ? (
            <div className="flex gap-1.5">
              <Input
                autoFocus
                value={form.school}
                onChange={(e) =>
                  setForm((f) => ({ ...f, school: e.target.value }))
                }
                placeholder="Blood Magic…"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Pick from the list instead"
                onClick={() => {
                  setCustomSchool(false);
                  setForm((f) => ({ ...f, school: "Evocation" }));
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <select
              className={SELECT_CLASS}
              value={form.school}
              onChange={(e) => {
                const v = e.target.value;
                if (v === CUSTOM_SCHOOL) {
                  setCustomSchool(true);
                  setForm((f) => ({ ...f, school: "" }));
                } else {
                  setForm((f) => ({ ...f, school: v }));
                }
              }}
            >
              {schoolOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
              <option value={CUSTOM_SCHOOL}>{CUSTOM_SCHOOL}</option>
            </select>
          )}
        </Field>
        <Field label="Casting Time" span={2}>
          <Input
            value={form.castingTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, castingTime: e.target.value }))
            }
          />
        </Field>
        <Field label="Range" span={2}>
          <Input
            value={form.range}
            onChange={(e) => setForm((f) => ({ ...f, range: e.target.value }))}
          />
        </Field>
        <Field label="Duration" span={2}>
          <Input
            value={form.duration}
            onChange={(e) =>
              setForm((f) => ({ ...f, duration: e.target.value }))
            }
          />
        </Field>
        <div className="md:col-span-6 flex items-center gap-2">
          <Checkbox
            id="spell-concentration"
            checked={form.concentration}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, concentration: !!v }))
            }
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
            Casting cost (optional)
          </Label>
          {resources.length === 0 ? (
            <p className="text-[11px] text-muted-foreground mt-1">
              Add a custom resource on the main sheet (e.g. Mana) to let a spell
              cost it instead of a spell slot.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <select
                className={`${SELECT_CLASS} w-auto`}
                value={form.resourceId}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    resourceId: e.target.value,
                    // Resource spells aren't slot-based, so drop the level.
                    level: e.target.value ? 0 : f.level,
                  }))
                }
              >
                <option value="">Uses a spell slot (no resource)</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              {form.resourceId && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">costs</span>
                  <Input
                    type="number"
                    min={1}
                    className="w-20"
                    value={form.resourceCost}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        resourceCost: Math.max(1, +e.target.value || 1),
                      }))
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {resources.find((r) => r.id === form.resourceId)?.name} per
                    cast
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <Field label="Description" span={6}>
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </Field>
        <div className="md:col-span-6">
          <ModifierEditor
            mods={mods}
            onChange={setMods}
            emptyHint="No modifiers. Add some if casting this spell should change ability scores, AC, DC, saves, attack rolls, damage, speed, or skills."
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={submit}>
          {editing ? (
            <>
              <Save className="h-4 w-4 mr-1.5" /> Save changes
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1.5" /> Add spell
            </>
          )}
        </Button>
        {editing && (
          <Button variant="outline" onClick={onDone}>
            <X className="h-4 w-4 mr-1.5" /> Cancel
          </Button>
        )}
      </div>
    </section>
  );
}
