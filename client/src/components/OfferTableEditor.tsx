import { useFormContext, useWatch } from "react-hook-form";
import { OFFER_ROWS } from "@undp-crisis-offer/shared";
import { getErrorMessage } from "../form/errors";

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

  // Each offer column becomes a row of the investment allocation table, split
  // per OFFER_ROWS context — so investment.rows must stay in lockstep here.
  function addColumn() {
    const currentColumns = getValues("offer.columnLabels") as string[];
    const newColIndex = currentColumns.length;
    const numColumns = newColIndex + 1;
    setValue("offer.columnLabels", [...currentColumns, ""]);

    OFFER_ROWS.forEach((_, contextIdx) => {
      const path = `offer.rows.${contextIdx}` as const;
      const currentRow = getValues(path) as string[];
      setValue(path, [...currentRow, ""]);
    });

    const periodCount = (getValues("investment.periodLabels") as string[] | undefined)?.length ?? 4;
    const currentInvestmentRows = getValues("investment.rows") as number[][];
    const updatedInvestmentRows = [...currentInvestmentRows];
    OFFER_ROWS.forEach((_, contextIdx) => {
      updatedInvestmentRows.splice(contextIdx * numColumns + newColIndex, 0, Array(periodCount).fill(0));
    });
    setValue("investment.rows", updatedInvestmentRows);
  }

  function removeColumn(colIndex: number) {
    const currentColumns = getValues("offer.columnLabels") as string[];
    const numColumnsBefore = currentColumns.length;
    setValue("offer.columnLabels", currentColumns.filter((_, i) => i !== colIndex));

    OFFER_ROWS.forEach((_, contextIdx) => {
      const path = `offer.rows.${contextIdx}` as const;
      const currentRow = getValues(path) as string[];
      setValue(path, currentRow.filter((_, i) => i !== colIndex));
    });

    const currentInvestmentRows = getValues("investment.rows") as number[][];
    const updatedInvestmentRows = [...currentInvestmentRows];
    for (let contextIdx = OFFER_ROWS.length - 1; contextIdx >= 0; contextIdx--) {
      updatedInvestmentRows.splice(contextIdx * numColumnsBefore + colIndex, 1);
    }
    setValue("investment.rows", updatedInvestmentRows);
  }

  return (
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
                    placeholder={`Column ${colIdx + 1}`}
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
                      placeholder="Describe what UNDP will do here"
                      {...register(`offer.rows.${rowIdx}.${colIdx}` as const)}
                      className="w-48 resize-y rounded border border-slate-300 px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
                    />
                    {cellError && <p className="mt-1 text-xs font-medium text-rose-600">{cellError}</p>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {columnsError && <p className="px-4 pb-2 text-sm font-medium text-rose-600">{columnsError}</p>}
      <div className="border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={addColumn}
          className="rounded-lg border border-dashed border-un-blue px-4 py-2.5 text-base font-medium text-un-blue-dark transition hover:bg-un-blue/5"
        >
          + Add column
        </button>
      </div>
    </div>
  );
}
