import { InventoryItem } from "@/lib/types";
import { weaponSummary } from "@/lib/equipment";
import { ModifierChips } from "@/components/character/ModifierChips";
import { Plus, Trash2, Minus, ShieldCheck, Pencil } from "lucide-react";

/** The compact "· "-joined meta line under an item's name. */
function itemMeta(it: InventoryItem): string {
  return [
    it.slot,
    it.armorWeight && `${it.armorWeight} armor`,
    it.shieldType && `${it.shieldType} shield`,
    it.shieldAc != null ? `+${it.shieldAc} AC` : null,
    it.strengthReq ? `Str ${it.strengthReq}` : null,
    it.cost,
    it.weight,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** A single inventory line: name, tags, quantity stepper, edit/remove. */
export function ItemRow({
  it,
  equippedLabel,
  onQty,
  onEdit,
  onRemove,
}: {
  it: InventoryItem;
  equippedLabel?: string;
  onQty: (delta: number) => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const equipped = !!equippedLabel;
  const summary = weaponSummary(it.weapon);

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
            {equipped && (
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/40 text-primary flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> {equippedLabel}
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {itemMeta(it)}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <QtyStepper qty={it.quantity} onQty={onQty} />
          <button
            onClick={onEdit}
            className="text-muted-foreground hover:text-primary"
            aria-label="Edit item"
          >
            <Pencil className="h-4 w-4" />
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

      {summary && (
        <p className="text-[11px] text-muted-foreground mt-1.5">{summary}</p>
      )}
      {it.description && (
        <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">
          {it.description}
        </p>
      )}
      <ModifierChips
        modifiers={it.modifiers}
        dimmed={!equipped}
        title={
          equipped ? "Active while equipped" : "Equip to apply these bonuses"
        }
      />
    </div>
  );
}

function QtyStepper({
  qty,
  onQty,
}: {
  qty: number;
  onQty: (delta: number) => void;
}) {
  return (
    <div className="flex items-center border border-border rounded-md">
      <button
        onClick={() => onQty(-1)}
        className="px-1.5 py-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
        disabled={qty <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="px-2 text-sm tabular-nums">{qty}</span>
      <button
        onClick={() => onQty(1)}
        className="px-1.5 py-1 text-muted-foreground hover:text-foreground"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
