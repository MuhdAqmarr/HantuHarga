"use client";

import { AREAS } from "@/types";
import { cn } from "@/lib/utils";

interface AreaSelectorProps {
  value: string;
  onChange: (area: string) => void;
  className?: string;
}

export function AreaSelector({ value, onChange, className }: AreaSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-xs font-mono text-text-secondary">
        Area
      </label>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select area">
        {AREAS.map((area) => (
          <button
            key={area}
            type="button"
            role="radio"
            aria-checked={value === area}
            onClick={() => onChange(area)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-mono border transition-colors cursor-pointer",
              value === area
                ? "bg-neon/10 text-neon border-neon/30"
                : "bg-surface text-text-muted border-border hover:border-border-bright"
            )}
          >
            {area}
          </button>
        ))}
      </div>
    </div>
  );
}
