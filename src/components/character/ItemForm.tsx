import { useState, Dispatch, SetStateAction } from "react";
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
  slotUsesArmorFields,
} from "@/lib/equipment";
import { DraftMod, expandMods } from "@/lib/modifiers";
import { ModifierEditor } from "@/components/character/ModifierEditor";
import {
  Field,
  SelectField,
  SELECT_CLASS,
} from "@/components/character/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Package, Pencil, Save, X, FlaskConical } from "lucide-react";

// ---------------------------------------------------------------------------
// Form state — mirrors InventoryItem, but numeric fields are kept as strings
// while the user types and are coerced on submit.
// ---------------------------------------------------------------------------

interface ItemFormState {
  name: string;
  category: string;
  quantity: number;
  weight: string;
  cost: string;
  description: string;
  slot: SlotKind | "";
  strengthReq: string;
  armorWeight: ArmorWeight | "";
  shieldType: string;
  shieldAc: string;
  consumable: boolean;
}

interface WeaponFormState {
  category: string;
  type: string; // a WEAPON_TYPES value, or "Custom"
  customType: string; // free text when type === "Custom"
  damage: string;
  damageType: string;
  range: string;
  versatileDamage: string;
  properties: string[];
}

const blankItem: ItemFormState = {
  name: "",
  category: "Custom",
  quantity: 1,
  weight: "",
  cost: "",
  description: "",
  slot: "",
  strengthReq: "",
  armorWeight: "",
  shieldType: "",
  shieldAc: "",
  consumable: false,
};

const blankWeapon: WeaponFormState = {
  category: "",
  type: "",
  customType: "",
  damage: "",
  damageType: "",
  range: "",
  versatileDamage: "",
  properties: [],
};

const formFromItem = (it: InventoryItem): ItemFormState => ({
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
  consumable: !!it.consumable,
});

const weaponFromItem = (it: InventoryItem): WeaponFormState => {
  const w = it.weapon;
  if (!w) return blankWeapon;
  // A saved type not in the standard list is treated as custom.
  const known = w.type ? WEAPON_TYPES.includes(w.type) : false;
  return {
    category: w.category ?? "",
    type: w.type ? (known ? w.type : "Custom") : "",
    customType: w.type && !known ? w.type : "",
    damage: w.damage ?? "",
    damageType: w.damageType ?? "",
    range: w.range ?? "",
    versatileDamage: w.versatileDamage ?? "",
    properties: w.properties ?? [],
  };
};

// ---------------------------------------------------------------------------
// Conditional field groups.
// ---------------------------------------------------------------------------

function ArmorFields({
  form,
  setForm,
}: {
  form: ItemFormState;
  setForm: Dispatch<SetStateAction<ItemFormState>>;
}) {
  return (
    <>
      <SelectField
        label="Armor type"
        span={2}
        value={form.armorWeight}
        placeholder="None (not armor)"
        options={ARMOR_WEIGHTS}
        onChange={(v) =>
          setForm((f) => ({ ...f, armorWeight: v as ArmorWeight | "" }))
        }
      />
      <Field label="Strength req." span={2}>
        <Input
          type="number"
          min={0}
          value={form.strengthReq}
          onChange={(e) =>
            setForm((f) => ({ ...f, strengthReq: e.target.value }))
          }
          placeholder="—"
        />
      </Field>
    </>
  );
}

function ShieldFields({
  form,
  setForm,
}: {
  form: ItemFormState;
  setForm: Dispatch<SetStateAction<ItemFormState>>;
}) {
  return (
    <>
      <SelectField
        label="Shield type"
        span={3}
        value={form.shieldType}
        placeholder="— Select —"
        options={SHIELD_TYPES}
        onChange={(v) => setForm((f) => ({ ...f, shieldType: v }))}
      />
      <Field label="AC bonus" span={3}>
        <Input
          type="number"
          value={form.shieldAc}
          onChange={(e) => setForm((f) => ({ ...f, shieldAc: e.target.value }))}
          placeholder="+2"
        />
      </Field>
    </>
  );
}

