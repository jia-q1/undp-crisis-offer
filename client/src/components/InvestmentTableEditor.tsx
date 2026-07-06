import { useFormContext, useWatch } from "react-hook-form";
import { OFFER_MATRIX, computeInvestmentTotals, type Submission } from "@undp-crisis-offer/shared";

export function InvestmentTableEditor() {
  const { register, control } = useFormContext<Submission>();
  const investment = useWatch({ control, name: "investment" });
  const { rowTotals, columnTotals, grandTotal } = computeInvestmentTotals(investment);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] border-collapse text-base">
        <thead>
          <tr className="bg-un-blue-dark text-white">
            <th className="p-4 text-left font-semibold">Operational component</th>
            {[0, 1, 2, 3].map((i) => (
              <th key={i} className="p-2.5">
                <input
                  {...register(`investment.periodLabels.${i}` as any)}
                  placeholder={`Period ${i + 1}`}
                  className="w-28 rounded border border-white/30 bg-white/10 px-2.5 py-1.5 text-center text-white placeholder-white/60 outline-none focus:bg-white/20"
                />
              </th>
            ))}
            <th className="p-4 font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {OFFER_MATRIX.map((cell, rowIdx) => (
            <tr key={rowIdx} className="border-b border-slate-100 last:border-0">
              <td className="p-4 text-sm font-medium text-slate-700">
                {cell.phase}
                <br />
                <span className="text-slate-400">{cell.pillar}</span>
              </td>
              {[0, 1, 2, 3].map((colIdx) => (
                <td key={colIdx} className="p-2.5 text-center">
                  <input
                    type="number"
                    step="any"
                    {...register(`investment.rows.${rowIdx}.${colIdx}` as any, { valueAsNumber: true })}
                    className="w-24 rounded border border-slate-300 px-2.5 py-2 text-center text-base outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
                  />
                </td>
              ))}
              <td className="p-2.5 text-center font-semibold text-un-navy">
                US${Number.isFinite(rowTotals[rowIdx]) ? rowTotals[rowIdx] : 0}m
              </td>
            </tr>
          ))}
          <tr className="bg-slate-50 font-semibold text-un-navy">
            <td className="p-4">Total</td>
            {columnTotals.map((total, i) => (
              <td key={i} className="p-2.5 text-center">
                US${Number.isFinite(total) ? total : 0}m
              </td>
            ))}
            <td className="p-2.5 text-center">US${Number.isFinite(grandTotal) ? grandTotal : 0}m</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
