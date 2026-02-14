import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

interface ItemCardProps {
  id: string;
  name: string;
  category: string;
  latestPrice?: number;
  medianPrice?: number;
  observationCount?: number;
}

export function ItemCard({
  id,
  name,
  category,
  latestPrice,
  medianPrice,
  observationCount,
}: ItemCardProps) {
  return (
    <Link
      href={`/item/${id}`}
      className="block p-4 border border-border rounded-lg hover:border-border-bright transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-mono text-sm text-text-primary group-hover:text-neon transition-colors truncate">
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{category}</Badge>
            {observationCount != null && (
              <span className="text-[10px] font-mono text-text-muted">
                {observationCount} reports
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          {medianPrice != null ? (
            <>
              <div className="font-mono text-sm text-neon">
                {formatPrice(medianPrice)}
              </div>
              <div className="text-[10px] font-mono text-text-muted">
                median
              </div>
            </>
          ) : latestPrice != null ? (
            <>
              <div className="font-mono text-sm text-text-primary">
                {formatPrice(latestPrice)}
              </div>
              <div className="text-[10px] font-mono text-text-muted">
                latest
              </div>
            </>
          ) : (
            <span className="text-[10px] font-mono text-text-muted">
              No data
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
