import type { PriceStats } from "@/types";

export function formatPrice(price: number): string {
  return `RM${price.toFixed(2)}`;
}

export function classifyPrice(
  price: number,
  stats: PriceStats
): "BARGAIN" | "FAIR" | "PRICEY" | "OVERPRICED" {
  if (price <= stats.p25_price) return "BARGAIN";
  if (price <= stats.median_price) return "FAIR";
  if (price <= stats.p75_price) return "PRICEY";
  return "OVERPRICED";
}

export function classifyColor(
  classification: "BARGAIN" | "FAIR" | "PRICEY" | "OVERPRICED"
): string {
  switch (classification) {
    case "BARGAIN":
      return "text-neon";
    case "FAIR":
      return "text-neon-dim";
    case "PRICEY":
      return "text-orange-bright";
    case "OVERPRICED":
      return "text-orange";
  }
}

export function threatLevel(
  classification: "BARGAIN" | "FAIR" | "PRICEY" | "OVERPRICED"
): string {
  switch (classification) {
    case "BARGAIN":
      return "THREAT LEVEL: LOW";
    case "FAIR":
      return "THREAT LEVEL: NORMAL";
    case "PRICEY":
      return "THREAT LEVEL: ELEVATED";
    case "OVERPRICED":
      return "THREAT LEVEL: OVERPRICED";
  }
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
