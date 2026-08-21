import { Character, InventoryItem } from "@/lib/types";
import { useStore, equippedItemIds } from "@/lib/store";
import {
  EQUIP_SLOTS,
  EquipSlot,
  itemsForSlot,
  ringItems,
  ringSlotId,
  miscItems,
  miscSlotId,
  weaponSummary,
} from "@/lib/equipment";
import { ModifierChips } from "@/components/character/ModifierChips";
import { Label } from "@/components/ui/label";
import { Shirt, TriangleAlert, Plus, Check } from "lucide-react";

const SELECT_CLASS =
  "w-full bg-input border border-border rounded-md px-3 py-2 text-sm";

function StrWarning({ item, str }: { item: InventoryItem; str: number }) {
  if (item.strengthReq == null || str >= item.strengthReq) return null;
  return (
    <p className="text-[11px] text-destructive flex items-center gap-1 mt-2">
      <TriangleAlert className="h-3 w-3" /> Requires Str {item.strengthReq} (you
      have {str}){item.armorWeight === "Heavy" ? " — speed −10" : ""}
    </p>
  );
}

/**
 * A multi-equip group (Rings, Miscellaneous): every matching item is listed
 * with a Wear/Worn toggle, so any number can be equipped at once.
 */
function MultiEquipSection({
  title,
  emptyHint,
  items,
  equippedIds,
  onToggle,
}: {
  title: string;
  emptyHint: string;
  items: InventoryItem[];
  equippedIds: Set<string>;
  onToggle: (item: InventoryItem) => void;
}) {
  return (
    <div className="mt-4">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {title}
      </Label>
      {items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic mt-1.5">
          {emptyHint}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1.5">
          {items.map((item) => {
            const on = equippedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`rounded-md border p-2.5 ${
                  on
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-background/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display truncate">{item.name}</span>
                  <button
                    onClick={() => onToggle(item)}
                    className={`text-[11px] px-2 py-1 rounded border transition-colors flex items-center gap-1 shrink-0 ${
                      on
                        ? "border-primary/50 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {on ? (
                      <>
                        <Check className="h-3 w-3" /> Worn
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" /> Wear
                      </>
                    )}
                  </button>
                </div>
                {on && <ModifierChips modifiers={item.modifiers} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EquipmentBox({ c }: { c: Character }) {
  const { equipItem, unequipSlot } = useStore();
  const inventory = c.inventory ?? [];
  const equipment = c.equipment ?? {};
  const equippedIds = equippedItemIds(c);
  const str = c.stats.str;
  const rings = ringItems(inventory);
  const misc = miscItems(inventory);

  const toggleRing = (item: InventoryItem) => {
    if (equippedIds.has(item.id)) unequipSlot(c.id, ringSlotId(item.id));
    else equipItem(c.id, ringSlotId(item.id), item.id);
  };

  const toggleMisc = (item: InventoryItem) => {
    if (equippedIds.has(item.id)) unequipSlot(c.id, miscSlotId(item.id));
    else equipItem(c.id, miscSlotId(item.id), item.id);
  };

  return (
    <section className="grimoire-card p-6">
      <h3 className="font-display text-lg mb-1 flex items-center gap-2">
        <Shirt className="h-4 w-4 text-primary" /> Equipment
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Assign items to slots. Equipped gear with bonuses updates your stats
        automatically. Manage items in the Inventory tab.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EQUIP_SLOTS.map((slot: EquipSlot) => {
          const options = itemsForSlot(inventory, slot);
          const equippedId = equipment[slot.id] ?? "";
          const item = inventory.find((it) => it.id === equippedId);
          const opts =
            item && !options.some((o) => o.id === item.id)
              ? [item, ...options]
              : options;

          return (
            <div
              key={slot.id}
              className="rounded-md border border-border bg-background/40 p-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {slot.label}
                </Label>
                {(item?.armorWeight || item?.shieldType) && (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                    {item.armorWeight ?? `${item.shieldType} shield`}
                  </span>
                )}
              </div>
              <select
                className={SELECT_CLASS}
                value={equippedId}
                onChange={(e) =>
                  e.target.value
                    ? equipItem(c.id, slot.id, e.target.value)
                    : unequipSlot(c.id, slot.id)
                }
              >
                <option value="">— Empty —</option>
                {opts.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name}
                  </option>
                ))}
              </select>
              {item && weaponSummary(item.weapon) && (
                <p className="text-[11px] text-muted-foreground mt-2">
                  {weaponSummary(item.weapon)}
                </p>
              )}
              {item?.shieldAc != null && (
                <p className="text-[11px] text-primary mt-2">
                  +{item.shieldAc} AC
                </p>
              )}
              {item && <ModifierChips modifiers={item.modifiers} />}
              {item && <StrWarning item={item} str={str} />}
            </div>
          );
        })}
      </div>

      {/* Rings & Miscellaneous — wear as many as you like */}
      <MultiEquipSection
        title="Rings"
        emptyHint="No ring items yet. Create one in the Inventory tab with type “Ring”."
        items={rings}
        equippedIds={equippedIds}
        onToggle={toggleRing}
      />
      <MultiEquipSection
        title="Miscellaneous"
        emptyHint="No miscellaneous items yet. Create one in the Inventory tab with type “Miscellaneous”."
        items={misc}
        equippedIds={equippedIds}
        onToggle={toggleMisc}
      />
    </section>
  );
}
