import { pageForStep } from "../form/referencePages";

const DOC_URL = "/afg.pdf";

export function DocPagePanel({ stepId }: { stepId: string }) {
  const page = pageForStep(stepId);
  if (!page) return null;

  return (
    <aside className="hidden w-[600px] shrink-0 lg:block">
      <div className="sticky top-32 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 inline-block rounded-full bg-un-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-un-navy">
          Afghanistan example — page {page}
        </div>
        <iframe
          key={page}
          title="Afghanistan example document"
          src={`${DOC_URL}#page=${page}&navpanes=0`}
          className="h-[calc(100vh-9.5rem)] w-full rounded-lg border border-slate-100"
        />
      </div>
    </aside>
  );
}

export function hasReference(stepId: string): boolean {
  return pageForStep(stepId) !== undefined;
}
