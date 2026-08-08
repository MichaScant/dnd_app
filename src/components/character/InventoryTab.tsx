import { useState } from "react";
import { toast } from "sonner";
import { Character, InventoryItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import { SrdItemPicker } from "@/components/character/SrdItemPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Minus,
  Package,
  Backpack,
  ShieldCheck,
} from "lucide-react";

const blankItem = {
  name: "",
  category: "Custom",
  quantity: 1,
  weight: "",
  cost: "",
  description: "",
};

/** Best-effort carried weight: pull a leading number out of "3 lb." × quantity. */
const carriedWeight = (items: InventoryItem[]): number =>
  items.reduce((total, it) => {
    const n = parseFloat(it.weight ?? "");
    return total + (isNaN(n) ? 0 : n * it.quantity);
  }, 0);

export function InventoryTab({ c }: { c: Character }) {
  const { addItem, removeItem, updateItem } = useStore();
  const [form, setForm] = useState(blankItem);

  const inventory = c.inventory ?? [];

  const submit = () => {
    if (!form.name.trim()) return;
    const added = addItem(c.id, {
      name: form.name.trim(),
      kind: "custom",
      category: form.category.trim() || "Custom",
      quantity: Math.max(1, form.quantity || 1),
      weight: form.weight.trim() || undefined,
      cost: form.cost.trim() || undefined,
      description: form.description.trim(),
    });
    if (added) toast.success(`Added ${form.name.trim()}`);
    else toast.warning(`${form.name.trim()} is already in your inventory`);
    setForm(blankItem);
  };

  // Group inventory by category for display.
  const grouped = inventory.reduce<Record<string, InventoryItem[]>>(
    (acc, it) => {
      (acc[it.category] ??= []).push(it);
      return acc;
    },
    {},
  );
  const categories = Object.keys(grouped).sort();
  const weight = carriedWeight(inventory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Pull gear and magic items from the official 5e list, or add your own
          below.
        </p>
        <SrdItemPicker c={c} />
      </div>

      <section className="grimoire-card p-6">
        <h3 className="font-display text-lg mb-4 flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> Add custom item
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-3">
            <Label className="text-xs uppercase text-muted-foreground">
              Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Rope of Climbing, Rations…"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase text-muted-foreground">
              Category
            </Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Weapon, Gear…"
            />
          </div>
          <div>
            <Label className="text-xs uppercase text-muted-foreground">
              Qty
            </Label>
            <Input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: +e.target.value || 1 })
              }
            />
          </div>
          <div className="md:col-span-3">
            <Label className="text-xs uppercase text-muted-foreground">
              Weight
            </Label>
            <Input
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
              placeholder="3 lb."
            />
          </div>
          <div className="md:col-span-3">
            <Label className="text-xs uppercase text-muted-foreground">
              Cost
            </Label>
            <Input
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              placeholder="15 gp"
            />
          </div>
          <div className="md:col-span-6">
            <Label className="text-xs uppercase text-muted-foreground">
              Description
            </Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
        </div>
        <Button onClick={submit} className="mt-4">
          <Plus className="h-4 w-4 mr-1.5" /> Add item
        </Button>
      </section>

      {inventory.length === 0 ? (
        <div className="grimoire-card p-12 text-center text-muted-foreground italic">
          The pack is empty. Add gear from the 5e list or scribe your own above.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 text-sm text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <Backpack className="h-4 w-4" /> {inventory.length} item
              {inventory.length === 1 ? "" : "s"}
            </span>
            {weight > 0 && (
              <span>
                Carried weight:{" "}
                <span className="text-foreground">
                  {Number.isInteger(weight) ? weight : weight.toFixed(1)} lb.
                </span>
              </span>
            )}
          </div>

          {categories.map((cat) => (
            <section key={cat} className="grimoire-card p-5">
              <h4 className="font-display text-sm uppercase tracking-widest text-primary mb-3">
                {cat}
              </h4>
              <div className="space-y-3">
                {grouped[cat].map((it) => (
                  <ItemRow
                    key={it.id}
                    it={it}
                    onQty={(delta) =>
                      updateItem(c.id, it.id, {
                        quantity: Math.max(1, it.quantity + delta),
                      })
                    }
                    onEquip={() =>
                      updateItem(c.id, it.id, { equipped: !it.equipped })
                    }
                    onRemove={() => removeItem(c.id, it.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

function ItemRow({
  it,
  onQty,
  onEquip,
  onRemove,
}: {
  it: InventoryItem;
  onQty: (delta: number) => void;
  onEquip: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-border rounded-md p-3 bg-background/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display flex items-center gap-2 flex-wrap">
            {it.name}
            {it.rarity && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/40 text-primary">
                {it.rarity}
              </span>
            )}
            {it.equipped && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/40 text-primary flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Equipped
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {[it.cost, it.weight].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quantity stepper */}
          <div className="flex items-center border border-border rounded-md">
            <button
              onClick={() => onQty(-1)}
              className="px-1.5 py-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
              disabled={it.quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-sm tabular-nums">{it.quantity}</span>
            <button
              onClick={() => onQty(1)}
              className="px-1.5 py-1 text-muted-foreground hover:text-foreground"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={onEquip}
            className={`text-[11px] px-2 py-1 rounded border transition-colors ${
              it.equipped
                ? "border-primary/50 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {it.equipped ? "Unequip" : "Equip"}
          </button>
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {it.description && (
        <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">
          {it.description}
        </p>
      )}
    </div>
  );
}
