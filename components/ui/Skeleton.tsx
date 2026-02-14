import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-elevated rounded-md",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="p-4 border border-border rounded-lg space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function PriceStatsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
