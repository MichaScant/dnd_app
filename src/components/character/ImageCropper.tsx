import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ZoomIn } from "lucide-react";

// The crop viewport is 3:4 (portrait); output is a fixed, bounded size so a
// large upload always ends up small enough for storage.
const VIEW_W = 270;
const VIEW_H = 360;
const OUT_W = 384;
const OUT_H = 512;
const MAX_ZOOM = 4;
const JPEG_QUALITY = 0.85;

/**
 * Reposition-and-zoom cropper. Drag to pan, slider to zoom; on save it renders
 * the visible region of the source to a 3:4 canvas and returns a JPEG data URL.
 */
export function ImageCropper({
  src,
  onCancel,
  onConfirm,
}: {
  src: string;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{
    px: number;
    py: number;
    ox: number;
    oy: number;
  } | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // At zoom 1 the image exactly covers the viewport; zoom only goes tighter.
  const baseScale = natural
    ? Math.max(VIEW_W / natural.w, VIEW_H / natural.h)
    : 1;
  const scale = baseScale * zoom;
  const dispW = natural ? natural.w * scale : VIEW_W;
  const dispH = natural ? natural.h * scale : VIEW_H;

  // Keep the image covering the frame — no empty gaps at the edges.
  const clampOffset = (x: number, y: number, w = dispW, h = dispH) => ({
    x: Math.min(0, Math.max(VIEW_W - w, x)),
    y: Math.min(0, Math.max(VIEW_H - h, y)),
  });

  const onImgLoad = () => {
    const el = imgRef.current;
    if (!el) return;
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    const base = Math.max(VIEW_W / w, VIEW_H / h);
    setNatural({ w, h });
    setZoom(1);
    setOffset({ x: (VIEW_W - w * base) / 2, y: (VIEW_H - h * base) / 2 });
  };

  const changeZoom = (z: number) => {
    if (!natural) {
      setZoom(z);
      return;
    }
    const newScale = baseScale * z;
    // Keep whatever is under the viewport centre fixed while zooming.
    const cx = (VIEW_W / 2 - offset.x) / scale;
    const cy = (VIEW_H / 2 - offset.y) / scale;
    const nx = VIEW_W / 2 - cx * newScale;
    const ny = VIEW_H / 2 - cy * newScale;
    setZoom(z);
    setOffset(clampOffset(nx, ny, natural.w * newScale, natural.h * newScale));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset(
      clampOffset(
        drag.current.ox + (e.clientX - drag.current.px),
        drag.current.oy + (e.clientY - drag.current.py),
      ),
    );
  };
  const endDrag = () => {
    drag.current = null;
  };

  const confirm = () => {
    const el = imgRef.current;
    if (!el || !natural) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // The visible region in source-image pixels.
    ctx.drawImage(
      el,
      -offset.x / scale,
      -offset.y / scale,
      VIEW_W / scale,
      VIEW_H / scale,
      0,
      0,
      OUT_W,
      OUT_H,
    );
    onConfirm(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Position & crop</DialogTitle>
          <DialogDescription>
            Drag to reposition, use the slider to zoom.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div
            className="relative overflow-hidden rounded-lg border border-border bg-background touch-none cursor-grab active:cursor-grabbing"
            style={{ width: VIEW_W, height: VIEW_H }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <img
              ref={imgRef}
              src={src}
              alt="Crop preview"
              onLoad={onImgLoad}
              draggable={false}
              className="absolute max-w-none select-none"
              style={{
                width: dispW,
                height: dispH,
                left: offset.x,
                top: offset.y,
              }}
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/20" />
          </div>

          <div className="flex items-center gap-2 w-full max-w-[270px]">
            <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) => changeZoom(+e.target.value)}
              className="flex-1"
              aria-label="Zoom"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={confirm}>Save portrait</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
