import { useState } from "react";
import { toast } from "sonner";
import { Character, Effect } from "@/lib/types";
import { DraftMod, expandMods, modifierLabel } from "@/lib/modifiers";
import { ModifierEditor } from "@/components/character/ModifierEditor";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  ShieldPlus,
  ShieldOff,
  BookmarkPlus,
  BookMarked,
  Wand2,
} from "lucide-react";

export function EffectsTab({ c }: { c: Character }) {
  const { addEffect, removeEffect, saveEffectToLibrary, removeSavedEffect } =
    useStore();
  const savedEffects = useStore((s) => s.savedEffects);

  const [kind, setKind] = useState<"buff" | "debuff">("buff");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [mods, setMods] = useState<DraftMod[]>([]);

  const buildPayload = (): Omit<Effect, "id"> | null => {
    if (!name.trim()) return null;
    return {
      kind,
      name: name.trim(),
      description: description.trim(),
      duration: duration.trim() || undefined,
      modifiers: expandMods(mods),
    };
  };

  const clearForm = () => {
    setName("");
    setDescription("");
    setDuration("");
    setMods([]);
  };

  const notifyApplied = (name: string, added: string | null) => {
    if (added) toast.success(`Applied ${name}`);
    else toast.warning(`${name} is already active`);
  };

  const submit = () => {
    const payload = buildPayload();
    if (!payload) return;
    notifyApplied(payload.name, addEffect(c.id, payload));
    clearForm();
  };

  const saveAndApply = () => {
    const payload = buildPayload();
    if (!payload) return;
    saveEffectToLibrary(payload);
    notifyApplied(payload.name, addEffect(c.id, payload));
    clearForm();
  };

  const saveOnly = () => {
    const payload = buildPayload();
    if (!payload) return;
    saveEffectToLibrary(payload);
    toast.success(`Saved ${payload.name} to library`);
    clearForm();
  };

  const applySaved = (e: Effect) => {
    notifyApplied(
      e.name,
      addEffect(c.id, {
        kind: e.kind,
        name: e.name,
        description: e.description,
        duration: e.duration,
        modifiers: e.modifiers,
      }),
    );
  };

  const buffs = c.effects.filter((e) => e.kind === "buff");
  const debuffs = c.effects.filter((e) => e.kind === "debuff");

  return (
    <div className="space-y-6">
      <section className="grimoire-card p-6">
        <h3 className="font-display text-lg mb-4">Inscribe new effect</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Type
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Button
                type="button"
                variant={kind === "buff" ? "default" : "outline"}
                onClick={() => setKind("buff")}
                className="flex-1"
              >
                <ShieldPlus className="h-4 w-4 mr-1.5" /> Buff
              </Button>
              <Button
                type="button"
                variant={kind === "debuff" ? "destructive" : "outline"}
                onClick={() => setKind("debuff")}
                className="flex-1"
              >
                <ShieldOff className="h-4 w-4 mr-1.5" /> Debuff
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Duration
            </Label>
            <Input
              className="mt-1.5"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="1 minute, 3 rounds…"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Name
            </Label>
            <Input
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bless, Poisoned, Bardic Inspiration…"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Description
            </Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this effect do?"
            />
          </div>
          <div className="md:col-span-2">
            <ModifierEditor
              mods={mods}
              onChange={setMods}
              emptyHint="No modifiers. Add some if this effect changes ability scores, AC, DC, saves, attack rolls, damage, or skills."
            />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={submit}>
            <Plus className="h-4 w-4 mr-1.5" /> Apply effect
          </Button>
          <Button onClick={saveAndApply} variant="secondary">
            <BookmarkPlus className="h-4 w-4 mr-1.5" /> Apply & save to library
          </Button>
          <Button onClick={saveOnly} variant="outline">
            <BookMarked className="h-4 w-4 mr-1.5" /> Save to library
          </Button>
        </div>
      </section>

      <section className="grimoire-card p-5">
        <h3 className="font-display text-lg mb-3 flex items-center gap-2">
          <BookMarked className="h-4 w-4" /> Effect Library
        </h3>
        {savedEffects.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Saved buffs & debuffs land here, ready to reapply to any adventurer.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedEffects.map((e) => (
              <div
                key={e.id}
                className="border border-border rounded-md p-3 bg-background/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display flex items-center gap-2">
                      {e.name}
                      <span
                        className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          e.kind === "buff"
                            ? "border-primary/40 text-primary"
                            : "border-destructive/40 text-destructive"
                        }`}
                      >
                        {e.kind}
                      </span>
                    </div>
                    {e.duration && (
                      <div className="text-[11px] text-muted-foreground">
                        {e.duration}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeSavedEffect(e.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove from library"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {e.description && (
                  <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                    {e.description}
                  </p>
                )}
                {e.modifiers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {e.modifiers.slice(0, 6).map((m, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono px-2 py-0.5 rounded border border-border text-muted-foreground"
                      >
                        {modifierLabel(m)}
                      </span>
                    ))}
                    {e.modifiers.length > 6 && (
                      <span className="text-[11px] text-muted-foreground">
                        +{e.modifiers.length - 6} more
                      </span>
                    )}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3 w-full"
                  onClick={() => applySaved(e)}
                >
                  <Wand2 className="h-3.5 w-3.5 mr-1.5" /> Apply to{" "}
                  {c.name || "character"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EffectColumn
          title="Buffs"
          emptyText="No blessings active."
          items={buffs}
          onRemove={(id) => removeEffect(c.id, id)}
          accent="primary"
        />
        <EffectColumn
          title="Debuffs"
          emptyText="No afflictions active."
          items={debuffs}
          onRemove={(id) => removeEffect(c.id, id)}
          accent="destructive"
        />
      </div>
    </div>
  );
}

function EffectColumn({
  title,
  items,
  emptyText,
  onRemove,
  accent,
}: {
  title: string;
  items: Character["effects"];
  emptyText: string;
  onRemove: (id: string) => void;
  accent: "primary" | "destructive";
}) {
  return (
    <section className="grimoire-card p-5">
      <h3
        className={`font-display text-lg mb-3 ${accent === "primary" ? "text-primary" : "text-destructive"}`}
      >
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.map((e) => (
            <div
              key={e.id}
              className="border border-border rounded-md p-3 bg-background/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display">{e.name}</div>
                  {e.duration && (
                    <div className="text-[11px] text-muted-foreground">
                      {e.duration}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onRemove(e.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {e.description && (
                <p className="text-sm mt-2 text-muted-foreground">
                  {e.description}
                </p>
              )}
              {e.modifiers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {e.modifiers.map((m, i) => (
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
          ))}
        </div>
      )}
    </section>
  );
}
