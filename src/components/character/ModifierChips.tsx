import { StatModifier } from "@/lib/types";
import { modifierLabel } from "@/lib/modifiers";

/**
 * A row of modifier "chips" (e.g. STR +2, AC +1). Positive deltas render in
 * the primary colour, negative in the destructive colour. Shared by the
 * inventory rows and the sheet's Equipment box.
 */
export function ModifierChips({
  modifiers,
  dimmed = false,
  title,
}: {
  modifiers?: StatModifier[];
  dimmed?: boolean; // grey out when the source isn't currently equipped
  title?: string;
}) {
  if (!modifiers || modifiers.length === 0) return null;
  return (
    <div
      className={`flex flex-wrap gap-1.5 mt-2 ${dimmed ? "opacity-50" : ""}`}
      title={title}
    >
      {modifiers.map((m, i) => (
        <span
          key={i}
          className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
            m.delta >= 0
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {modifierLabel(m)}
        </span>
      ))}
    </div>
  );
}
