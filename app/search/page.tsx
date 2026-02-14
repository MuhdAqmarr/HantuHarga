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

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;

  return (
    <>
      <TopBar title="PRICE SEARCH" />
      <PageContainer>
        <Suspense>
          <SearchBar />
        </Suspense>
        <Suspense
          key={q || "__browse"}
          fallback={
            <div className="space-y-3 pt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <SearchResults query={q} />
        </Suspense>
      </PageContainer>
    </>
  );
}

async function SearchResults({ query }: { query?: string }) {
  const supabase = await createClient();

  if (query && query.trim().length > 0) {
    // Search via trigram RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("search_items", {
      p_query: query.trim(),
      p_limit: 30,
      p_offset: 0,
    });

    // Fallback to ILIKE if trigram not available
    let items = data as { id: string; name: string; category: string; similarity: number }[] | null;
    if (error || !items) {
      const { data: fallback } = await supabase
        .from("canonical_items")
        .select("id, name, category")
        .ilike("name", `%${query.trim()}%`)
        .limit(30);
      items = (fallback || []).map((i) => ({ ...i, similarity: 0 }));
    }

    if (!items || items.length === 0) {
      return (
        <div className="py-12 text-center">
          <div className="font-mono text-sm text-text-muted">
            [ NO RESULTS FOR &quot;{query}&quot; ]
          </div>
          <p className="text-text-secondary text-sm mt-2">
            Try a different search term or scan a receipt to add new items.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2 pt-2">
        <div className="font-mono text-[10px] text-text-muted uppercase tracking-wider px-1">
          Results for &quot;{query}&quot; ({items.length})
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

  // No query — browse all items
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
