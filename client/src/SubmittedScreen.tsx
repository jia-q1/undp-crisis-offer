interface SubmittedScreenProps {
  country: string;
  pdfUrl: string;
  emailSent: boolean;
}

export function SubmittedScreen({ country, pdfUrl, emailSent }: SubmittedScreenProps) {
  return (
    <div className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-un-blue/10">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="#0072BC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 className="mb-3 text-3xl font-bold text-un-navy">Thank you for your submission</h1>
      <p className="mb-7 text-base leading-relaxed text-slate-500">
        Your "{country} – Investing Beyond Crisis" offer has been recorded.
        {emailSent
          ? " A copy of your PDF has been emailed to you."
          : " Email delivery isn't configured yet, but your PDF is ready below."}
      </p>
      <a
        href={pdfUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg bg-un-blue px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-un-blue-dark"
      >
        View / download your PDF
      </a>
    </div>
  );
}
