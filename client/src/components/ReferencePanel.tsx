import { REFERENCE_CONTENT, type RefBlock } from "../form/referenceContent";

function Block({ block }: { block: RefBlock }) {
  if (block.type === "paragraph") {
    return <p className="mb-3 text-sm leading-relaxed text-slate-600">{block.text}</p>;
  }
  if (block.type === "bullets") {
    return (
      <ul className="mb-3 space-y-2">
        {block.items.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed text-slate-600">
            {item.headline && <span className="font-semibold text-slate-700">{item.headline} </span>}
            {item.detail}
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "table") {
    return (
      <div className="mb-3 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100">
              {block.headers.map((h, i) => (
                <th key={i} className="p-1.5 text-left font-semibold text-slate-600">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className="border-t border-slate-100">
                {row.map((cell, j) => (
                  <td key={j} className="p-1.5 text-slate-600">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  // offerBlocks
  return (
    <div className="mb-3 space-y-3">
      {block.items.map((item, i) => (
        <div key={i} className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-un-blue-dark">{item.label}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{item.tagline}</p>
          <p className="mt-1 text-sm text-slate-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export function ReferencePanel({ stepId }: { stepId: string }) {
  const entry = REFERENCE_CONTENT[stepId];
  if (!entry) return null;

  return (
    <aside className="hidden w-[320px] shrink-0 lg:block">
      <div className="sticky top-32 max-h-[calc(100vh-9.5rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 inline-block rounded-full bg-un-navy/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-un-navy">
          Afghanistan example
        </div>
        <p className="mb-3 text-sm font-semibold text-un-navy">{entry.title}</p>
        {entry.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    </aside>
  );
}
