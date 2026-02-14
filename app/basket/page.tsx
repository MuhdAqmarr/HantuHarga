"use client";

import { useState, useCallback, useEffect } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { AreaSelector } from "@/components/features/AreaSelector";
import {
  ShoppingBasket,
  TrendingDown,
  Store,
  Trophy,
  Loader2,
  Plus,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/browser";

interface TemplateItem {
  canonical_name: string;
  qty: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  items: TemplateItem[];
  is_default: boolean;
  user_id: string | null;
}

interface MerchantResult {
  merchant_id: string;
  merchant_name: string;
  merchant_type: string;
  area: string;
  items_found: number;
  items_total: number;
  basket_total: number;
  item_prices: { name: string; price: number }[];
}

export default function BasketPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [area, setArea] = useState("Kuala Lumpur");
  const [merchants, setMerchants] = useState<MerchantResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [unmatchedItems, setUnmatchedItems] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch templates + user on mount
  useEffect(() => {
    async function init() {
      const [templatesRes] = await Promise.all([
        fetch("/api/basket/templates"),
      ]);
      const { templates: data } = await templatesRes.json();
      setTemplates(data || []);
      setLoadingTemplates(false);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    }
    init();
  }, []);

  const handleCompare = useCallback(
    async (template: Template) => {
      setSelectedTemplate(template);
      setLoading(true);
      setHasSearched(true);
      setMerchants([]);
      setUnmatchedItems([]);

      try {
        const itemNames = template.items.map((i) => i.canonical_name);
        const params = new URLSearchParams({
          items: itemNames.join(","),
          area,
        });

        const res = await fetch(`/api/basket/compare?${params}`);
        if (!res.ok) throw new Error("Failed to fetch comparison");

        const data = await res.json();
        setMerchants(data.merchants || []);
        setUnmatchedItems(data.unmatched_items || []);
      } catch (err) {
        console.error("Basket comparison error:", err);
      } finally {
        setLoading(false);
      }
    },
    [area]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this template?")) return;

      const res = await fetch(`/api/basket/templates/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        if (selectedTemplate?.id === id) {
          setSelectedTemplate(null);
          setMerchants([]);
          setHasSearched(false);
        }
      }
    },
    [selectedTemplate]
  );

  const handleCreated = useCallback((template: Template) => {
    setTemplates((prev) => [...prev, template]);
    setShowCreate(false);
  }, []);

  const cheapestTotal =
    merchants.length > 0
      ? Math.min(...merchants.map((m) => m.basket_total))
      : 0;

  return (
    <>
      <TopBar title="BASKET ESTIMATOR" />
      <PageContainer className="space-y-6 pt-4 pb-32">
        <div>
          <h2 className="font-mono text-sm text-text-primary">
            Compare basket costs across merchants
          </h2>
          <p className="text-text-secondary text-xs mt-1">
            Select a basket template to estimate your grocery spending.
          </p>
        </div>

        <AreaSelector value={area} onChange={setArea} />

        {/* Templates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
              Basket Templates
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={12} aria-hidden="true" />
              Create
            </Button>
          </div>

          {loadingTemplates ? (
            <Card>
              <div className="flex items-center justify-center gap-2 py-6">
                <Loader2
                  size={16}
                  className="text-neon animate-spin"
                  aria-hidden="true"
                />
                <span className="font-mono text-xs text-text-muted">
                  Loading templates...
                </span>
              </div>
            </Card>
          ) : (
            templates.map((template) => (
              <Card
                key={template.id}
                glow={selectedTemplate?.id === template.id}
                className="cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <button
                    className="flex-1 text-left"
                    onClick={() => handleCompare(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShoppingBasket
                            size={14}
                            className="text-neon"
                            aria-hidden="true"
                          />
                          <h3 className="font-mono text-sm text-text-primary">
                            {template.name}
                          </h3>
                        </div>
                        <p className="text-text-secondary text-xs mt-1 ml-6">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2 ml-6">
                          {template.items.slice(0, 4).map((item, i) => (
                            <Badge key={i} variant="muted">
                              {item.canonical_name.split(" ")[0]}
                            </Badge>
                          ))}
                          {template.items.length > 4 && (
                            <Badge variant="muted">
                              +{template.items.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {template.is_default && (
                          <Badge variant="muted">DEFAULT</Badge>
                        )}
                        <Badge
                          variant={
                            selectedTemplate?.id === template.id
                              ? "neon"
                              : "muted"
                          }
                        >
                          {template.items.length} items
                        </Badge>
                      </div>
                    </div>
                  </button>

                  {/* Delete button — only for user's own non-default */}
                  {!template.is_default &&
                    currentUserId &&
                    template.user_id === currentUserId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(template.id);
                        }}
                        className="p-1.5 text-text-muted hover:text-red transition-colors shrink-0 mt-0.5"
                        aria-label="Delete template"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Comparison results */}
        {selectedTemplate && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingDown
                size={14}
                className="text-neon"
                aria-hidden="true"
              />
              <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                Price Comparison — {selectedTemplate.name}
              </div>
            </div>

            {/* Unmatched items warning — shown before comparison */}
            {!loading && unmatchedItems.length > 0 && (
              <Card>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={14}
                      className="text-orange-bright shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-mono text-[10px] text-orange-bright uppercase tracking-wider">
                      {unmatchedItems.length} item{unmatchedItems.length > 1 ? 's' : ''} not found
                    </span>
                  </div>
                  <div className="space-y-1 ml-6">
                    {unmatchedItems.map((name, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[11px] text-text-muted">
                          {name}
                        </span>
                        <Badge variant="orange">NO DATA</Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-muted ml-6">
                    These items have no price data yet. Scan receipts containing them to contribute!
                  </p>
                </div>
              </Card>
            )}

            {loading ? (
              <Card>
                <div className="flex items-center justify-center gap-2 py-6">
                  <Loader2
                    size={16}
                    className="text-neon animate-spin"
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs text-text-muted">
                    Comparing prices...
                  </span>
                </div>
              </Card>
            ) : merchants.length > 0 ? (
              <>
                {merchants.map((merchant, i) => {
                  const isCheapest = merchant.basket_total === cheapestTotal;
                  const coverage = Math.round(
                    (merchant.items_found / merchant.items_total) * 100
                  );

                  return (
                    <Card key={merchant.merchant_id} glow={isCheapest}>
                      <div className="space-y-3">
                        {/* Merchant header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {isCheapest ? (
                              <Trophy
                                size={14}
                                className="text-neon"
                                aria-hidden="true"
                              />
                            ) : (
                              <Store
                                size={14}
                                className="text-text-muted"
                                aria-hidden="true"
                              />
                            )}
                            <div>
                              <h4 className="font-mono text-sm text-text-primary">
                                {merchant.merchant_name}
                              </h4>
                              <p className="text-[10px] text-text-muted">
                                {merchant.area} · {merchant.merchant_type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-mono text-lg ${
                                isCheapest ? "text-neon" : "text-text-primary"
                              }`}
                            >
                              {formatPrice(merchant.basket_total)}
                            </div>
                            {isCheapest && i === 0 && (
                              <Badge variant="neon">CHEAPEST</Badge>
                            )}
                          </div>
                        </div>

                        {/* Coverage bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-surface rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${coverage}%`,
                                backgroundColor:
                                  coverage === 100
                                    ? "var(--color-neon)"
                                    : coverage >= 70
                                      ? "var(--color-orange)"
                                      : "var(--color-red)",
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-text-muted whitespace-nowrap">
                            {merchant.items_found}/{merchant.items_total} items
                          </span>
                        </div>

                        {/* Item breakdown */}
                        <div className="space-y-1 pt-1 border-t border-border">
                          {merchant.item_prices.map((item, j) => (
                            <div
                              key={j}
                              className="flex items-center justify-between"
                            >
                              <span className="text-[11px] text-text-secondary truncate mr-2">
                                {item.name}
                              </span>
                              <span className="font-mono text-[11px] text-text-primary shrink-0">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {/* Savings hint */}
                {merchants.length >= 2 && (
                  <div className="text-center">
                    <p className="font-mono text-[10px] text-text-muted">
                      You could save{" "}
                      <span className="text-neon">
                        {formatPrice(
                          Math.max(
                            ...merchants.map((m) => m.basket_total)
                          ) - cheapestTotal
                        )}
                      </span>{" "}
                      by shopping at the cheapest option
                    </p>
                  </div>
                )}
              </>
            ) : hasSearched ? (
              <Card>
                <div className="text-center py-6">
                  <p className="font-mono text-xs text-text-muted">
                    No price data found for {area}.
                  </p>
                  <p className="text-[10px] text-text-secondary mt-1">
                    Scan receipts from stores in {area} to contribute!
                  </p>
                </div>
              </Card>
            ) : null}
          </div>
        )}

        <div className="h-4" />
      </PageContainer>

      {/* Create template modal */}
      {showCreate && (
        <CreateTemplateModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}

/* ─── Create Template Modal ─── */

function CreateTemplateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (template: Template) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAddItem = () => {
    if (!itemName.trim()) return;
    setItems((prev) => [
      ...prev,
      { canonical_name: itemName.trim(), qty: itemQty },
    ]);
    setItemName("");
    setItemQty(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one item");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/basket/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, items }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create template");
      }

      const { template } = await res.json();
      onCreated(template);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-background border border-border rounded-xl shadow-xl max-h-[80vh] overflow-auto">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm text-neon uppercase tracking-wider">
              Create Basket Template
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Name & description */}
          <Input
            label="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. BBQ Night Essentials"
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Everything for a weekend BBQ"
          />

          {/* Add items */}
          <div>
            <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider mb-2">
              Items
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Item name e.g. Telur Ayam..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                />
              </div>
              <div className="w-16">
                <Input
                  type="number"
                  min={1}
                  value={itemQty}
                  onChange={(e) =>
                    setItemQty(Math.max(1, parseInt(e.target.value) || 1))
                  }
                />
              </div>
              <Button variant="ghost" size="sm" onClick={handleAddItem}>
                <Plus size={14} />
              </Button>
            </div>
          </div>

          {/* Item list */}
          {items.length > 0 && (
            <div className="space-y-1 p-2 rounded border border-border bg-surface/30">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-xs text-text-secondary truncate mr-2">
                    {item.canonical_name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-text-muted">
                      x{item.qty}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(i)}
                      className="p-0.5 text-text-muted hover:text-red transition-colors"
                      aria-label={`Remove ${item.canonical_name}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="font-mono text-[10px] text-red">{error}</p>
          )}

          {/* Submit */}
          <Button
            variant="neon"
            className="w-full"
            onClick={handleSubmit}
            loading={submitting}
            disabled={submitting}
          >
            Create Template ({items.length} items)
          </Button>
        </div>
      </div>
    </div>
  );
}
