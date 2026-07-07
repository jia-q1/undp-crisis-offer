import { useFormContext, useWatch } from "react-hook-form";
import { OFFER_ROWS } from "@undp-crisis-offer/shared";
import { getErrorMessage } from "../form/errors";

const COLUMN_LABEL_EXAMPLES = [
  "Essential services, infrastructure and local systems",
  "Livelihoods, jobs and local economies",
];

const FIRST_ROW_CELL_EXAMPLES = [
  `Essential systems that keep services running and infrastructure standing when shocks hit. UNDP acts early to keep essential services from failing. This includes: fixing and maintaining water and irrigation systems...`,
  `Stronger jobs and businesses that bounce back, keeping economies stable through crises. UNDP helps people hold on to their livelihoods before shocks harden into deeper irreversible povert...`,
];

export function OfferTableEditor() {
  const {
    register,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext();

  const columnLabels: string[] = useWatch({ control, name: "offer.columnLabels" }) ?? [];
  const offerRows: string[][] = useWatch({ control, name: "offer.rows" }) ?? [[], [], []];

  const columnsError = getErrorMessage(errors, "offer.columnLabels");

  function addColumn() {
    const currentColumns = getValues("offer.columnLabels") as string[];
    setValue("offer.columnLabels", [...currentColumns, ""]);

    OFFER_ROWS.forEach((_, contextIdx) => {
      const path = `offer.rows.${contextIdx}` as const;
      const currentRow = getValues(path) as string[];
      setValue(path, [...currentRow, ""]);
    });
  }

  function removeColumn(colIndex: number) {
    const currentColumns = getValues("offer.columnLabels") as string[];
    setValue("offer.columnLabels", currentColumns.filter((_, i) => i !== colIndex));

    OFFER_ROWS.forEach((_, contextIdx) => {
      const path = `offer.rows.${contextIdx}` as const;
      const currentRow = getValues(path) as string[];
      setValue(path, currentRow.filter((_, i) => i !== colIndex));
    });
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-un-blue-dark">
        Name every column below (e.g. "Essential services", "Livelihoods and jobs") before continuing — you won't be able to move on until each one has a name.
      </p>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] border-collapse text-base">
          <thead>
            <tr className="bg-un-blue-dark text-white">
              <th className="p-4 text-left font-semibold">Context</th>
              {columnLabels.map((_, colIdx) => (
                <th key={colIdx} className="p-2.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <input
                      {...register(`offer.columnLabels.${colIdx}` as const)}
                      placeholder={COLUMN_LABEL_EXAMPLES[colIdx] ?? `Column ${colIdx + 1}`}
                      className="w-40 rounded border border-white/30 bg-white/10 px-2.5 py-1.5 text-center text-white placeholder-white/60 outline-none focus:bg-white/20"
                    />
                    {columnLabels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumn(colIdx)}
                        className="text-lg leading-none text-white/70 transition hover:text-white"
                        aria-label={`Remove column ${colIdx + 1}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-2.5">
                <button
                  type="button"
                  onClick={addColumn}
                  className="whitespace-nowrap rounded-lg border border-dashed border-white/50 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  + Add column
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {OFFER_ROWS.map((label, rowIdx) => (
              <tr key={label} className="border-b border-slate-100 last:border-0">
                <td className="p-4 text-sm font-medium text-slate-700">{label}</td>
                {(offerRows[rowIdx] ?? []).map((_, colIdx) => {
                  const cellError = getErrorMessage(errors, `offer.rows.${rowIdx}.${colIdx}`);
                  return (
                    <td key={colIdx} className="p-2.5 align-top">
                      <textarea
                        rows={3}
                        placeholder={
                          rowIdx === 0 ? FIRST_ROW_CELL_EXAMPLES[colIdx] ?? "Describe what UNDP will do here" : "Describe what UNDP will do here"
                        }
                        {...register(`offer.rows.${rowIdx}.${colIdx}` as const)}
                        className="w-48 resize-y rounded border border-slate-300 px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
                      />
                      {cellError && <p className="mt-1 text-xs font-medium text-rose-600">{cellError}</p>}
                    </td>
                  );
                })}
                <td />
              </tr>
            ))}
          </tbody>
        </table>
        {columnsError && <p className="px-4 py-2 text-sm font-medium text-rose-600">{columnsError}</p>}
      </div>
    </div>
  );
}
