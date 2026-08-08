import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Character } from "@/lib/types";
import { useStore } from "@/lib/store";
import {
  SrdItem,
  ItemMode,
  GEAR_CATEGORIES,
  MAGIC_RARITIES,
  SRD_ATTRIBUTION,
  itemsFor,
  groupItems,
  toInventoryItem,
} from "@/lib/srdItems";
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
import { PackagePlus, Search, Check, Sword, Sparkles } from "lucide-react";

export function SrdItemPicker({ c }: { c: Character }) {
  const addItem = useStore((s) => s.addItem);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ItemMode>("gear");
  const [filter, setFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const existing = useMemo(
    () => new Set((c.inventory ?? []).map((i) => i.name.trim().toLowerCase())),
    [c.inventory],
  );

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = itemsFor(mode, filter).filter(
      (i) => !q || i.name.toLowerCase().includes(q),
    );
    return groupItems(mode, list);
  }, [mode, filter, query]);

  const total = groups.reduce((n, [, list]) => n + list.length, 0);
  const chips = mode === "gear" ? GEAR_CATEGORIES : MAGIC_RARITIES;

  const switchMode = (m: ItemMode) => {
    setMode(m);
    setFilter(null);
  };

  const add = (s: SrdItem) => {
    if (existing.has(s.name.trim().toLowerCase())) {
      toast.warning(`${s.name} is already in your inventory`);
      return;
    }
    addItem(c.id, toInventoryItem(s));
    toast.success(`Added ${s.name}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PackagePlus className="h-4 w-4 mr-1.5" /> Add D&D Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-4 w-4 text-primary" /> Add a D&D Item
          </DialogTitle>
          <DialogDescription>
            Browse the SRD 5.1 equipment and magic items. Adds a copy to{" "}
            {c.name || "this character"}'s inventory.
          </DialogDescription>
        </DialogHeader>

        {/* Gear / Magic toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === "gear" ? "default" : "outline"}
            onClick={() => switchMode("gear")}
            className="flex-1"
          >
            <Sword className="h-4 w-4 mr-1.5" /> Equipment
          </Button>
          <Button
            variant={mode === "magic" ? "default" : "outline"}
            onClick={() => switchMode("magic")}
            className="flex-1"
          >
            <Sparkles className="h-4 w-4 mr-1.5" /> Magic Items
          </Button>
        </div>

        {/* Category / rarity filter */}
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="All"
            active={filter === null}
            onClick={() => setFilter(null)}
          />
          {chips.map((label) => (
            <FilterChip
              key={label}
              label={label}
              active={filter === label}
              onClick={() => setFilter(label)}
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
        <div className="max-h-[42vh] overflow-y-auto pr-1 -mr-1 space-y-4">
          {total === 0 ? (
            <p className="text-sm text-muted-foreground italic py-6 text-center">
              No items match.
            </p>
          ) : (
            groups.map(([label, list]) => (
              <div key={label}>
                <h4 className="font-display text-xs uppercase tracking-widest text-primary mb-2 sticky top-0 bg-background/95 py-1">
                  {label}
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
                          <div className="font-display truncate">{s.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {[s.category, s.rarity, s.cost, s.weight]
                              .filter(Boolean)
                              .join(" · ")}
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

function FilterChip({
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
