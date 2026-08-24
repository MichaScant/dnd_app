import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Character } from "@/lib/types";
import { useStore } from "@/lib/store";
import { usePortrait, savePortrait, deletePortrait } from "@/lib/portraitStore";
import { ImageCropper } from "@/components/character/ImageCropper";
import { ImagePlus, Crop, Upload, X } from "lucide-react";

// Bound the stored original so re-cropping stays cheap without keeping a raw
// multi-megapixel photo around.
const SOURCE_MAX = 1280;

/** Load an image file and downscale it to at most SOURCE_MAX on its long side. */
function fileToBoundedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      img.src = reader.result as string;
    };
    img.onerror = () => reject(new Error("decode failed"));
    img.onload = () => {
      const scale = Math.min(1, SOURCE_MAX / Math.max(img.width, img.height));
      if (scale === 1) {
        resolve(reader.result as string); // already small enough
        return;
      }
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("no canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * A framed character portrait with upload + crop. The image is stored in
 * IndexedDB (see portraitStore); the character only references it by id.
 */
export function CharacterPortrait({ c }: { c: Character }) {
  const { update } = useStore();
  const record = usePortrait(c.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // One-time migration: an older build stored the image inline on the
  // character (localStorage). Move it into IndexedDB, then clear the field.
  useEffect(() => {
    if (!c.portrait) return;
    const url = c.portrait;
    savePortrait(c.id, { source: url, cropped: url }).finally(() =>
      update(c.id, { portrait: undefined }),
    );
  }, [c.portrait, c.id, update]);

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
      setCropSrc(await fileToBoundedDataUrl(file)); // opens the cropper
    } catch {
      toast.error("Couldn't load that image");
    }
  };

  const onConfirmCrop = async (cropped: string) => {
    const source = cropSrc;
    setCropSrc(null);
    if (!source) return;
    try {
      await savePortrait(c.id, { source, cropped });
      toast.success("Portrait saved");
    } catch {
      toast.error("Couldn't save the portrait");
    }
  };

  const cropped = record?.cropped;

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
        {cropped ? (
          <>
            <img
              src={cropped}
              alt={`${c.name || "Character"} portrait`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-1.5 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              {record?.source && (
                <button
                  type="button"
                  onClick={() => setCropSrc(record.source)}
                  className="text-white/90 hover:text-white"
                  title="Adjust crop"
                  aria-label="Adjust crop"
                >
                  <Crop className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={pick}
                className="text-white/90 hover:text-white"
                title="Replace image"
                aria-label="Replace image"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => deletePortrait(c.id)}
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

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onCancel={() => setCropSrc(null)}
          onConfirm={onConfirmCrop}
        />
      )}
    </div>
  );
}
