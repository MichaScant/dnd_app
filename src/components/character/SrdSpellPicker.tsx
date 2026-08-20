import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Character } from "@/lib/types";
import { useStore } from "@/lib/store";
import {
  SrdSpell,
  SRD_CLASSES,
  SRD_ATTRIBUTION,
  spellsForClass,
  groupByLevel,
  toHomebrewSpell,
} from "@/lib/srd-spells";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookPlus, Search, Brain, Check, ScrollText } from "lucide-react";

const levelLabel = (lvl: number) => (lvl === 0 ? "Cantrips" : `Level ${lvl}`);

export function SrdSpellPicker({ c }: { c: Character }) {
  const addSpell = useStore((s) => s.addSpell);
  const [open, setOpen] = useState(false);
  const [cls, setCls] = useState<string | null>("Wizard");
  const [query, setQuery] = useState("");

  // Names already in this character's spellbook (case-insensitive), for de-dup.
  const existing = useMemo(
    () => new Set(c.spells.map((s) => s.name.trim().toLowerCase())),
    [c.spells],
  );

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = spellsForClass(cls).filter(
      (s) => !q || s.name.toLowerCase().includes(q),
    );
    return groupByLevel(list);
  }, [cls, query]);

  const total = groups.reduce((n, [, list]) => n + list.length, 0);

  const add = (s: SrdSpell) => {
    if (existing.has(s.name.trim().toLowerCase())) {
      toast.warning(`${s.name} is already in your spellbook`);
      return;
    }
    addSpell(c.id, toHomebrewSpell(s));
    toast.success(`Added ${s.name}`, { description: levelLabel(s.level) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <BookPlus className="h-4 w-4 mr-1.5" /> Add D&D Spell
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-primary" /> Add a D&D Spell
          </DialogTitle>
          <DialogDescription>
            Browse the SRD 5.1 spell list by class, then level. Adds a full copy
            to {c.name || "this character"}'s spellbook.
          </DialogDescription>
        </DialogHeader>

        {/* Class selector */}
        <div className="flex flex-wrap gap-1.5">
          <ClassChip
            label="All"
            active={cls === null}
            onClick={() => setCls(null)}
          />
          {SRD_CLASSES.map((name) => (
            <ClassChip
              key={name}
              label={name}
              active={cls === name}
              onClick={() => setCls(name)}
            />
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="pl-8"
          />
        </div>

        {/* Results */}
        <div className="max-h-[45vh] overflow-y-auto pr-1 -mr-1 space-y-4">
          {total === 0 ? (
            <p className="text-sm text-muted-foreground italic py-6 text-center">
              No spells match.
            </p>
          ) : (
            groups.map(([lvl, list]) => (
              <div key={lvl}>
                <h4 className="font-display text-xs uppercase tracking-widest text-primary mb-2 sticky top-0 bg-background/95 py-1">
                  {levelLabel(lvl)}
                </h4>
                <div className="space-y-1.5">
                  {list.map((s) => {
                    const added = existing.has(s.name.trim().toLowerCase());
                    return (
                      <div
                        key={s.name}
                        className="flex items-center justify-between gap-3 border border-border rounded-md px-3 py-2 bg-background/40"
                      >
                        <div className="min-w-0">
                          <div className="font-display flex items-center gap-1.5 flex-wrap">
                            <span className="truncate">{s.name}</span>
                            {s.concentration && (
                              <span className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded border border-primary/40 text-primary flex items-center gap-0.5">
                                <Brain className="h-2.5 w-2.5" /> Conc
                              </span>
                            )}
                            {s.ritual && (
                              <span className="text-[9px] uppercase tracking-wider px-1 py-0.5 rounded border border-border text-muted-foreground">
                                Ritual
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {s.school} · {s.castingTime} · {s.range}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={added ? "ghost" : "secondary"}
                          disabled={added}
                          onClick={() => add(s)}
                          className="shrink-0"
                        >
                          {added ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" /> Added
                            </>
                          ) : (
                            "Add"
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
          {SRD_ATTRIBUTION}
        </p>
      </DialogContent>
    </Dialog>
  );
}

function ClassChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:border-primary/50"
      }`}
    >
      {label}
    </button>
  );
}
