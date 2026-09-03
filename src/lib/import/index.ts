import { ImportResult } from "./types";

/**
 * Parse an uploaded character sheet into a Grimoire character. Dispatches by
 * file type; the heavy parser libraries are dynamically imported so they only
 * load when an import actually happens.
 */
export async function importFromFile(file: File): Promise<ImportResult> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { parseFillablePdf } = await import("./pdf");
    return parseFillablePdf(file);
  }

  if (
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    file.type.includes("spreadsheet") ||
    file.type.includes("excel")
  ) {
    const { parseTintagelXlsx } = await import("./tintagel");
    return parseTintagelXlsx(file);
  }

  throw new Error(
    "Unsupported file. Upload a fillable 5e PDF, or the Tintagel sheet exported as .xlsx.",
  );
}
