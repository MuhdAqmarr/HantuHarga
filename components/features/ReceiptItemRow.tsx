"use client";

import { Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { ReviewItem } from "@/types";

interface ReceiptItemRowProps {
  item: ReviewItem;
  onUpdate: (id: string, updates: Partial<ReviewItem>) => void;
  onDelete: (id: string) => void;
}

export function ReceiptItemRow({ item, onUpdate, onDelete }: ReceiptItemRowProps) {
  const isLowConfidence = item.confidence < 0.7;

  return (
    <div
      className={cn(
        "p-3 rounded-md border space-y-2",
        isLowConfidence ? "border-orange/30 bg-orange/5" : "border-border bg-surface"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isLowConfidence && (
              <AlertTriangle size={14} className="text-orange shrink-0" aria-label="Low confidence" />
            )}
            <span className="font-mono text-[10px] text-text-muted truncate">
              {item.raw}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="h-7 w-7 inline-flex items-center justify-center rounded text-text-muted hover:text-orange transition-colors shrink-0"
          aria-label={`Delete ${item.canonical_name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Item Name"
          value={item.canonical_name}
          onChange={(e) => onUpdate(item.id, { canonical_name: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Qty"
            type="number"
            step="0.01"
            min="0"
            value={item.qty}
            onChange={(e) => onUpdate(item.id, { qty: parseFloat(e.target.value) || 1 })}
          />
          <Input
            label="Price (RM)"
            type="number"
            step="0.01"
            min="0"
            value={item.unit_price}
            onChange={(e) => onUpdate(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Badge variant={item.confidence >= 0.8 ? "neon" : item.confidence >= 0.5 ? "muted" : "orange"}>
          {Math.round(item.confidence * 100)}% confident
        </Badge>
        <span className="font-mono text-xs text-text-secondary">
          RM{((item.qty || 1) * (item.unit_price || 0)).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
