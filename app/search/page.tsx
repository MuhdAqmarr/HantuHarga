import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchBar } from "@/components/features/SearchBar";
import { ItemCard } from "@/components/features/ItemCard";
import { ItemCardSkeleton } from "@/components/ui/Skeleton";
import { TopBar } from "@/components/layout/TopBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Search Prices",
  description:
    "Search real grocery prices across Malaysia. Community-verified price data.",
};

export default function SearchPage() {
  return (
    <>
      <TopBar title="PRICE SEARCH" />
      <PageContainer>
        <Suspense>
          <SearchBar />
        </Suspense>
        <Suspense
          fallback={
            <div className="space-y-3 pt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </PageContainer>
    </>
  );
}

async function SearchResults() {
  const supabase = await createClient();

  // Show popular items by default
  const { data: items } = await supabase
    .from("canonical_items")
    .select("id, name, category")
    .order("name")
    .limit(30);

  if (!items || items.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="font-mono text-sm text-text-muted">
          [ NO ITEMS IN DATABASE ]
        </div>
        <p className="text-text-secondary text-sm mt-2">
          Be the first to scan a receipt and contribute!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider px-1">
        Browse Items ({items.length})
      </div>
      {items.map((item) => (
        <ItemCard
          key={item.id}
          id={item.id}
          name={item.name}
          category={item.category}
        />
      ))}
    </div>
  );
}
