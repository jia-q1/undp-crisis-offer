import { SECTIONS } from "../form/sections";
import { firstStepIndexForSection } from "../form/steps";

interface ProgressBarProps {
  currentSectionId: string;
  percent: number;
  maxStepIndex: number;
  onSectionClick: (sectionId: string) => void;
}

export function ProgressBar({ currentSectionId, percent, maxStepIndex, onSectionClick }: ProgressBarProps) {
  const currentIndex = SECTIONS.findIndex((s) => s.id === currentSectionId);

  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-4xl px-6 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="hidden flex-wrap gap-x-5 gap-y-1.5 sm:flex">
            {SECTIONS.map((section, i) => {
              const unlocked = firstStepIndexForSection(section.id) <= maxStepIndex;
              const isCurrent = i === currentIndex;
              const colorClass = isCurrent
                ? "text-un-navy font-semibold"
                : i < currentIndex
                ? "text-un-blue-dark"
                : "text-slate-300";

              if (unlocked && !isCurrent) {
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onSectionClick(section.id)}
                    className={`text-sm font-medium transition hover:underline ${colorClass}`}
                  >
                    {section.label}
                  </button>
                );
              }
              return (
                <span key={section.id} className={`text-sm font-medium transition ${colorClass}`}>
                  {section.label}
                </span>
              );
            })}
          </div>
          <span className="text-sm font-semibold text-un-navy sm:hidden">
            {SECTIONS[currentIndex]?.label}
          </span>
          <span className="whitespace-nowrap text-sm font-semibold text-un-blue-dark">{Math.round(percent)}%</span>
        </div>
        <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-un-blue to-un-blue-dark transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
