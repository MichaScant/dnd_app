import { ReactNode, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * A `grimoire-card` box whose body collapses to just its title, so tabs can be
 * decluttered without losing their headings. The open/closed state is
 * remembered per `storageId` across reloads (and across tab switches within a
 * session). Pass the icon + label together as `title`; a chevron is prepended.
 */
export function CollapsibleCard({
  title,
  storageId,
  defaultOpen = true,
  className = "grimoire-card p-6",
  titleClassName = "font-display text-lg",
  right,
  children,
}: {
  title: ReactNode;
  storageId?: string;
  defaultOpen?: boolean;
  className?: string;
  titleClassName?: string;
  right?: ReactNode; // optional header-right controls (kept visible when collapsed)
  children: ReactNode;
}) {
  const key = storageId ? `grimoire-collapse:${storageId}` : null;
  const [open, setOpen] = useState(defaultOpen);

  // Restore persisted state after mount (kept out of the initial render so SSR
  // hydration stays consistent).
  useEffect(() => {
    if (!key) return;
    try {
      const v = localStorage.getItem(key);
      if (v !== null) setOpen(v === "1");
    } catch {
      /* localStorage unavailable — fall back to defaultOpen */
    }
  }, [key]);

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      if (key) {
        try {
          localStorage.setItem(key, next ? "1" : "0");
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  };

  return (
    <section className={className}>
      <div
        className={`flex items-center justify-between gap-2 ${open ? "mb-3" : "mb-0"}`}
      >
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className={`${titleClassName} flex flex-1 items-center gap-2 text-left`}
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              open ? "" : "-rotate-90"
            }`}
          />
          {title}
        </button>
        {right}
      </div>
      {open && children}
    </section>
  );
}
