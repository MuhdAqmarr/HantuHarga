import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { GhostMeter } from "@/components/features/GhostMeter";
import { MerchantBadge } from "@/components/features/MerchantBadge";
import { TopBar } from "@/components/layout/TopBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { TrendingDown, BarChart3, MapPin } from "lucide-react";
import type { PriceStats } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any)
    .from("canonical_items")
    .select("name")
    .eq("id", id)
    .single() as { data: { name: string } | null };

  if (!item) return { title: "Item Not Found" };
  return {
    title: item.name,
    description: `Track the price of ${item.name} across Malaysian supermarkets. See real community-reported prices.`,
  };
}

export default async function ItemPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("canonical_items")
    .select("id, name, category")
    .eq("id", id)
    .single();

  if (itemError || !item) {
    console.error("Item fetch error:", itemError);
    notFound();
  }

  // Fetch stats
  const { data: statsArr, error: statsError } = await supabase.rpc(
    "get_price_stats",
    { p_canonical_item_id: id, p_days_back: 90 }
  );

  if (statsError) {
    console.error("get_price_stats RPC error:", statsError);
  }

  const stats = (statsArr?.[0] as PriceStats | undefined) || null;
  const hasData = stats && stats.observation_count > 0;

  // Fetch cheapest merchants
  const { data: merchants, error: merchantsError } = await supabase.rpc(
    "get_cheapest_merchants",
    { p_canonical_item_id: id, p_days_back: 90, p_limit: 5 }
  );

  if (merchantsError) {
    console.error("get_cheapest_merchants RPC error:", JSON.stringify(merchantsError));
  }

  return (
    <>
      <TopBar title="ITEM INTEL" showBack />
      <PageContainer className="space-y-6 pt-4">
        {/* Item header */}
        <div>
          <h2 className="font-mono text-lg font-bold text-text-primary">
            {item.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{item.category}</Badge>
            {hasData && (
              <span className="text-[10px] font-mono text-text-muted">
                {stats.observation_count} reports
              </span>
            )}
          </div>
        </div>

        {hasData ? (
          <>
            {/* Ghost Meter */}
            <Card glow>
              <GhostMeter
                stats={stats}
                currentPrice={stats.latest_price}
                label={item.name}
              />
            </Card>

            {/* Price Summary */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3
                  size={14}
                  className="text-neon"
                  aria-hidden="true"
                />
                <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
                  Price Summary (90 days)
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="font-mono text-lg text-neon">
                    {formatPrice(stats.min_price)}
                  </div>
                  <div className="text-[10px] font-mono text-text-muted">
                    Lowest
                  </div>
                </div>
                <div>
                  <div className="font-mono text-lg text-text-primary">
                    {formatPrice(stats.median_price)}
                  </div>
                  <div className="text-[10px] font-mono text-text-muted">
                    Median
                  </div>
                </div>
                <div>
                  <div className="font-mono text-lg text-orange-bright">
                    {formatPrice(stats.max_price)}
                  </div>
                  <div className="text-[10px] font-mono text-text-muted">
                    Highest
                  </div>
                </div>
              </div>
            </Card>

            {/* Cheapest Merchants */}
            {merchants && merchants.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown
                    size={14}
                    className="text-neon"
                    aria-hidden="true"
                  />
                  <h3 className="font-mono text-xs text-neon uppercase tracking-wider">
                    Cheapest Intel
                  </h3>
                </div>
                <div className="space-y-3">
                  {merchants.map(
                    (
                      m: {
                        merchant_id: string;
                        merchant_name: string;
                        merchant_type: string;
                        area: string;
                        min_price: number;
                        avg_price: number;
                        sample_count: number;
                      },
                      i: number
                    ) => (
                      <div
                        key={m.merchant_id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-text-muted w-4">
                            {i + 1}.
                          </span>
                          <div>
                            <MerchantBadge
                              name={m.merchant_name}
                              type={m.merchant_type}
                            />
                            <div className="flex items-center gap-1 mt-0.5 ml-6">
                              <MapPin
                                size={10}
                                className="text-text-muted"
                                aria-hidden="true"
                              />
                              <span className="text-[10px] font-mono text-text-muted">
                                {m.area} · {m.sample_count} reports
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm text-neon">
                            {formatPrice(m.min_price)}
                          </div>
                          <div className="text-[10px] font-mono text-text-muted">
                            lowest
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <div className="py-8 text-center space-y-2">
              <div className="font-mono text-sm text-text-muted">
                [ NO INTEL AVAILABLE ]
              </div>
              <p className="text-text-secondary text-sm">
                No price data yet. Scan a receipt containing this item to be the
                first contributor!
              </p>
            </div>
          </Card>
        )}
      </PageContainer>
    </>
  );
}
