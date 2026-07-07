import { useFormContext, useWatch } from "react-hook-form";
import { INVESTMENT_PERIODS, OFFER_ROWS, computeInvestmentTotals, offerRowTotal, type Submission } from "@undp-crisis-offer/shared";

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-un-navy">{title}</h3>
      <div className="space-y-2 text-base leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}

export function ReviewStep() {
  const { control } = useFormContext<Submission>();
  const values = useWatch({ control });
  const submission = values as Submission;
  const { periodTotals, grandTotal } = computeInvestmentTotals(submission.investment);

  return (
    <div>
      <p className="mb-5 text-base text-slate-500">
        Check everything below before submitting. You can use "Back" to fix anything.
      </p>

      <ReviewSection title={`${submission.meta.country || "—"} — Investing Beyond Crisis`}>
        <p>
          Submitted by {submission.meta.submittedByName || "—"}, {submission.meta.submittedByRole || "—"} (
          {submission.meta.submittedByEmail || "—"})
        </p>
      </ReviewSection>

      <ReviewSection title="Situation on the ground">
        <p className="whitespace-pre-wrap">{submission.situation?.challenge}</p>
        <p className="mt-3 font-medium text-un-blue-dark">At a glance</p>
        <ul className="list-disc space-y-1 pl-5">
          {submission.situation?.realityCheck?.map((s, i) => (
            <li key={i}>
              <strong>{s.headline}</strong> {s.detail}
            </li>
          ))}
        </ul>
        <p className="mt-3 font-medium text-un-blue-dark">Results</p>
        <ul className="list-disc space-y-1 pl-5">
          {submission.situation?.results?.map((s, i) => (
            <li key={i}>
              <strong>{s.headline}</strong> {s.detail}
            </li>
          ))}
        </ul>
      </ReviewSection>

      <ReviewSection title="UNDP's advantage">
        <p className="whitespace-pre-wrap">{submission.advantage?.narrative}</p>
      </ReviewSection>

      <ReviewSection title="The offer">
        <p className="whitespace-pre-wrap">{submission.offer?.intro}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2.5 text-left">Context</th>
                {submission.offer?.columnLabels?.map((label, i) => (
                  <th key={i} className="p-2.5 text-left">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OFFER_ROWS.map((label, rowIdx) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="p-2.5 font-medium text-un-navy">{label}</td>
                  {submission.offer?.rows?.[rowIdx]?.map((cell, colIdx) => (
                    <td key={colIdx} className="p-2.5 whitespace-pre-wrap">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReviewSection>

      <ReviewSection title="Indicative investment allocation">
        <div className="mt-1.5 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2.5 text-left">Operational component</th>
                {INVESTMENT_PERIODS.map((period) => (
                  <th key={period} className="p-2.5">{period}</th>
                ))}
                <th className="p-2.5">Total</th>
              </tr>
            </thead>
            <tbody>
              {OFFER_ROWS.map((label, groupIndex) =>
                submission.investment?.rows?.[groupIndex]?.map((offer, i) => (
                  <tr key={`${groupIndex}-${i}`} className="border-b border-slate-100">
                    <td className="p-2.5">
                      {label}
                      {offer.label ? `: ${offer.label}` : ""}
                    </td>
                    {offer.amounts.map((v, j) => (
                      <td key={j} className="p-2.5 text-center">US${v || 0}m</td>
                    ))}
                    <td className="p-2.5 text-center font-semibold">US${offerRowTotal(offer)}m</td>
                  </tr>
                ))
              )}
              <tr className="font-semibold text-un-navy">
                <td className="p-2.5">Total</td>
                {periodTotals.map((total, i) => (
                  <td key={i} className="p-2.5 text-center">US${total}m</td>
                ))}
                <td className="p-2.5 text-center">US${grandTotal}m</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ReviewSection>

      <ReviewSection title="Return on investment">
        <p className="whitespace-pre-wrap">{submission.returnOnInvestment?.overallImpact}</p>
        {submission.returnOnInvestment?.outcomeGroups?.map((group, i) => (
          <div key={i} className="mt-3">
            <p className="font-medium text-un-blue-dark">{group.title}</p>
            <p className="whitespace-pre-wrap">{group.points}</p>
          </div>
        ))}
      </ReviewSection>

      <ReviewSection title="Contact">
        <p>
          {submission.contact?.name} — {submission.contact?.email}
          {submission.contact?.link ? ` — ${submission.contact.link}` : ""}
        </p>
      </ReviewSection>
    </div>
  );
}
