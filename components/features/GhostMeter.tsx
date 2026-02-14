"use client";

import { motion } from "framer-motion";
import type { PriceStats } from "@/types";
import { useReduceMotion } from "@/components/ReduceMotionProvider";
import { cn } from "@/lib/utils";

interface GhostMeterProps {
  stats: PriceStats;
  currentPrice?: number;
  label: string;
}

export function GhostMeter({ stats, currentPrice, label }: GhostMeterProps) {
  const { reduceMotion } = useReduceMotion();
  const { min_price, max_price, p25_price, median_price, p75_price } = stats;
  const range = max_price - min_price;

  if (range === 0) {
    return (
      <div className="font-mono text-xs text-text-muted">
        Only one price point — not enough data for analysis.
      </div>
    );
  }

  const toPercent = (price: number) =>
    Math.max(0, Math.min(100, ((price - min_price) / range) * 100));

  const currentPercent = currentPrice != null ? toPercent(currentPrice) : null;

  const verdict =
    currentPrice == null
      ? null
      : currentPrice <= p25_price
        ? "BARGAIN"
        : currentPrice <= median_price
          ? "FAIR"
          : currentPrice <= p75_price
            ? "PRICEY"
            : "OVERPRICED";

  const verdictColors: Record<string, string> = {
    BARGAIN: "text-neon",
    FAIR: "text-neon-dim",
    PRICEY: "text-orange-bright",
    OVERPRICED: "text-orange",
  };

  const verdictThreats: Record<string, string> = {
    BARGAIN: "GHOST METER: LOW THREAT",
    FAIR: "GHOST METER: NORMAL",
    PRICEY: "GHOST METER: ELEVATED",
    OVERPRICED: "GHOST METER: CRITICAL",
  };

  return (
    <div className="space-y-3" role="img" aria-label={`Price meter for ${label}`}>
      <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
        Ghost Meter
      </div>

      {/* Gauge track */}
      <div className="relative h-3 bg-surface-elevated rounded-full overflow-hidden">
        {/* IQR zone */}
        <div
          className="absolute h-full bg-neon/15"
          style={{
            left: `${toPercent(p25_price)}%`,
            width: `${toPercent(p75_price) - toPercent(p25_price)}%`,
          }}
          aria-hidden="true"
        />
        {/* Median tick */}
        <div
          className="absolute w-0.5 h-full bg-neon/50"
          style={{ left: `${toPercent(median_price)}%` }}
          aria-hidden="true"
        />
        {/* Current price marker */}
        {currentPercent !== null && (
          <motion.div
            className="absolute w-3.5 h-3.5 bg-orange rounded-full -translate-x-1/2 -top-0.5 border-2 border-background"
            style={{ left: `${currentPercent}%` }}
            initial={reduceMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[10px] font-mono text-text-muted">
        <span>RM{min_price.toFixed(2)}</span>
        <span className="text-text-secondary">
          median RM{median_price.toFixed(2)}
        </span>
        <span>RM{max_price.toFixed(2)}</span>
      </div>

      {/* Verdict */}
      {verdict && (
        <motion.div
          className={cn(
            "font-mono text-xs font-bold tracking-widest",
            verdictColors[verdict]
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          aria-live="polite"
        >
          [ {verdictThreats[verdict]} ]
        </motion.div>
      )}

      {/* Screen reader */}
      <span className="sr-only">
        Price range: RM{min_price.toFixed(2)} to RM{max_price.toFixed(2)}.
        Median: RM{median_price.toFixed(2)}.
        {currentPrice != null &&
          ` This item costs RM${currentPrice.toFixed(2)} which is ${verdict?.toLowerCase()}.`}
      </span>
    </div>
  );
}
