/** Normalize Explora-TIC style codes: "24" → "024", "003" → "003" */
export function normalizeStudentCode(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  if (!trimmed) return "";
  if (/^\d+$/.test(trimmed)) {
    return trimmed.padStart(3, "0");
  }
  return trimmed;
}
