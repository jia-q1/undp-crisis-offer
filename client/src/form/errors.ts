import type { FieldErrors } from "react-hook-form";

/** Resolves a dot/bracket path like "situation.realityCheck.0.headline" against RHF's errors tree. */
export function getErrorMessage(errors: FieldErrors, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = errors;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  if (current && typeof current === "object" && "message" in current) {
    const message = (current as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}
