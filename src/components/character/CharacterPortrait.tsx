import { useRef } from "react";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

// Portraits are downscaled and re-encoded before storage so they stay small
// enough for localStorage (a full-res photo would blow the ~5 MB budget fast).
const MAX_DIM = 512;
const JPEG_QUALITY = 0.85;

/** Load an image file, downscale to MAX_DIM, and return a compact JPEG data URL. */
function toPortraitDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      img.src = reader.result as string;
    };
    img.onerror = () => reject(new Error("decode failed"));
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("no canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * A framed character portrait with click-to-upload. Shows the image when set
 * (hover to change, × to remove) or an upload prompt when empty.
 */
export function CharacterPortrait({
  src,
  name,
  onChange,
}: {
  src?: string;
  name: string;
  onChange: (dataUrl: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-selected later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    try {
      onChange(await toPortraitDataUrl(file));
      toast.success("Portrait updated");
    } catch {
      toast.error("Couldn't load that image");
    }
  };

  return (
    <div className="shrink-0 mx-auto md:mx-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
      <div className="relative w-32 aspect-[3/4] rounded-lg overflow-hidden border border-border bg-background/40 group">
        {src ? (
          <>
            <img
              src={src}
              alt={`${name || "Character"} portrait`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={pick}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-[11px]">Change</span>
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-destructive"
              aria-label="Remove portrait"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={pick}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-primary hover:border-primary/50"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-[11px]">Add portrait</span>
          </button>
        )}
      </div>
    </div>
  );
}
