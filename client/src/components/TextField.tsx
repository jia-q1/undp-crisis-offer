import { useFormContext } from "react-hook-form";
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

export function TextAreaField({ name, label, example, placeholder }: TextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = getErrorMessage(errors, name);

  return (
    <FieldShell label={label} example={example} error={error}>
      <textarea
        placeholder={placeholder}
        rows={5}
        {...register(name)}
        className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-base leading-relaxed text-slate-900 shadow-sm outline-none transition focus:border-un-blue focus:ring-2 focus:ring-un-blue/20"
      />
    </FieldShell>
  );
}
