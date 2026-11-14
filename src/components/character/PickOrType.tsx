import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

// Sentinel option value for "type my own" — distinctive so it can't collide
// with a real option label.
const CUSTOM = "__pick_or_type_custom__";

/**
 * A <select> of `options` that ends in a "Custom…" entry. Choosing it — or
 * holding a `value` that isn't in the list — swaps to a free-text field with an
 * ✕ to return to the dropdown. Owns its own "typing custom" state, so callers
 * just pass options/value/onChange and don't track custom mode themselves.
 */
export function PickOrType({
  options,
  value,
  onChange,
  placeholder = "Select…",
  customPlaceholder = "Custom…",
  selectClassName,
  inputClassName = "h-8",
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  customPlaceholder?: string;
  selectClassName: string;
  inputClassName?: string;
}) {
  const [typing, setTyping] = useState(false);
  const inList = options.includes(value);
  // Free-text mode if the user chose "Custom…", or the stored value isn't a
  // known option (e.g. a homebrew name typed earlier).
  const custom = typing || (!!value && !inList);

  if (custom) {
    return (
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          placeholder={customPlaceholder}
        />
        <button
          type="button"
          title="Pick from list"
          onClick={() => {
            setTyping(false);
            onChange("");
          }}
          className="text-muted-foreground hover:text-primary shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <select
      className={selectClassName}
      value={inList ? value : ""}
      onChange={(e) => {
        if (e.target.value === CUSTOM) {
          setTyping(true);
          onChange("");
        } else onChange(e.target.value);
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
      <option value={CUSTOM}>Custom…</option>
    </select>
  );
}
