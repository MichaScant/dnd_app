import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/** Shared styling for the bare <select> elements used across the entry forms. */
export const SELECT_CLASS =
  "w-full bg-input border border-border rounded-md px-3 py-2 text-sm mt-0";

export type FieldSpan = 1 | 2 | 3 | 6;

// Literal class strings so Tailwind's scanner picks them up.
const COL_SPAN: Record<FieldSpan, string> = {
  1: "",
  2: "md:col-span-2",
  3: "md:col-span-3",
  6: "md:col-span-6",
};

/** A labelled cell in a 6-column form grid. */
export function Field({
  label,
  span = 1,
  children,
}: {
  label: string;
  span?: FieldSpan;
  children: ReactNode;
}) {
  return (
    <div className={COL_SPAN[span]}>
      <Label className="text-xs uppercase text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/** A labelled <select>. Omit `placeholder` to skip the leading empty option. */
export function SelectField({
  label,
  span,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  span?: FieldSpan;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: readonly string[];
}) {
  return (
    <Field label={label} span={span}>
      <select
        className={SELECT_CLASS}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}
