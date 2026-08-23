import { useState } from "react";
import { Character, InventoryItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import { equippedSlotLabel } from "@/lib/equipment";
import { ItemForm } from "@/components/character/ItemForm";
import { ItemRow } from "@/components/character/ItemRow";
import { SrdItemPicker } from "@/components/character/SrdItemPicker";
import { Backpack, FlaskConical } from "lucide-react";

/** Best-effort carried weight: pull a leading number out of "3 lb." × quantity. */
const carriedWeight = (items: InventoryItem[]): number =>
  items.reduce((total, it) => {
    const n = parseFloat(it.weight ?? "");
    return total + (isNaN(n) ? 0 : n * it.quantity);
  }, 0);

/** Bucket the inventory into a sorted list of [category, items] pairs. */
const byCategory = (items: InventoryItem[]): [string, InventoryItem[]][] => {
  const groups: Record<string, InventoryItem[]> = {};
  for (const it of items) (groups[it.category] ??= []).push(it);
  return Object.keys(groups)
    .sort()
    .map((cat) => [cat, groups[cat]]);
};

export function InventoryTab({ c }: { c: Character }) {
  const { removeItem, updateItem } = useStore();
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const inventory = c.inventory ?? [];
  const pack = inventory.filter((it) => !it.consumable);
  const consumables = inventory.filter((it) => it.consumable);
  const weight = carriedWeight(inventory);

  const startEdit = (it: InventoryItem) => {
    setEditing(it);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderRow = (it: InventoryItem) => (
    <ItemRow
      key={it.id}
      it={it}
      equippedLabel={equippedSlotLabel(c, it.id)}
      onQty={(delta) =>
        updateItem(c.id, it.id, {
          quantity: Math.max(1, it.quantity + delta),
        })
      }
      onEdit={() => startEdit(it)}
      onRemove={() => removeItem(c.id, it.id)}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Pull gear and magic items from the official 5e list, or add your own
          below.
        </p>
        <SrdItemPicker c={c} />
      </div>

      <ItemForm
        key={editing?.id ?? "new"}
        c={c}
        editing={editing}
        onDone={() => setEditing(null)}
      />

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

          {/* Pack — carried & worn gear, grouped by category */}
          {pack.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg flex items-center gap-2">
                <Backpack className="h-4 w-4 text-primary" /> Pack
              </h3>
              {byCategory(pack).map(([category, items]) => (
                <section key={category} className="grimoire-card p-5">
                  <h4 className="font-display text-sm uppercase tracking-widest text-primary mb-3">
                    {category}
                  </h4>
                  <div className="space-y-3">{items.map(renderRow)}</div>
                </section>
              ))}
            </div>
          )}

          {/* Consumables — potions, scrolls, ammo… kept apart from the pack */}
          {consumables.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-primary" /> Consumables
              </h3>
              <section className="grimoire-card p-5">
                <p className="text-[11px] text-muted-foreground mb-3">
                  Use the − button to spend one as you go.
                </p>
                <div className="space-y-3">{consumables.map(renderRow)}</div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
