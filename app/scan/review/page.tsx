"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ScanLayout } from "@/components/layout/ScanLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ReceiptItemRow } from "@/components/features/ReceiptItemRow";
import { AreaSelector } from "@/components/features/AreaSelector";
import { AuthModal } from "@/components/features/AuthModal";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/browser";
import { Send, Plus } from "lucide-react";
import { VerifiedStamp } from "@/components/scan/VerifiedStamp";
import { toast } from "sonner";
import type { ReviewItem, ExtractionResult } from "@/types";
import { generateId } from "@/lib/utils";

export default function ReviewPage() {
  const router = useRouter();
  const [extraction, setExtraction] = useState<
    (ExtractionResult & { temp_image_path?: string }) | null
  >(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [merchantName, setMerchantName] = useState("");
  const [merchantType, setMerchantType] = useState("unknown");
  const [receiptDate, setReceiptDate] = useState("");
  const [area, setArea] = useState("Kuala Lumpur");
  const [grandTotal, setGrandTotal] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("hh-extraction");
    if (!stored) {
      router.replace("/scan");
      return;
    }

    try {
      const data = JSON.parse(stored);
      setExtraction(data);
      setMerchantName(data.merchant?.name || "");
      setMerchantType(data.merchant?.type || "unknown");
      setReceiptDate(data.receipt_date || "");
      setGrandTotal(data.totals?.grand_total || null);

      // Convert extraction items to review items, sorted by confidence (low first)
      const reviewItems: ReviewItem[] = (data.items || [])
        .map((item: ReviewItem) => ({
          ...item,
          id: generateId(),
          confirmed: true,
        }))
        .sort(
          (a: ReviewItem, b: ReviewItem) => a.confidence - b.confidence
        );

      setItems(reviewItems);
    } catch {
      router.replace("/scan");
    }
  }, [router]);

  const handleUpdateItem = useCallback(
    (id: string, updates: Partial<ReviewItem>) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      );
    },
    []
  );

  const handleDeleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleAddItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        id: generateId(),
        raw: "",
        canonical_name: "",
        category: "other",
        qty: 1,
        unit_price: 0,
        line_total: null,
        confidence: 1,
        confirmed: true,
      },
    ]);
  }, []);

  const handleSubmit = useCallback(async () => {
    // Check auth
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!merchantName.trim()) {
      toast.error("Merchant name is required");
      return;
    }

    if (items.length === 0) {
      toast.error("At least one item is required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/receipt/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temp_image_path: extraction?.temp_image_path || "",
          merchant_name: merchantName.trim(),
          merchant_type: merchantType,
          area,
          receipt_date: receiptDate || null,
          grand_total: grandTotal,
          items: items.map((item) => ({
            raw: item.raw || item.canonical_name,
            canonical_name: item.canonical_name,
            category: item.category,
            qty: item.qty,
            unit_price: item.unit_price,
            line_total: item.qty * item.unit_price,
            confidence: item.confidence,
            confirmed: item.confirmed,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Submission failed");
      }

      const result = await response.json();

      // Clean up session storage
      sessionStorage.removeItem("hh-pending-image");
      sessionStorage.removeItem("hh-cropped-image");
      sessionStorage.removeItem("hh-extraction");

      setSubmitted(true);
      toast.success(
        `Intel submitted! ${result.price_points_created} price points added.`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Submission failed"
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    merchantName,
    merchantType,
    area,
    receiptDate,
    grandTotal,
    items,
    extraction,
  ]);

  if (submitted) {
    return (
      <ScanLayout title="INTEL SUBMITTED" step={4}>
        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
          <VerifiedStamp text="VERIFIED INTEL" />
          <p className="text-text-secondary text-sm max-w-xs text-center">
            Your receipt data has been added to the community price database.
            Thank you for your contribution!
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => router.push("/search")}>
              Browse Prices
            </Button>
            <Button variant="neon" onClick={() => router.push("/scan")}>
              Scan Another
            </Button>
          </div>
        </div>
      </ScanLayout>
    );
  }

  if (!extraction) {
    return (
      <ScanLayout title="REVIEW" step={4}>
        <div className="flex-1 flex items-center justify-center">
          <div className="font-mono text-sm text-text-muted">Loading...</div>
        </div>
      </ScanLayout>
    );
  }

  const calculatedTotal = items.reduce(
    (sum, item) => sum + item.qty * item.unit_price,
    0
  );

  return (
    <>
      <ScanLayout title="REVIEW INTEL" step={4}>
        <div className="flex-1 overflow-auto px-4 pb-32 space-y-4 pt-2">
          {/* Merchant info */}
          <Card>
            <div className="space-y-3">
              <Input
                label="Merchant Name"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. 99 Speedmart"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Receipt Date"
                  type="date"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                />
                <Input
                  label="Grand Total (RM)"
                  type="number"
                  step="0.01"
                  value={grandTotal ?? ""}
                  onChange={(e) =>
                    setGrandTotal(
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                />
              </div>
              <AreaSelector value={area} onChange={setArea} />
            </div>
          </Card>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                Extracted Items ({items.length})
              </div>
              <Button variant="ghost" size="sm" onClick={handleAddItem}>
                <Plus size={12} aria-hidden="true" />
                Add Item
              </Button>
            </div>

            {items.some((i) => i.confidence < 0.7) && (
              <div className="mb-2 p-2 rounded bg-orange/5 border border-orange/20">
                <p className="text-[10px] font-mono text-orange-bright">
                  Items with low confidence are shown first. Please verify them.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {items.map((item) => (
                <ReceiptItemRow
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </div>

          {/* Summary */}
          <Card glow>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-text-secondary">
                Calculated Total
              </span>
              <span className="font-mono text-lg text-neon">
                RM{calculatedTotal.toFixed(2)}
              </span>
            </div>
            {grandTotal && Math.abs(calculatedTotal - grandTotal) > 0.5 && (
              <div className="mt-1">
                <Badge variant="orange">
                  Differs from receipt total by RM
                  {Math.abs(calculatedTotal - grandTotal).toFixed(2)}
                </Badge>
              </div>
            )}
          </Card>
        </div>

        {/* Fixed bottom bar */}
        <div className="fixed bottom-0 inset-x-0 p-4 bg-background/90 backdrop-blur-sm border-t border-border">
          <Button
            variant="neon"
            size="lg"
            className="w-full max-w-lg mx-auto"
            onClick={handleSubmit}
            loading={submitting}
          >
            <Send size={16} aria-hidden="true" />
            Submit Intel
          </Button>
        </div>
      </ScanLayout>

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        redirectTo="/scan/review"
      />
    </>
  );
}