function WeaponFields({
  weapon,
  setWeapon,
}: {
  weapon: WeaponFormState;
  setWeapon: Dispatch<SetStateAction<WeaponFormState>>;
}) {
  const toggleProp = (p: string) =>
    setWeapon((w) => ({
      ...w,
      properties: w.properties.includes(p)
        ? w.properties.filter((x) => x !== p)
        : [...w.properties, p],
    }));

  return (
    <>
      <SelectField
        label="Weapon category"
        span={2}
        value={weapon.category}
        placeholder="— Select —"
        options={WEAPON_CATEGORIES}
        onChange={(v) => setWeapon((w) => ({ ...w, category: v }))}
      />
      <Field label="Weapon type" span={2}>
        <select
          value={weapon.type}
          onChange={(e) => setWeapon((w) => ({ ...w, type: e.target.value }))}
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
      </Field>
      {weapon.type === "Custom" && (
        <Field label="Custom type" span={2}>
          <Input
            value={weapon.customType}
            onChange={(e) =>
              setWeapon((w) => ({ ...w, customType: e.target.value }))
            }
            placeholder="Spiked chain…"
          />
        </Field>
      )}
      <Field label="Damage" span={2}>
        <Input
          value={weapon.damage}
          onChange={(e) => setWeapon((w) => ({ ...w, damage: e.target.value }))}
          placeholder="1d8"
        />
      </Field>
      <SelectField
        label="Damage type"
        span={2}
        value={weapon.damageType}
        placeholder="—"
        options={DAMAGE_TYPES}
        onChange={(v) => setWeapon((w) => ({ ...w, damageType: v }))}
      />
      <Field label="Range" span={2}>
        <Input
          value={weapon.range}
          onChange={(e) => setWeapon((w) => ({ ...w, range: e.target.value }))}
          placeholder="5 ft or 80/320"
        />
      </Field>
      {weapon.properties.includes("Versatile") && (
        <Field label="Versatile dmg" span={2}>
          <Input
            value={weapon.versatileDamage}
            onChange={(e) =>
              setWeapon((w) => ({ ...w, versatileDamage: e.target.value }))
            }
            placeholder="1d10"
          />
        </Field>
      )}
      <Field label="Properties" span={6}>
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
      </Field>
    </>
  );
}

// ---------------------------------------------------------------------------
// The add / edit form. `editing` is null when adding; the parent gives this
// component a fresh `key` per edit target so state re-initialises cleanly.
// ---------------------------------------------------------------------------

