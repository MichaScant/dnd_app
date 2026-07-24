import { useState } from "react";
import { Character, STAT_KEYS, STAT_LABELS, StatKey, LevelEntry } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Crown, TrendingUp } from "lucide-react";

export function ClassesTab({ c }: { c: Character }) {
  const { addClass, removeClass, setLevelTable } = useStore();
  const [form, setForm] = useState({ name: "", description: "", hitDie: "d8", primaryStat: "str" as StatKey });

  const submit = () => {
    if (!form.name.trim()) return;
    addClass(c.id, { ...form, name: form.name.trim() });
    setForm({ name: "", description: "", hitDie: "d8", primaryStat: "str" });
  };

  const updateRow = (i: number, patch: Partial<LevelEntry>) =>
    setLevelTable(c.id, c.levelTable.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () =>
    setLevelTable(c.id, [
      ...c.levelTable,
      { level: (c.levelTable[c.levelTable.length - 1]?.level ?? 0) + 1, className: c.classes[0]?.name ?? "", features: "", xpRequired: 0 },
    ]);
  const removeRow = (i: number) => setLevelTable(c.id, c.levelTable.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <section className="grimoire-card p-6">
        <h3 className="font-display text-lg mb-4 flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" /> Forge homebrew class
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Label className="text-xs uppercase text-muted-foreground">Class name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ember Walker" />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Hit die</Label>
            <Input value={form.hitDie} onChange={(e) => setForm({ ...form, hitDie: e.target.value })} placeholder="d10" />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">Primary stat</Label>
            <select
              value={form.primaryStat}
              onChange={(e) => setForm({ ...form, primaryStat: e.target.value as StatKey })}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm"
            >
              {STAT_KEYS.map((k) => <option key={k} value={k}>{STAT_LABELS[k]}</option>)}
            </select>
          </div>
          <div className="md:col-span-4">
            <Label className="text-xs uppercase text-muted-foreground">Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <Button onClick={submit} className="mt-4"><Plus className="h-4 w-4 mr-1.5" /> Add class</Button>

        {c.classes.length > 0 && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {c.classes.map((cl) => (
              <div key={cl.id} className="border border-border rounded-md p-3 bg-background/40">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display">{cl.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {cl.hitDie} · {cl.primaryStat && STAT_LABELS[cl.primaryStat]}
                    </div>
                  </div>
                  <button onClick={() => removeClass(c.id, cl.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {cl.description && <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">{cl.description}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grimoire-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Custom leveling track
          </h3>
          <Button size="sm" variant="outline" onClick={addRow}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add level
          </Button>
        </div>
        {c.levelTable.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Define your own milestones, XP thresholds, and feature unlocks per level.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="py-2 px-2 w-16">Lv</th>
                  <th className="py-2 px-2 w-40">Class</th>
                  <th className="py-2 px-2 w-28">XP</th>
                  <th className="py-2 px-2">Features unlocked</th>
                  <th className="py-2 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {c.levelTable.map((r, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="py-1.5 px-1">
                      <Input type="number" value={r.level} onChange={(e) => updateRow(i, { level: +e.target.value || 1 })} className="h-8" />
                    </td>
                    <td className="py-1.5 px-1">
                      <Input value={r.className} onChange={(e) => updateRow(i, { className: e.target.value })} className="h-8" />
                    </td>
                    <td className="py-1.5 px-1">
                      <Input type="number" value={r.xpRequired ?? 0} onChange={(e) => updateRow(i, { xpRequired: +e.target.value || 0 })} className="h-8" />
                    </td>
                    <td className="py-1.5 px-1">
                      <Input value={r.features} onChange={(e) => updateRow(i, { features: e.target.value })} className="h-8" placeholder="Eldritch Surge, +1 ASI…" />
                    </td>
                    <td className="py-1.5 px-1">
                      <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
