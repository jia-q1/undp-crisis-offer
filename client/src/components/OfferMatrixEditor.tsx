import { useFormContext } from "react-hook-form";
import { OFFER_MATRIX } from "@undp-crisis-offer/shared";
import { getErrorMessage } from "../form/errors";

export function OfferMatrixEditor() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {OFFER_MATRIX.map((cell, index) => {
        const base = `offer.blocks.${index}`;
        const taglineError = getErrorMessage(errors, `${base}.tagline`);
        const descError = getErrorMessage(errors, `${base}.description`);
        return (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-block rounded-full bg-un-navy/5 px-3 py-1 text-sm font-semibold text-un-navy">
              {cell.phase}
            </div>
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-un-blue-dark">{cell.pillar}</p>
            <input
              placeholder="Short tagline, e.g. Essential systems that keep services running"
              {...register(`${base}.tagline` as const)}
              className="mb-3 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base font-semibold text-un-navy shadow-sm outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
            />
            {taglineError && <p className="mb-3 text-sm font-medium text-rose-600">{taglineError}</p>}
            <textarea
              placeholder="Describe what UNDP will do in this component"
              rows={4}
              {...register(`${base}.description` as const)}
              className="w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-800 shadow-sm outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
            />
            {descError && <p className="mt-2 text-sm font-medium text-rose-600">{descError}</p>}
          </div>
        );
      })}
    </div>
  );
}
