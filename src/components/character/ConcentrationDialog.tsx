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
import { UserCheck, Users } from "lucide-react";

export interface CastPrompt {
  spell: HomebrewSpell;
  stage: "self" | "drop"; // "self" = casting on yourself?, "drop" = pick one to drop
  applyMods: boolean; // carried into the drop step
}

/**
 * The cast prompt: first ask whether the spell is cast on yourself (so its
 * bonuses apply to your sheet), then — if a concentration spell would exceed
 * the limit — choose which active concentration to drop. Purely presentational.
 */
export function ConcentrationDialog({
  prompt,
  count,
  max,
  activeConcentration,
  onClose,
  onCastSelf,
  onCastOther,
  onDrop,
}: {
  prompt: CastPrompt | null;
  count: number;
  max: number;
  activeConcentration: Effect[];
  onClose: () => void;
  onCastSelf: () => void;
  onCastOther: () => void;
  onDrop: (effectId: string) => void;
}) {
  return (
    <Dialog open={!!prompt} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {prompt?.stage === "self" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" /> Casting{" "}
                {prompt.spell.name} on yourself?
              </DialogTitle>
              <DialogDescription>
                Yes applies its bonuses to your sheet. If you&apos;re casting it
                on someone else, choose No — your sheet won&apos;t change
                {prompt.spell.concentration
                  ? ", but you'll still be concentrating on it."
                  : "."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={onCastOther}>
                <Users className="h-4 w-4 mr-1.5" /> No — on someone else
              </Button>
              <Button onClick={onCastSelf}>
                <UserCheck className="h-4 w-4 mr-1.5" /> Yes — on me
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
                You can&apos;t concentrate on {prompt.spell.name} as well.
                Choose a spell to stop concentrating on — it will be dropped and{" "}
                {prompt.spell.name} cast.
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
