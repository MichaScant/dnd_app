import { useState } from "react";
import { Character, Resource } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Gauge, Plus, Minus, Trash2, RotateCcw } from "lucide-react";

/**
 * Front-sheet panel for custom campaign resources (mana, ki, grit, charges…).
 * Each pool tracks a current value against an optional max, with quick +/−
 * steppers, direct entry, and a refill button.
 */
export function ResourcesCard({ c }: { c: Character }) {
  const { addResource, updateResource, removeResource } = useStore();
  const resources = c.resources ?? [];
  const [name, setName] = useState("");
  const [max, setMax] = useState("");

  const add = () => {
    if (!name.trim()) return;
    const maxNum = Number(max) || 0;
    addResource(c.id, {
      name: name.trim(),
      max: maxNum > 0 ? maxNum : undefined,
      current: maxNum > 0 ? maxNum : 0, // capped pools start full
    });
    setName("");
    setMax("");
  };

  return (
    <section className="grimoire-card p-6">
      <h3 className="font-display text-lg mb-1 flex items-center gap-2">
        <Gauge className="h-4 w-4 text-primary" /> Resources
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Track resources your campaign uses
      </p>

      {resources.length > 0 && (
        <div className="space-y-2 mb-4">
          {resources.map((r) => (
            <ResourceRow
              key={r.id}
              r={r}
              onChange={(patch) => updateResource(c.id, r.id, patch)}
              onRemove={() => removeResource(c.id, r.id)}
            />
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 flex-wrap">
        <div className="flex-1 min-w-[8rem]">
          <Label className="text-[11px] uppercase text-muted-foreground">
            Name
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Resource name"
          />
        </div>
        <div className="w-24">
          <Label className="text-[11px] uppercase text-muted-foreground">
            Max
          </Label>
          <Input
            type="number"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="∞"
          />
        </div>
        <Button onClick={add}>
          <Plus className="h-4 w-4 mr-1.5" /> Add
        </Button>
      </div>
    </section>
  );
}

function ResourceRow({
  r,
  onChange,
  onRemove,
}: {
  r: Resource;
  onChange: (patch: Partial<Omit<Resource, "id">>) => void;
  onRemove: () => void;
}) {
  const capped = r.max != null && r.max > 0;
  const atMax = capped && r.current >= (r.max ?? 0);

  return (
    <div className="flex items-center gap-2 flex-wrap rounded-md border border-border bg-background/40 px-3 py-2">
      <Input
        value={r.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="font-display h-8 w-40"
        aria-label="Resource name"
      />

      <div className="flex items-center gap-1 ml-auto">
        <button
          type="button"
          onClick={() => onChange({ current: r.current - 1 })}
          disabled={r.current <= 0}
          className="p-1 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
          aria-label="Spend one"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <Input
          type="number"
          value={r.current}
          onChange={(e) => onChange({ current: +e.target.value || 0 })}
          className="h-8 w-16 text-center"
          aria-label={`${r.name} current`}
        />
        <button
          type="button"
          onClick={() => onChange({ current: r.current + 1 })}
          disabled={atMax}
          className="p-1 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
          aria-label="Regain one"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <span className="text-muted-foreground">/</span>
      <Input
        type="number"
        min={0}
        value={r.max ?? ""}
        onChange={(e) =>
          onChange({
            max: e.target.value === "" ? undefined : +e.target.value || 0,
          })
        }
        placeholder="∞"
        className="h-8 w-16 text-center"
        aria-label={`${r.name} max`}
      />

      {capped && (
        <button
          type="button"
          onClick={() => onChange({ current: r.max })}
          disabled={atMax}
          className="text-muted-foreground hover:text-primary disabled:opacity-40"
          title="Refill to max (e.g. after a long rest)"
          aria-label="Refill"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Remove resource"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
