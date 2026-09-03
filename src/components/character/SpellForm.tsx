import { useState } from "react";
import { toast } from "sonner";
import { Character, HomebrewSpell } from "@/lib/types";
import { useStore } from "@/lib/store";
import { DraftMod, expandMods } from "@/lib/modifiers";
import { ModifierEditor } from "@/components/character/ModifierEditor";
import { Field, SelectField } from "@/components/character/FormField";
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

interface SpellFormState {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  duration: string;
  description: string;
  concentration: boolean;
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

  const submit = () => {
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      name: form.name.trim(),
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
          <Input
            type="number"
            min={0}
            max={9}
            value={form.level}
            onChange={(e) =>
              setForm((f) => ({ ...f, level: +e.target.value || 0 }))
            }
          />
        </Field>
        <SelectField
          label="School"
          span={2}
          value={form.school}
          options={SCHOOLS}
          onChange={(v) => setForm((f) => ({ ...f, school: v }))}
        />
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
