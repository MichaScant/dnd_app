import { useState } from "react";
import { Character } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Zap } from "lucide-react";

export function AbilitiesTab({ c }: { c: Character }) {
  const { addAbility, removeAbility } = useStore();
  const [form, setForm] = useState({ name: "", source: "", uses: "", description: "" });

  const submit = () => {
    if (!form.name.trim()) return;
    addAbility(c.id, { ...form, name: form.name.trim() });
    setForm({ name: "", source: "", uses: "", description: "" });
  };

  return (
    <div className="space-y-6">
      <section className="grimoire-card p-6">
        <h3 className="font-display text-lg mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> Forge homebrew ability
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Soul Burn" />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Source</Label>
            <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Warlock 3, Racial…" />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Uses</Label>
            <Input value={form.uses} onChange={(e) => setForm({ ...form, uses: e.target.value })} placeholder="3 / long rest" />
          </div>
          <div className="md:col-span-3">
            <Label className="text-xs uppercase text-muted-foreground">Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <Button onClick={submit} className="mt-4"><Plus className="h-4 w-4 mr-1.5" /> Add ability</Button>
      </section>

      {c.abilities.length === 0 ? (
        <div className="grimoire-card p-12 text-center text-muted-foreground italic">No abilities yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {c.abilities.map((a) => (
            <div key={a.id} className="grimoire-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">{a.source}{a.uses && ` · ${a.uses}`}</div>
                </div>
                <button onClick={() => removeAbility(c.id, a.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {a.description && <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">{a.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
