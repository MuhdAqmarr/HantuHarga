import { cn } from "@/lib/utils";

const STEP_LABELS = ["Capture", "Crop", "Decrypt", "Review"];

interface ProgressStepsProps {
  current: number;
  total?: number;
}

export function ProgressSteps({ current, total = 4 }: ProgressStepsProps) {
  return (
    <div className="px-4 py-3" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total} aria-label={`Step ${current} of ${total}: ${STEP_LABELS[current - 1] || ""}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === current;
          const isDone = stepNum < current;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  "h-1 w-full rounded-full transition-colors",
                  isDone
                    ? "bg-neon"
                    : isActive
                      ? "bg-neon/60"
                      : "bg-border"
                )}
              />
              <span
                className={cn(
                  "text-[9px] font-mono uppercase tracking-wider",
                  isDone || isActive ? "text-neon" : "text-text-muted"
                )}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
