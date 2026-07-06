import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submissionSchema, emptySubmission, type Submission } from "@undp-crisis-offer/shared";
import { STEPS, firstStepIndexForSection } from "./form/steps";
import { SECTIONS } from "./form/sections";
import { ProgressBar } from "./components/ProgressBar";
import { ReferencePanel } from "./components/ReferencePanel";
import { hasReference } from "./form/referenceContent";
import { SubmittedScreen } from "./SubmittedScreen";
import { apiUrl, resolveApiUrl } from "./apiBase";

interface SubmitResult {
  id: string;
  fileName: string;
  pdfUrl: string;
  emailSent: boolean;
}

export function FormWizard() {
  const methods = useForm<Submission>({
    resolver: zodResolver(submissionSchema),
    defaultValues: emptySubmission,
    mode: "onSubmit",
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepIndex, setMaxStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const percent = (stepIndex / (STEPS.length - 1)) * 100;

  async function goNext() {
    const valid = step.fields.length === 0 ? true : await methods.trigger(step.fields as any);
    if (!valid) return;
    if (isLastStep) {
      await onSubmit();
    } else {
      const next = stepIndex + 1;
      setStepIndex(next);
      setMaxStepIndex((m) => Math.max(m, next));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goToSection(sectionId: string) {
    const idx = firstStepIndexForSection(sectionId);
    if (idx === -1 || idx > maxStepIndex) return;
    setStepIndex(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit() {
    const valid = await methods.trigger();
    if (!valid) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(apiUrl("/api/submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(methods.getValues()),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Submission failed (${res.status})`);
      }
      const data = (await res.json()) as SubmitResult;
      setResult(data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <SubmittedScreen
        country={methods.getValues("meta.country")}
        pdfUrl={resolveApiUrl(result.pdfUrl)}
        emailSent={result.emailSent}
      />
    );
  }

  const StepComponent = step.Component;
  const sectionLabel = SECTIONS.find((s) => s.id === step.sectionId)?.label;

  return (
    <FormProvider {...methods}>
      <ProgressBar currentSectionId={step.sectionId} percent={percent} maxStepIndex={maxStepIndex} onSectionClick={goToSection} />
      <div className="mx-auto flex max-w-7xl gap-8 px-6 pb-32 pt-10">
        <div className="min-w-0 flex-1">
          {sectionLabel && (
            <p className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-un-blue-dark">{sectionLabel}</p>
          )}
          <h1 className="mb-2 text-3xl font-bold text-un-navy">{step.heading}</h1>
          {step.helper && <p className="mb-7 text-base text-slate-500">{step.helper}</p>}
          {!step.helper && <div className="mb-7" />}
          <StepComponent />
        </div>
        <ReferencePanel stepId={step.id} />
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl gap-8 px-6 py-5">
          <div className="flex flex-1 items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={stepIndex === 0 || submitting}
              className="rounded-lg px-5 py-3 text-base font-medium text-slate-500 transition hover:text-un-navy disabled:opacity-0"
            >
              Back
            </button>
            <div className="flex items-center gap-4">
              {submitError && <span className="text-sm font-medium text-rose-600">{submitError}</span>}
              <button
                type="button"
                onClick={goNext}
                disabled={submitting}
                className="rounded-lg bg-un-blue px-7 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-un-blue-dark disabled:opacity-60"
              >
                {submitting ? "Submitting…" : isLastStep ? "Submit" : "Next"}
              </button>
            </div>
          </div>
          {hasReference(step.id) && <div className="hidden w-[320px] shrink-0 lg:block" />}
        </div>
      </div>
    </FormProvider>
  );
}
