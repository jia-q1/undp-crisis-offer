import { SECTIONS } from "../form/sections";
import { firstStepIndexForSection } from "../form/steps";
import undpLogo from "../assets/undp_logo.png";

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
      <div className="mx-auto max-w-7xl px-6 pt-4">
        <div className="mb-3 flex items-center gap-6">
          <img src={undpLogo} alt="UNDP" className="h-9 w-auto shrink-0" />
          <div className="hidden flex-1 flex-nowrap items-center gap-x-4 overflow-x-auto sm:flex">
            {SECTIONS.map((section, i) => {
              const unlocked = firstStepIndexForSection(section.id) <= maxStepIndex;
              const isCurrent = i === currentIndex;
              const colorClass = isCurrent
                ? "text-un-navy font-bold border-un-navy"
                : i < currentIndex
                ? "text-un-blue-dark font-semibold border-un-blue-dark"
                : "text-slate-500 font-medium border-slate-300";

              if (unlocked && !isCurrent) {
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onSectionClick(section.id)}
                    className={`whitespace-nowrap border-b-2 pb-1.5 text-base transition hover:border-un-navy hover:text-un-navy ${colorClass}`}
                  >
                    {section.label}
                  </button>
                );
              }
              return (
                <span key={section.id} className={`whitespace-nowrap border-b-2 pb-1.5 text-base transition ${colorClass}`}>
                  {section.label}
                </span>
              );
            })}
          </div>
          <span className="text-base font-bold text-un-navy sm:hidden">
            {SECTIONS[currentIndex]?.label}
          </span>
          <span className="shrink-0 whitespace-nowrap text-base font-bold text-un-blue-dark">{Math.round(percent)}%</span>
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
