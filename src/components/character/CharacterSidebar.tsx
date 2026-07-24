import { useState } from "react";
import { useStore } from "@/lib/store";
import { Character } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Skull, Swords, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CharacterSidebar() {
  const { characters, activeId, setActive, addCharacter, removeCharacter } = useStore();
  const [newName, setNewName] = useState("");

  const create = () => {
    addCharacter(newName.trim() || "New Adventurer");
    setNewName("");
  };

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card/40 backdrop-blur-sm flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <Swords className="h-5 w-5 text-primary" />
          <h1 className="font-display text-xl text-gradient-ember">Grimoire</h1>
        </div>
        <p className="text-xs text-muted-foreground">Adventurer's Codex</p>
      </div>

      <div className="p-3 border-b border-border space-y-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Character name…"
          onKeyDown={(e) => e.key === "Enter" && create()}
          className="bg-input/60 border-border"
        />
        <Button onClick={create} className="w-full" variant="default">
          <Plus className="h-4 w-4 mr-1" /> Forge new hero
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {characters.length === 0 && (
            <p className="text-xs text-muted-foreground p-4 text-center">
              No heroes yet. Forge one above.
            </p>
          )}
          {characters.map((c) => (
            <CharacterRow
              key={c.id}
              c={c}
              active={c.id === activeId}
              onSelect={() => setActive(c.id)}
              onRemove={() => removeCharacter(c.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}

function CharacterRow({
  c, active, onSelect, onRemove,
}: { c: Character; active: boolean; onSelect: () => void; onRemove: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group cursor-pointer rounded-md px-3 py-2.5 border transition-all",
        active
          ? "bg-primary/10 border-primary/40 ember-glow"
          : "border-transparent hover:bg-muted hover:border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-sm truncate">{c.name}</div>
          <div className="text-[11px] text-muted-foreground truncate">
            Lv {c.level} {c.race} {c.classSummary || "—"}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${c.name}?`)) onRemove(); }}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><Skull className="h-3 w-3" />{c.hp}/{c.maxHp}</span>
        <span>AC {c.ac}</span>
      </div>
    </div>
  );
}
