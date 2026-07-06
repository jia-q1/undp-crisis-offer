import type { ReactNode } from "react";

interface FieldShellProps {
  label: string;
  example?: string;
  error?: string;
  children: ReactNode;
}

export function FieldShell({ label, example, error, children }: FieldShellProps) {
  return (
    <div className="mb-7">
      <label className="mb-2 block text-base font-semibold text-un-navy">{label}</label>
      {children}
      {example && !error && (
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          <span className="font-medium text-slate-400">Example: </span>
          {example}
        </p>
      )}
      {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
}
