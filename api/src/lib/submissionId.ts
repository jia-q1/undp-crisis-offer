const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomSuffix(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
  }
  return result;
}

function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`
  );
}

/** A human-readable display ID like "BC_EL_SALVADOR_20260708175847_3GG3UQ" — for
 * showing in the confirmation email, not a replacement for the internal UUID. */
export function buildSubmissionDisplayId(country: string, submittedAt: Date): string {
  const countryPart = country
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
  return `BC_${countryPart}_${formatTimestamp(submittedAt)}_${randomSuffix(6)}`;
}
