import { useState } from "react";
import { toast } from "sonner";
import {
  Character,
  InventoryItem,
  SlotKind,
  ArmorWeight,
  WeaponStats,
} from "@/lib/types";
import { useStore } from "@/lib/store";
import {
  SLOT_KINDS,
  ARMOR_WEIGHTS,
  SHIELD_TYPES,
  WEAPON_CATEGORIES,
  WEAPON_TYPES,
  DAMAGE_TYPES,
  WEAPON_PROPERTIES,
  weaponSummary,
  equippedSlotLabel,
} from "@/lib/equipment";
import { DraftMod, expandMods, modifierLabel } from "@/lib/modifiers";
import { ModifierEditor } from "@/components/character/ModifierEditor";
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
  Pencil,
  Save,
  X,
} from "lucide-react";

const blankItem = {
  name: "",
  category: "Custom",
  quantity: 1,
  weight: "",
  cost: "",
  description: "",
  slot: "" as SlotKind | "",
  strengthReq: "",
  armorWeight: "" as ArmorWeight | "",
  shieldType: "",
  shieldAc: "",
};

const blankWeapon = {
  category: "",
  type: "", // a WEAPON_TYPES value, or "Custom"
  customType: "", // free text when type === "Custom"
  damage: "",
  damageType: "",
  range: "",
  versatileDamage: "",
  properties: [] as string[],
};

const SELECT_CLASS =
  "w-full bg-input border border-border rounded-md px-3 py-2 text-sm mt-0";

/** Best-effort carried weight: pull a leading number out of "3 lb." × quantity. */
const carriedWeight = (items: InventoryItem[]): number =>
  items.reduce((total, it) => {
    const n = parseFloat(it.weight ?? "");
    return total + (isNaN(n) ? 0 : n * it.quantity);
  }, 0);

