import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { INVESTMENT_PERIODS, OFFER_ROWS, computeInvestmentTotals, offerRowTotal, type Submission } from "@undp-crisis-offer/shared";
import { getErrorMessage } from "../form/errors";

const COLUMN_COUNT = 1 + INVESTMENT_PERIODS.length + 1 + 1; // component + periods + total + remove

function GroupRows({ groupIndex, label, syncedCount }: { groupIndex: number; label: string; syncedCount: number }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<Submission>();
  const { fields, append, remove } = useFieldArray({ control, name: `investment.rows.${groupIndex}` as any });
  const offers = useWatch({ control, name: `investment.rows.${groupIndex}` as any }) as Submission["investment"]["rows"][number] | undefined;
  const listError = getErrorMessage(errors, `investment.rows.${groupIndex}`);

  return (
    <>
      {fields.map((field, rowIdx) => {
        const base = `investment.rows.${groupIndex}.${rowIdx}` as const;
        const labelError = getErrorMessage(errors, `${base}.label`);
        const rowTotal = offers?.[rowIdx] ? offerRowTotal(offers[rowIdx]) : 0;
        const isSynced = rowIdx < syncedCount;
        return (
          <tr key={field.id} className="border-b border-slate-100">
            <td className="p-2.5 align-top">
              <div className="text-sm font-semibold text-slate-700">{label}</div>
              {isSynced ? (
                <div className="mt-1 text-sm text-slate-400">{offers?.[rowIdx]?.label || "—"}</div>
              ) : (
                <>
                  <input
                    placeholder="Name this offer"
                    {...register(`${base}.label` as any)}
                    className="mt-1 w-48 rounded border border-slate-300 px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
                  />
                  {labelError && <p className="mt-1 text-xs font-medium text-rose-600">{labelError}</p>}
                </>
              )}
            </td>
            {[0, 1, 2, 3].map((periodIdx) => (
              <td key={periodIdx} className="p-2.5 text-center">
                <input
                  type="number"
                  step="any"
                  {...register(`${base}.amounts.${periodIdx}` as any, { valueAsNumber: true })}
                  className="w-20 rounded border border-slate-300 px-2 py-2 text-center text-sm outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
                />
              </td>
            ))}
            <td className="p-2.5 text-center font-semibold text-un-navy">
              US${Number.isFinite(rowTotal) ? rowTotal : 0}m
            </td>
            <td className="p-2.5 text-center">
              {!isSynced && (
                <button
                  type="button"
                  onClick={() => remove(rowIdx)}
                  className="text-sm font-medium text-rose-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </td>
          </tr>
        );
      })}
      <tr className="border-b border-slate-100 bg-slate-50/60">
        <td colSpan={COLUMN_COUNT} className="p-2.5">
          <button
            type="button"
            onClick={() => append({ label: "", amounts: [0, 0, 0, 0] })}
            className="rounded-lg border border-dashed border-un-blue px-3 py-1.5 text-sm font-medium text-un-blue-dark transition hover:bg-un-blue/5"
          >
            + Add offer
          </button>
          {listError && <p className="mt-1 text-xs font-medium text-rose-600">{listError}</p>}
        </td>
      </tr>
    </>
  );
}

export function InvestmentTableEditor() {
  const { control } = useFormContext<Submission>();
  const investment = useWatch({ control, name: "investment" });
  const columnLabels = useWatch({ control, name: "offer.columnLabels" }) ?? [];
  const { periodTotals, grandTotal } = computeInvestmentTotals(investment);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] border-collapse text-base">
        <thead>
          <tr className="bg-un-blue-dark text-white">
            <th className="p-3 text-left font-semibold">Operational component</th>
            {INVESTMENT_PERIODS.map((period) => (
              <th key={period} className="p-3 font-semibold">{period}</th>
            ))}
            <th className="p-3 font-semibold">Total</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {OFFER_ROWS.map((label, groupIndex) => (
            <GroupRows key={label} groupIndex={groupIndex} label={label} syncedCount={columnLabels.length} />
          ))}
          <tr className="bg-slate-50 font-semibold text-un-navy">
            <td className="p-3">Total</td>
            {periodTotals.map((total, i) => (
              <td key={i} className="p-2.5 text-center">
                US${Number.isFinite(total) ? total : 0}m
              </td>
            ))}
            <td className="p-2.5 text-center">US${Number.isFinite(grandTotal) ? grandTotal : 0}m</td>
            <td />
          </tr>
        </tbody>
      </table>
      <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-400">
        Rows in gray come from the columns you named in "The offer" step. Use "+ Add offer" to add anything extra.
      </p>
    </div>
  );
}
