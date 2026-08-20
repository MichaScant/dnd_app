import { Effect, HomebrewSpell } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Brain } from "lucide-react";

export interface CastPrompt {
  spell: HomebrewSpell;
  stage: "ask" | "drop"; // "ask" = are you concentrating?, "drop" = pick one to drop
}

/**
 * The two-step prompt shown when casting a concentration spell: first confirm
 * you're the one concentrating, then (if already at the limit) choose which
 * active concentration to drop. Purely presentational — the parent owns state.
 */
export function ConcentrationDialog({
  prompt,
  count,
  max,
  activeConcentration,
  onClose,
  onCastUnconcentrated,
  onCastConcentrating,
  onDrop,
}: {
  prompt: CastPrompt | null;
  count: number;
  max: number;
  activeConcentration: Effect[];
  onClose: () => void;
  onCastUnconcentrated: () => void;
  onCastConcentrating: () => void;
  onDrop: (effectId: string) => void;
}) {
  return (
    <Dialog open={!!prompt} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {prompt?.stage === "ask" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> Are you concentrating
                on {prompt.spell.name}?
              </DialogTitle>
              <DialogDescription>
                If you cast this spell, answer Yes. If someone else cast it on
                you, they hold concentration — answer No and it won't count
                against your limit ({count}/{max}).
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={onCastUnconcentrated}>
                No, someone else is
              </Button>
              <Button onClick={onCastConcentrating}>
                <Brain className="h-4 w-4 mr-1.5" /> Yes, I'm concentrating
              </Button>
            </DialogFooter>
          </>
        )}
        {prompt?.stage === "drop" && (
          <>
            <DialogHeader>
              <DialogTitle>
                Concentration limit reached ({count}/{max})
              </DialogTitle>
              <DialogDescription>
                You can't concentrate on {prompt.spell.name} as well. Choose a
                spell to stop concentrating on — it will be dropped and{" "}
                {prompt.spell.name} applied.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              {activeConcentration.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onDrop(e.id)}
                  className="w-full text-left border border-border rounded-md p-3 bg-background/40 hover:border-destructive hover:bg-destructive/10 transition-colors"
                >
                  <div className="font-display">{e.name}</div>
                  {e.duration && (
                    <div className="text-[11px] text-muted-foreground">
                      {e.duration}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
