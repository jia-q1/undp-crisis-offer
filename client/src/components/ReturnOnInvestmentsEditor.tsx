import { useFieldArray, useFormContext } from "react-hook-form";
import { getErrorMessage } from "../form/errors";

const BASE = "returnOnInvestment.outcomeGroups";

export function ReturnOnInvestmentsEditor() {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: BASE });
  const listError = getErrorMessage(errors, BASE);

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <ReturnOnInvestmentItem key={field.id} index={index} onRemove={fields.length > 1 ? () => remove(index) : undefined} />
      ))}
      {listError && <p className="text-sm font-medium text-rose-600">{listError}</p>}
      <button
        type="button"
        onClick={() => append({ title: "", points: "" })}
        className="rounded-lg border border-dashed border-un-blue px-4 py-2.5 text-base font-medium text-un-blue-dark transition hover:bg-un-blue/5"
      >
        + Further Return on Investments
      </button>
    </div>
  );
}

function ReturnOnInvestmentItem({ index, onRemove }: { index: number; onRemove?: () => void }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const groupBase = `${BASE}.${index}`;
  const titleError = getErrorMessage(errors, `${groupBase}.title`);
  const pointsError = getErrorMessage(errors, `${groupBase}.points`);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-wide text-un-blue-dark">Return on investment {index + 1}</span>
        {onRemove && (
          <button type="button" onClick={onRemove} className="text-sm font-medium text-rose-600 hover:underline">
            Remove
          </button>
        )}
      </div>
      <input
        placeholder="e.g. More resilient communities and local systems"
        {...register(`${groupBase}.title` as const)}
        className="mb-3 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base font-semibold text-un-navy shadow-sm outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
      />
      {titleError && <p className="mb-3 text-sm font-medium text-rose-600">{titleError}</p>}
      <textarea
        placeholder="e.g. Around 2 million people will gain improved access to essential services. US$145 million will help create or sustain 100,000 jobs, strengthen 25,000 MSMEs..."
        rows={4}
        {...register(`${groupBase}.points` as const)}
        className="w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-800 shadow-sm outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
      />
      {pointsError && <p className="mt-2 text-sm font-medium text-rose-600">{pointsError}</p>}
    </div>
  );
}
