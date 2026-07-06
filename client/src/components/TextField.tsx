import { useFormContext, useWatch } from "react-hook-form";
import { countWords } from "@undp-crisis-offer/shared";
import { FieldShell } from "./FieldShell";
import { getErrorMessage } from "../form/errors";

interface TextFieldProps {
  name: string;
  label: string;
  example?: string;
  placeholder?: string;
  type?: string;
}

export function TextField({ name, label, example, placeholder, type = "text" }: TextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = getErrorMessage(errors, name);

  return (
    <FieldShell label={label} example={example} error={error}>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name)}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
      />
    </FieldShell>
  );
}

interface NumberFieldProps extends Omit<TextFieldProps, "type"> {}

export function NumberField({ name, label, example, placeholder }: NumberFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = getErrorMessage(errors, name);

  return (
    <FieldShell label={label} example={example} error={error}>
      <input
        type="number"
        step="any"
        placeholder={placeholder}
        {...register(name, { valueAsNumber: true })}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps extends TextFieldProps {
  maxWords?: number;
}

export function TextAreaField({ name, label, example, placeholder, maxWords }: TextAreaFieldProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const error = getErrorMessage(errors, name);
  const value = useWatch({ control, name }) as string | undefined;
  const wordCount = countWords(value || "");
  const overLimit = maxWords != null && wordCount > maxWords;

  return (
    <FieldShell label={label} example={example} error={error}>
      <textarea
        placeholder={placeholder}
        rows={5}
        {...register(name)}
        className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-base leading-relaxed text-slate-900 shadow-sm outline-none transition focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
      />
      {maxWords != null && (
        <p className={`mt-1.5 text-right text-xs ${overLimit ? "font-semibold text-rose-600" : "text-slate-400"}`}>
          {wordCount} / {maxWords} words
        </p>
      )}
    </FieldShell>
  );
}