export function ItemForm({
  c,
  editing,
  onDone,
}: {
  c: Character;
  editing: InventoryItem | null;
  onDone: () => void;
}) {
  const { addItem, updateItem } = useStore();
  const [form, setForm] = useState<ItemFormState>(() =>
    editing ? formFromItem(editing) : blankItem,
  );
  const [weapon, setWeapon] = useState<WeaponFormState>(() =>
    editing ? weaponFromItem(editing) : blankWeapon,
  );
  const [mods, setMods] = useState<DraftMod[]>(
    () => (editing?.modifiers ?? []) as DraftMod[],
  );

  const isWeapon = form.slot === "Weapon";
  const isShield = form.slot === "Shield";
  // Armor type & Strength requirement only make sense for armor-capable slots.
  const showArmorFields = slotUsesArmorFields(form.slot);

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
    // A consumable is never equippable, so it carries no slot/armor/weapon data.
    const equippable = !form.consumable;
    const base = {
      name: form.name.trim(),
      category: form.category.trim() || "Custom",
      quantity: Math.max(1, form.quantity || 1),
      weight: form.weight.trim() || undefined,
      cost: form.cost.trim() || undefined,
      description: form.description.trim(),
      slot: equippable ? form.slot || undefined : undefined,
      strengthReq:
        equippable && showArmorFields && form.strengthReq
          ? Number(form.strengthReq)
          : undefined,
      armorWeight:
        equippable && showArmorFields
          ? form.armorWeight || undefined
          : undefined,
      weapon: equippable && isWeapon ? buildWeapon() : undefined,
      shieldType:
        equippable && isShield ? form.shieldType || undefined : undefined,
      shieldAc:
        equippable && isShield && form.shieldAc
          ? Number(form.shieldAc)
          : undefined,
      consumable: form.consumable || undefined,
      // Modifiers only apply while equipped, so consumables carry none.
      modifiers: equippable && mods.length ? expandMods(mods) : undefined,
    };
    if (editing) {
      updateItem(c.id, editing.id, base); // patch keeps the item's original kind
      toast.success(`Saved ${base.name}`);
      onDone();
    } else {
      const added = addItem(c.id, { ...base, kind: "custom" });
      if (added) toast.success(`Added ${base.name}`);
      else toast.warning(`${base.name} is already in your inventory`);
      setForm(blankItem);
      setWeapon(blankWeapon);
      setMods([]);
    }
  };

  // Changing the slot resets fields that no longer apply.
  const changeSlot = (value: string) => {
    const slot = value as SlotKind | "";
    const noArmor = !slotUsesArmorFields(slot);
    setForm((f) => ({
      ...f,
      slot,
      ...(noArmor ? { armorWeight: "", strengthReq: "" } : {}),
      ...(slot !== "Shield" ? { shieldType: "", shieldAc: "" } : {}),
    }));
    if (slot !== "Weapon") setWeapon(blankWeapon);
  };

  return (
    <section className="grimoire-card p-6">
      <h3 className="font-display text-lg mb-4 flex items-center gap-2">
        {editing ? (
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
        <Field label="Name" span={3}>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Rope of Climbing, Rations…"
          />
        </Field>
        <Field label="Category" span={2}>
          <Input
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            placeholder="Weapon, Gear…"
          />
        </Field>
        <Field label="Qty">
          <Input
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) =>
              setForm((f) => ({ ...f, quantity: +e.target.value || 1 }))
            }
          />
        </Field>
        <Field label="Weight" span={3}>
          <Input
            value={form.weight}
            onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
            placeholder="3 lb."
          />
        </Field>
        <Field label="Cost" span={3}>
          <Input
            value={form.cost}
            onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
            placeholder="15 gp"
          />
        </Field>

        <div className="md:col-span-6 flex items-center gap-2">
          <Checkbox
            id="item-consumable"
            checked={form.consumable}
            onCheckedChange={(v) => setForm((f) => ({ ...f, consumable: !!v }))}
          />
          <Label
            htmlFor="item-consumable"
            className="text-sm cursor-pointer flex items-center gap-1.5"
          >
            <FlaskConical className="h-3.5 w-3.5 text-primary" /> Consumable
            (potion, scroll, ammo…) — kept in its own list, not equippable
          </Label>
        </div>

        {!form.consumable && (
          <>
            <SelectField
              label="Type (slot)"
              span={2}
              value={form.slot}
              placeholder="None (not equippable)"
              options={SLOT_KINDS}
              onChange={changeSlot}
            />
            {showArmorFields && <ArmorFields form={form} setForm={setForm} />}
            {isShield && <ShieldFields form={form} setForm={setForm} />}
            {isWeapon && <WeaponFields weapon={weapon} setWeapon={setWeapon} />}
          </>
        )}

        <Field label="Description" span={6}>
          <Textarea
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </Field>
        {/* Modifiers apply only while equipped, so they don't apply to
            consumables — hide the editor for them. */}
        {!form.consumable && (
          <div className="md:col-span-6">
            <ModifierEditor
              mods={mods}
              onChange={setMods}
              emptyHint="No stat bonuses. Add some if wearing/wielding this item should change ability scores, AC, DC, saves, attack rolls, damage, or skills — they apply while it's equipped."
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={submit}>
          {editing ? (
            <>
              <Save className="h-4 w-4 mr-1.5" /> Save changes
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1.5" /> Add item
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
