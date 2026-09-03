import { useRef, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { importFromFile } from "@/lib/import";
import { savePortrait } from "@/lib/portraitStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FileUp, Loader2, TriangleAlert } from "lucide-react";

/**
 * Import a character from an uploaded fillable 5e PDF or Tintagel .xlsx. On
 * success it creates the character and shows a dialog listing the homebrew
 * bits that couldn't come from a 5e sheet and must be added by hand.
 */
export function ImportCharacterButton({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const importCharacter = useStore((s) => s.importCharacter);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState<string[] | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setLoading(true);
    try {
      const result = await importFromFile(file);
      const id = importCharacter(result.character);
      // An embedded portrait (e.g. from the Tintagel sheet) → IndexedDB.
      if (result.portrait) {
        await savePortrait(id, {
          source: result.portrait,
          cropped: result.portrait,
        });
      }
      toast.success(`Imported ${result.character.name ?? "character"}`);
      // Drop the "add a portrait" note when we actually imported one.
      setWarnings(
        result.portrait
          ? result.warnings.filter((w) => !/portrait/i.test(w))
          : result.warnings,
      );
      onNavigate?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't import that file",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.xlsx,.xls,application/pdf"
        className="hidden"
        onChange={onFile}
      />
      <Button
        variant="outline"
        className="w-full"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Importing…
          </>
        ) : (
          <>
            <FileUp className="h-4 w-4 mr-1" /> Import sheet
          </>
        )}
      </Button>

      <Dialog open={!!warnings} onOpenChange={(o) => !o && setWarnings(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-primary" /> Imported — add
              these manually
            </DialogTitle>
            <DialogDescription>
              The core sheet came across. These don&apos;t exist on a standard
              5e sheet, so add them yourself in Grimoire:
            </DialogDescription>
          </DialogHeader>
          <ul className="text-sm space-y-1.5 list-disc pl-5 text-muted-foreground max-h-[50vh] overflow-y-auto">
            {warnings?.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
          <DialogFooter>
            <Button onClick={() => setWarnings(null)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
