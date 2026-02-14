import { Badge } from "@/components/ui/Badge";
import { Store } from "lucide-react";

interface MerchantBadgeProps {
  name: string;
  type?: string;
  area?: string;
}

export function MerchantBadge({ name, type, area }: MerchantBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <Store size={14} className="text-text-muted" aria-hidden="true" />
      <span className="font-mono text-sm text-text-primary">{name}</span>
      {type && type !== "unknown" && <Badge>{type}</Badge>}
      {area && <Badge variant="neon">{area}</Badge>}
    </div>
  );
}
