import { useState } from "react";
import { useActiveCharacter, useStore } from "@/lib/store";
import { CharacterSidebar } from "@/components/character/CharacterSidebar";
import { OverviewTab } from "@/components/character/OverviewTab";
import { EffectsTab } from "@/components/character/EffectsTab";
import { SpellsTab } from "@/components/character/SpellsTab";
import { AbilitiesTab } from "@/components/character/AbilitiesTab";
import { ClassesTab } from "@/components/character/ClassesTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollText, Sparkles, Zap, Crown, Flame, Plus } from "lucide-react";

export function CharacterManager() {
  const c = useActiveCharacter();
  const addCharacter = useStore((s) => s.addCharacter);
  const [tab, setTab] = useState("overview");

  return (
    <div className="flex min-h-screen w-full">
      <CharacterSidebar />
      <main className="flex-1 min-w-0">
        {!c ? (
          <EmptyState onCreate={() => addCharacter("New Adventurer")} />
        ) : (
          <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <header className="mb-6">
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">Adventurer's Codex</div>
              <h2 className="font-display text-4xl text-gradient-ember">{c.name || "Unnamed"}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Level {c.level} · {c.race || "Unknown race"} · {c.classSummary || "No class"}
              </p>
            </header>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="bg-card/60 border border-border p-1 mb-6 h-auto flex-wrap">
                <TabsTrigger value="overview"><ScrollText className="h-4 w-4 mr-1.5" /> Sheet</TabsTrigger>
                <TabsTrigger value="effects"><Flame className="h-4 w-4 mr-1.5" /> Buffs & Debuffs</TabsTrigger>
                <TabsTrigger value="spells"><Sparkles className="h-4 w-4 mr-1.5" /> Spells</TabsTrigger>
                <TabsTrigger value="abilities"><Zap className="h-4 w-4 mr-1.5" /> Abilities</TabsTrigger>
                <TabsTrigger value="classes"><Crown className="h-4 w-4 mr-1.5" /> Classes & Leveling</TabsTrigger>
              </TabsList>
              <TabsContent value="overview"><OverviewTab c={c} /></TabsContent>
              <TabsContent value="effects"><EffectsTab c={c} /></TabsContent>
              <TabsContent value="spells"><SpellsTab c={c} /></TabsContent>
              <TabsContent value="abilities"><AbilitiesTab c={c} /></TabsContent>
              <TabsContent value="classes"><ClassesTab c={c} /></TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="h-screen flex items-center justify-center p-10">
      <div className="text-center max-w-md">
        <div className="font-display text-6xl text-gradient-ember mb-4">⚔</div>
        <h2 className="font-display text-3xl mb-3">The codex awaits</h2>
        <p className="text-muted-foreground mb-6">
          Forge your first adventurer to begin. Each hero keeps their own homebrew spells, abilities, classes, and afflictions.
        </p>
        <Button size="lg" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" /> Forge first hero
        </Button>
      </div>
    </div>
  );
}
