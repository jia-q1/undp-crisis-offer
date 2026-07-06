import { useFieldArray, useFormContext } from "react-hook-form";
import { getErrorMessage } from "../form/errors";

interface RepeatableStatListProps {
  name: string;
  itemLabel: string;
  headlineExample?: string;
  detailExample?: string;
}

export function RepeatableStatList({ name, itemLabel, headlineExample, detailExample }: RepeatableStatListProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });
  const listError = getErrorMessage(errors, name);

  return (
    <div className="space-y-5">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-un-blue-dark">
              {itemLabel} {index + 1}
            </span>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-sm font-medium text-rose-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          <input
            placeholder={headlineExample ? `e.g. ${headlineExample}` : "Headline"}
            {...register(`${name}.${index}.headline` as const)}
            className="mb-3 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base font-semibold text-un-navy shadow-sm outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
          />
          <textarea
            placeholder={detailExample ? `e.g. ${detailExample}` : "Supporting detail"}
            rows={2}
            {...register(`${name}.${index}.detail` as const)}
            className="w-full resize-y rounded-lg border border-slate-300 px-3.5 py-2.5 text-base text-slate-800 shadow-sm outline-none focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
          />
        </div>
      ))}
      {listError && <p className="text-sm font-medium text-rose-600">{listError}</p>}
      <button
        type="button"
        onClick={() => append({ headline: "", detail: "" })}
        className="rounded-lg border border-dashed border-un-blue px-4 py-2.5 text-base font-medium text-un-blue-dark transition hover:bg-un-blue/5"
      >
        + Add {itemLabel.toLowerCase()}
      </button>
    </div>
  );
}