export function InventoryTab({ c }: { c: Character }) {
  const { addItem, removeItem, updateItem } = useStore();
  const [form, setForm] = useState(blankItem);
  const [weapon, setWeapon] = useState(blankWeapon);
  const [mods, setMods] = useState<DraftMod[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const inventory = c.inventory ?? [];
  const isWeapon = form.slot === "Weapon";
  const isShield = form.slot === "Shield";
  // Armor type & Strength requirement only make sense for armor-capable slots.
  const showArmorFields = !["Ring", "Cloak", "Weapon", "Shield"].includes(
    form.slot,
  );

  const toggleProp = (p: string) =>
    setWeapon((w) => ({
      ...w,
      properties: w.properties.includes(p)
        ? w.properties.filter((x) => x !== p)
        : [...w.properties, p],
    }));

  const buildWeapon = (): WeaponStats | undefined => {
    const resolvedType =
      weapon.type === "Custom"
        ? weapon.customType.trim() || undefined
        : weapon.type || undefined;
    const w: WeaponStats = {
      category: weapon.category || undefined,
      type: resolvedType,
      damage: weapon.damage.trim() || undefined,
      damageType: weapon.damageType || undefined,
      range: weapon.range.trim() || undefined,
      versatileDamage: weapon.properties.includes("Versatile")
        ? weapon.versatileDamage.trim() || undefined
        : undefined,
      properties: weapon.properties.length ? weapon.properties : undefined,
    };
    return Object.values(w).some((v) => v !== undefined) ? w : undefined;
  };

  const submit = () => {
    if (!form.name.trim()) return;
    const base = {
      name: form.name.trim(),
      category: form.category.trim() || "Custom",
      quantity: Math.max(1, form.quantity || 1),
      weight: form.weight.trim() || undefined,
      cost: form.cost.trim() || undefined,
      description: form.description.trim(),
      slot: form.slot || undefined,
      strengthReq:
        showArmorFields && form.strengthReq
          ? Number(form.strengthReq)
          : undefined,
      armorWeight: showArmorFields ? form.armorWeight || undefined : undefined,
      weapon: isWeapon ? buildWeapon() : undefined,
      shieldType: isShield ? form.shieldType || undefined : undefined,
      shieldAc: isShield && form.shieldAc ? Number(form.shieldAc) : undefined,
      modifiers: mods.length ? expandMods(mods) : undefined,
    };
    if (editingId) {
      updateItem(c.id, editingId, base); // patch keeps the item's original kind
      toast.success(`Saved ${base.name}`);
    } else {
      const added = addItem(c.id, { ...base, kind: "custom" });
      if (added) toast.success(`Added ${base.name}`);
      else toast.warning(`${base.name} is already in your inventory`);
    }
    setForm(blankItem);
    setWeapon(blankWeapon);
    setMods([]);
    setEditingId(null);
  };

  const startEdit = (it: InventoryItem) => {
    setEditingId(it.id);
    setForm({
      name: it.name,
      category: it.category,
      quantity: it.quantity,
      weight: it.weight ?? "",
      cost: it.cost ?? "",
      description: it.description,
      slot: (it.slot ?? "") as SlotKind | "",
      strengthReq: it.strengthReq != null ? String(it.strengthReq) : "",
      armorWeight: (it.armorWeight ?? "") as ArmorWeight | "",
      shieldType: it.shieldType ?? "",
      shieldAc: it.shieldAc != null ? String(it.shieldAc) : "",
    });
    setWeapon(
      it.weapon
        ? {
            category: it.weapon.category ?? "",
            // A saved type not in the standard list is treated as custom.
            type: it.weapon.type
              ? WEAPON_TYPES.includes(it.weapon.type)
                ? it.weapon.type
                : "Custom"
              : "",
            customType:
              it.weapon.type && !WEAPON_TYPES.includes(it.weapon.type)
                ? it.weapon.type
                : "",
            damage: it.weapon.damage ?? "",
            damageType: it.weapon.damageType ?? "",
            range: it.weapon.range ?? "",
            versatileDamage: it.weapon.versatileDamage ?? "",
            properties: it.weapon.properties ?? [],
          }
        : blankWeapon,
    );
    setMods((it.modifiers ?? []) as DraftMod[]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(blankItem);
    setWeapon(blankWeapon);
    setMods([]);
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
          {editingId ? (
            <>
              <Pencil className="h-4 w-4 text-primary" /> Edit item
            </>
          ) : (
            <>
              <Package className="h-4 w-4 text-primary" /> Add custom item
            </>
          )}
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
          <div className="md:col-span-2">
            <Label className="text-xs uppercase text-muted-foreground">
              Type (slot)
            </Label>
            <select
              value={form.slot}
              onChange={(e) => {
                const slot = e.target.value as SlotKind | "";
                // Rings, cloaks, weapons, and shields are never armor.
                const noArmor = ["Ring", "Cloak", "Weapon", "Shield"].includes(
                  slot,
                );
                setForm({
                  ...form,
                  slot,
                  ...(noArmor ? { armorWeight: "", strengthReq: "" } : {}),
                  ...(slot !== "Shield"
                    ? { shieldType: "", shieldAc: "" }
                    : {}),
                });
                if (slot !== "Weapon") setWeapon(blankWeapon);
              }}
              className={SELECT_CLASS}
            >
              <option value="">None (not equippable)</option>
              {SLOT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          {showArmorFields && (
            <>
              <div className="md:col-span-2">
                <Label className="text-xs uppercase text-muted-foreground">
                  Armor type
                </Label>
                <select
                  value={form.armorWeight}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      armorWeight: e.target.value as ArmorWeight | "",
                    })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="">None (not armor)</option>
                  {ARMOR_WEIGHTS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs uppercase text-muted-foreground">
                  Strength req.
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.strengthReq}
                  onChange={(e) =>
                    setForm({ ...form, strengthReq: e.target.value })
                  }
                  placeholder="—"
                />
              </div>
            </>
          )}
          {isShield && (
            <>
              <div className="md:col-span-3">
                <Label className="text-xs uppercase text-muted-foreground">
                  Shield type
                </Label>
                <select
                  value={form.shieldType}
                  onChange={(e) =>
                    setForm({ ...form, shieldType: e.target.value })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="">— Select —</option>
                  {SHIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <Label className="text-xs uppercase text-muted-foreground">
                  AC bonus
                </Label>
                <Input
                  type="number"
                  value={form.shieldAc}
                  onChange={(e) =>
                    setForm({ ...form, shieldAc: e.target.value })
                  }
                  placeholder="+2"
                />
              </div>
            </>
          )}
          {isWeapon && (
            <>
              <div className="md:col-span-2">
                <Label className="text-xs uppercase text-muted-foreground">
                  Weapon category
                </Label>
                <select
                  value={weapon.category}
                  onChange={(e) =>
                    setWeapon({ ...weapon, category: e.target.value })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="">— Select —</option>
                  {WEAPON_CATEGORIES.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs uppercase text-muted-foreground">
                  Weapon type
                </Label>
                <select
                  value={weapon.type}
                  onChange={(e) =>
                    setWeapon({ ...weapon, type: e.target.value })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="">— Select —</option>
                  {WEAPON_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="Custom">Custom…</option>
                </select>
              </div>
              {weapon.type === "Custom" && (
                <div className="md:col-span-2">
                  <Label className="text-xs uppercase text-muted-foreground">
                    Custom type
                  </Label>
                  <Input
                    value={weapon.customType}
                    onChange={(e) =>
                      setWeapon({ ...weapon, customType: e.target.value })
                    }
                    placeholder="Spiked chain…"
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <Label className="text-xs uppercase text-muted-foreground">
                  Damage
                </Label>
                <Input
                  value={weapon.damage}
                  onChange={(e) =>
                    setWeapon({ ...weapon, damage: e.target.value })
                  }
                  placeholder="1d8"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs uppercase text-muted-foreground">
                  Damage type
                </Label>
                <select
                  value={weapon.damageType}
                  onChange={(e) =>
                    setWeapon({ ...weapon, damageType: e.target.value })
                  }
                  className={SELECT_CLASS}
                >
                  <option value="">—</option>
                  {DAMAGE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs uppercase text-muted-foreground">
                  Range
                </Label>
                <Input
                  value={weapon.range}
                  onChange={(e) =>
                    setWeapon({ ...weapon, range: e.target.value })
                  }
                  placeholder="5 ft or 80/320"
                />
              </div>
              {weapon.properties.includes("Versatile") && (
                <div className="md:col-span-2">
                  <Label className="text-xs uppercase text-muted-foreground">
                    Versatile dmg
                  </Label>
                  <Input
                    value={weapon.versatileDamage}
                    onChange={(e) =>
                      setWeapon({ ...weapon, versatileDamage: e.target.value })
                    }
                    placeholder="1d10"
                  />
                </div>
              )}
              <div className="md:col-span-6">
                <Label className="text-xs uppercase text-muted-foreground">
                  Properties
                </Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {WEAPON_PROPERTIES.map((p) => {
                    const on = weapon.properties.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleProp(p)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          on
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
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
          <div className="md:col-span-6">
            <ModifierEditor
              mods={mods}
              onChange={setMods}
              emptyHint="No stat bonuses. Add some if wearing/wielding this item should change ability scores, AC, DC, saves, attack rolls, damage, or skills — they apply while it's equipped."
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={submit}>
            {editingId ? (
              <>
                <Save className="h-4 w-4 mr-1.5" /> Save changes
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" /> Add item
              </>
            )}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={cancelEdit}>
              <X className="h-4 w-4 mr-1.5" /> Cancel
            </Button>
          )}
        </div>
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
                    equippedLabel={equippedSlotLabel(c, it.id)}
                    onQty={(delta) =>
                      updateItem(c.id, it.id, {
                        quantity: Math.max(1, it.quantity + delta),
                      })
                    }
                    onEdit={() => startEdit(it)}
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
  const wSummary = weaponSummary(it.weapon);
  const meta = [
    it.slot,
    it.armorWeight && `${it.armorWeight} armor`,
    it.shieldType && `${it.shieldType} shield`,
    it.shieldAc != null ? `+${it.shieldAc} AC` : null,
    it.strengthReq ? `Str ${it.strengthReq}` : null,
    it.cost,
    it.weight,
  ].filter(Boolean);
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
            {meta.join(" · ")}
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
      {wSummary && (
        <p className="text-[11px] text-muted-foreground mt-1.5">{wSummary}</p>
      )}
      {it.description && (
        <p className="text-sm mt-2 text-muted-foreground whitespace-pre-wrap">
          {it.description}
        </p>
      )}
      {it.modifiers && it.modifiers.length > 0 && (
        <div
          className={`flex flex-wrap gap-1.5 mt-2 ${equipped ? "" : "opacity-50"}`}
          title={
            equipped ? "Active while equipped" : "Equip to apply these bonuses"
          }
        >
          {it.modifiers.map((m, i) => (
            <span
              key={i}
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                m.delta >= 0
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              {modifierLabel(m)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
