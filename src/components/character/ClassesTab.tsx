import { useState } from "react";
import {
  Character,
  STAT_KEYS,
  STAT_LABELS,
  StatKey,
  LevelEntry,
} from "@/lib/types";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Crown, TrendingUp, X } from "lucide-react";
import { CollapsibleCard } from "@/components/character/CollapsibleCard";
import {
  CLASS_NAMES,
  CUSTOM_CLASS,
  featuresAtLevel,
  subclassInfo,
  subclassOptions,
  subclassFeaturesAt,
} from "@/lib/classes";
import { SELECT_BASE, SELECT_CLASS } from "@/components/character/FormField";

const ROW_SELECT = `h-8 w-full ${SELECT_BASE} px-2 text-sm`;

export function ClassesTab({ c }: { c: Character }) {
  const { addClass, removeClass, setLevelTable, update } = useStore();
  const [form, setForm] = useState({
    name: "",
    description: "",
    hitDie: "d8",
    primaryStat: "str" as StatKey,
  });

  const submit = () => {
    if (!form.name.trim()) return;
    addClass(c.id, { ...form, name: form.name.trim() });
    setForm({ name: "", description: "", hitDie: "d8", primaryStat: "str" });
  };

  // Rows the user has switched to free-text "Custom" class entry. Tracked by
  // row index (kept in sync when a row is removed).
  const [customIdx, setCustomIdx] = useState<Set<number>>(new Set());

  // Selectable classes: the standard SRD classes plus any homebrew classes the
  // user has forged on this sheet.
  const classOptions = [
    ...CLASS_NAMES,
    ...c.classes
      .map((cl) => cl.name)
      .filter((n) => n && !CLASS_NAMES.includes(n)),
  ];

  const updateRow = (i: number, patch: Partial<LevelEntry>) =>
    setLevelTable(
      c.id,
      c.levelTable.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    );

  // Pick a class for a row. Features are derived live from class + level (see
  // renderFeatures), so this only sets the name. "Custom" flips to free text.
  const pickClass = (i: number, value: string) => {
    if (value === CUSTOM_CLASS) {
      setCustomIdx((s) => new Set(s).add(i));
      updateRow(i, { className: "" });
      return;
    }
    setCustomIdx((s) => {
      const n = new Set(s);
      n.delete(i);
      return n;
    });
    updateRow(i, { className: value });
  };

  // Each row is one class at a chosen level; new rows start blank at level 1.
  const addRow = () =>
    setLevelTable(c.id, [...c.levelTable, { className: "", level: 1 }]);
  const removeRow = (i: number) => {
    setLevelTable(
      c.id,
      c.levelTable.filter((_, idx) => idx !== i),
    );
    // Shift tracked custom-rows down past the removed index.
    setCustomIdx((s) => {
      const n = new Set<number>();
      for (const x of s) if (x !== i) n.add(x > i ? x - 1 : x);
      return n;
    });
  };

  // Subclass chosen per class (className -> subclass), stored on the character,
  // plus which classes are typing a free-text "Custom" subclass name.
  const [customSub, setCustomSub] = useState<Set<string>>(new Set());
  const setSubclass = (cls: string, value: string) =>
    update(c.id, { subclasses: { ...(c.subclasses ?? {}), [cls]: value } });
  const pickSubclass = (cls: string, value: string) => {
    if (value === CUSTOM_CLASS) {
      setCustomSub((s) => new Set(s).add(cls));
      setSubclass(cls, "");
      return;
    }
    setCustomSub((s) => {
      const n = new Set(s);
      n.delete(cls);
      return n;
    });
    setSubclass(cls, value);
  };

  // Everything a class row shows under "Features": the base-class features at
  // every level up to this one, then (once the subclass level is reached) the
  // subclass picker and its features across levels.
  const renderFeatures = (r: LevelEntry) => {
    const info = r.className ? subclassInfo(r.className) : undefined;
    const baseLines: { n: number; f: string }[] = [];
    for (let n = 1; n <= r.level; n++) {
      const f = featuresAtLevel(r.className, n);
      if (f) baseLines.push({ n, f });
    }
    const chosen = c.subclasses?.[r.className] ?? "";
    const opts = info ? subclassOptions(r.className) : [];
    const custom =
      !!info &&
      (customSub.has(r.className) || (!!chosen && !opts.includes(chosen)));
    const subLines: { n: number; f: string }[] = [];
    if (info && chosen && !custom) {
      for (let n = info.level; n <= r.level; n++) {
        const f = subclassFeaturesAt(r.className, chosen, n);
        if (f) subLines.push({ n, f });
      }
    }
    return (
      <div className="space-y-1 text-xs">
        {baseLines.length === 0 && !info ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          baseLines.map(({ n, f }) => (
            <div key={n}>
              <span className="text-muted-foreground tabular-nums mr-1">
                L{n}
              </span>
              {f}
            </div>
          ))
        )}
        {info && r.level >= info.level && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-2 space-y-1 mt-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {info.label}
            </div>
            {custom ? (
              <div className="flex items-center gap-1">
                <Input
                  autoFocus
                  value={chosen}
                  onChange={(e) => setSubclass(r.className, e.target.value)}
                  className="h-7"
                  placeholder="Subclass name"
                />
                <button
                  type="button"
                  title="Pick from list"
                  onClick={() => {
                    setCustomSub((s) => {
                      const n = new Set(s);
                      n.delete(r.className);
                      return n;
                    });
                    setSubclass(r.className, "");
                  }}
                  className="text-muted-foreground hover:text-primary shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <select
                className={`${SELECT_BASE} h-7 w-full px-2 text-xs`}
                value={opts.includes(chosen) ? chosen : ""}
                onChange={(e) => pickSubclass(r.className, e.target.value)}
              >
                <option value="">Choose {info.label}…</option>
                {opts.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
                <option value={CUSTOM_CLASS}>Custom…</option>
              </select>
            )}
            {subLines.map(({ n, f }) => (
              <div key={n} className="text-foreground">
                <span className="text-muted-foreground tabular-nums mr-1">
                  L{n}
                </span>
                {f}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <CollapsibleCard
        storageId="classes-form"
        title={
          <>
            <Crown className="h-4 w-4 text-primary" /> Forge homebrew class
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Label className="text-xs uppercase text-muted-foreground">
              Class name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ember Walker"
            />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">
              Hit die
            </Label>
            <Input
              value={form.hitDie}
              onChange={(e) => setForm({ ...form, hitDie: e.target.value })}
              placeholder="d10"
            />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">
              Primary stat
            </Label>
            <select
              value={form.primaryStat}
              onChange={(e) =>
                setForm({ ...form, primaryStat: e.target.value as StatKey })
              }
              className={SELECT_CLASS}
            >
              {STAT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {STAT_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
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
        </div>
        <Button onClick={submit} className="mt-4">
          <Plus className="h-4 w-4 mr-1.5" /> Add class
        </Button>

        {c.classes.length > 0 && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {c.classes.map((cl) => (
              <div
                key={cl.id}
                className="border border-border rounded-md p-3 bg-background/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display">{cl.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {cl.hitDie} ·{" "}
                      {cl.primaryStat && STAT_LABELS[cl.primaryStat]}
                    </div>
                  </div>
                  <button
                    onClick={() => removeClass(c.id, cl.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {cl.description && (
                  <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">
                    {cl.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CollapsibleCard>

      <CollapsibleCard
        storageId="leveling-track"
        title={
          <>
            <TrendingUp className="h-4 w-4 text-primary" /> Custom leveling
            track
          </>
        }
        right={
          <Button size="sm" variant="outline" onClick={addRow}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add class
          </Button>
        }
      >
        {c.levelTable.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Add each class and set its level — features fill in automatically.
          </p>
        ) : (
          <>
            <div className="text-xs text-muted-foreground mb-3">
              Total character level:{" "}
              <span className="text-primary font-display">
                {c.levelTable.reduce((sum, r) => sum + (r.level || 0), 0)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="py-2 px-2 w-44">Class</th>
                    <th className="py-2 px-2 w-20">Level</th>
                    <th className="py-2 px-2">Features unlocked</th>
                    <th className="py-2 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {c.levelTable.map((r, i) => (
                    <tr key={i} className="border-b border-border/60 align-top">
                      <td className="py-1.5 px-1">
                        {customIdx.has(i) ||
                        (r.className && !classOptions.includes(r.className)) ? (
                          <div className="flex items-center gap-1">
                            <Input
                              autoFocus
                              value={r.className}
                              onChange={(e) =>
                                updateRow(i, { className: e.target.value })
                              }
                              className="h-8"
                              placeholder="Class name"
                            />
                            <button
                              type="button"
                              title="Pick from list"
                              onClick={() => {
                                setCustomIdx((s) => {
                                  const n = new Set(s);
                                  n.delete(i);
                                  return n;
                                });
                                updateRow(i, { className: "" });
                              }}
                              className="text-muted-foreground hover:text-primary shrink-0"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <select
                            className={ROW_SELECT}
                            value={
                              classOptions.includes(r.className)
                                ? r.className
                                : ""
                            }
                            onChange={(e) => pickClass(i, e.target.value)}
                          >
                            <option value="">Select…</option>
                            {classOptions.map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                            <option value={CUSTOM_CLASS}>Custom…</option>
                          </select>
                        )}
                      </td>
                      <td className="py-1.5 px-1">
                        <Input
                          type="number"
                          min={1}
                          value={r.level}
                          onChange={(e) =>
                            updateRow(i, {
                              level: Math.max(1, +e.target.value || 1),
                            })
                          }
                          className="h-8 w-16"
                        />
                      </td>
                      <td className="py-1.5 px-1">{renderFeatures(r)}</td>
                      <td className="py-1.5 px-1">
                        <button
                          onClick={() => removeRow(i)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CollapsibleCard>
    </div>
  );
}
